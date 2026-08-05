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
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] rotate-3 group-hover:rotate-0 transition-transform duration-500" />
      <div className="relative p-8 md:p-10 rounded-[2.5rem] bg-white dark:bg-card border-2 border-primary/10 hover:border-primary transition-all duration-500 flex flex-col items-center justify-center min-h-[180px] shadow-sm hover:shadow-xl">
        <div className="text-4xl md:text-5xl font-black text-primary mb-3 flex items-baseline tracking-tighter">
          {fmt(v)}
          <span className="text-xl md:text-2xl ml-1 opacity-70">{suffix || ""}</span>
        </div>
        <div className="h-1 w-8 bg-primary/20 rounded-full mb-4 group-hover:w-16 transition-all duration-500" />
        <div className="text-xs md:text-sm text-muted-foreground font-bold uppercase tracking-widest text-center">
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
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
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
