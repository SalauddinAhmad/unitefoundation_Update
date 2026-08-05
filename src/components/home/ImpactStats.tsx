import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useSettings } from "@/hooks/api/useDashboardData";
import { useLocaleNum } from "@/hooks/useLocaleNum";

const useCount = (target: number, start: boolean, duration = 1600) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startT = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - startT) / duration);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return v;
};

const Stat = ({ value, label, suffix, start, index }: { value: number; label: string; suffix?: string; start: boolean; index: number }) => {
  const v = useCount(value, start);
  const { fmt } = useLocaleNum();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative p-6 md:p-8 rounded-[2rem] bg-white dark:bg-card shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none border border-border/40 hover:border-primary/40 transition-all duration-700 hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.15)] hover:-translate-y-2 overflow-hidden flex flex-col justify-center min-h-[160px]"
    >
      {/* Glow Effect on Hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-donate-highlight/20 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-500" />
      
      <div className="relative flex flex-col items-center">
        <div className="text-3xl md:text-4xl font-black gradient-donate-text mb-2 tracking-tight">
          {fmt(v)}
          <span className="text-donate-highlight ml-0.5">{suffix || ""}</span>
        </div>
        <div className="text-[10px] md:text-xs text-muted-foreground font-black uppercase tracking-[0.2em] text-center group-hover:text-primary transition-colors duration-300">
          {label}
        </div>
      </div>
    </motion.div>
  );
};

export const ImpactStats = () => {
  const { t } = useTranslation();
  const { data: settings } = useSettings();
  const impactStats = settings?.impact_stats || [];
  const section = settings?.impact_section || {};
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setStart(true),
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-slate-50/50 dark:bg-secondary/10">
      {/* Advanced Geometric Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-donate-highlight/5 rounded-full blur-[120px] translate-y-1/2" />
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div ref={ref} className="container-page relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            {/* Removed eyebrow badge as requested */}
          </motion.div>
          
          <h2 className="text-2xl md:text-4xl font-black leading-tight text-foreground tracking-tight mb-4">
            {section.heading || t("impact.heading")}
          </h2>
          
          { (section.subtitle || t("impact.subtitle")) && (
            <p className="text-sm md:text-lg text-muted-foreground/80 font-medium leading-relaxed max-w-2xl mx-auto">
              {section.subtitle || t("impact.subtitle")}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {impactStats.map((s, idx) => (
            <Stat key={s.label} {...s} start={start} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};
