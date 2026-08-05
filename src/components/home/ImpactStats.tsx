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
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative p-3 md:p-5 rounded-xl bg-white dark:bg-card border border-primary/10 hover:border-primary/30 transition-all duration-300 flex flex-col items-center justify-center min-h-[90px] md:min-h-[110px] shadow-sm"
    >
      <div className="text-xl md:text-2xl font-black text-primary mb-0.5 flex items-baseline tracking-tight leading-none">
        {fmt(v)}
        <span className="text-[10px] md:text-sm ml-0.5 opacity-80 font-bold">{suffix || ""}</span>
      </div>
      <div className="text-[9px] md:text-[11px] text-muted-foreground font-bold uppercase tracking-wider text-center line-clamp-1">
        {label}
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
    <section className="py-10 md:py-16 relative overflow-hidden bg-slate-50/50 dark:bg-secondary/10">
      {/* Advanced Geometric Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div ref={ref} className="container-page relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            {/* Removed eyebrow badge as requested */}
          </motion.div>
          
          <h2 className="text-xl md:text-2xl font-bold leading-tight text-foreground tracking-tight mb-4">
            {section.heading || t("impact.heading")}
          </h2>
          
          { (section.subtitle || t("impact.subtitle")) && (
            <p className="text-sm md:text-lg text-muted-foreground/80 font-medium leading-relaxed max-w-2xl mx-auto">
              {section.subtitle || t("impact.subtitle")}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {impactStats.map((s, idx) => (
            <Stat key={s.label} {...s} start={start} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};
