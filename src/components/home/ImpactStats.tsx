import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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

const Stat = ({ value, label, suffix, start }: { value: number; label: string; suffix?: string; start: boolean }) => {
  const v = useCount(value, start);
  const { fmt } = useLocaleNum();
  return (
    <div className="group relative p-6 md:p-8 rounded-3xl bg-secondary/30 border border-primary/5 hover:border-primary/20 hover:bg-secondary/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
      <div className="text-3xl md:text-4xl font-extrabold gradient-donate-text mb-2 transition-transform duration-500 group-hover:scale-110">
        {fmt(v)}
        <span className="text-donate-highlight">{suffix || ""}</span>
      </div>
      <div className="text-xs md:text-sm text-muted-foreground font-bold uppercase tracking-wider group-hover:text-primary transition-colors">{label}</div>
    </div>
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
    <section className="py-12 md:py-16 relative overflow-hidden bg-background">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div ref={ref} className="container-page relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          {section.eyebrow && (
            <span className="eyebrow bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-3">
              {section.eyebrow}
            </span>
          )}
          <h2 className="text-xl md:text-2xl font-bold leading-tight text-foreground">
            {section.heading || t("impact.heading")}
          </h2>
          { (section.subtitle || t("impact.subtitle")) && (
            <p className="mt-3 text-sm md:text-base text-muted-foreground/80 max-w-xl mx-auto">
              {section.subtitle || t("impact.subtitle")}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {impactStats.map((s) => (
            <Stat key={s.label} {...s} start={start} />
          ))}
        </div>
      </div>
    </section>
  );
};
