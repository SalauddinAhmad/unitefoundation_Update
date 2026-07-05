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
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-extrabold gradient-donate-text">
        {fmt(v)}
        <span className="text-donate-highlight">{suffix || ""}</span>
      </div>
      <div className="mt-2 text-sm md:text-base text-muted-foreground font-medium">{label}</div>
    </div>
  );
};

export const ImpactStats = () => {
  const { t } = useTranslation();
  const { data: settings } = useSettings();
  const impactStats = settings?.impact_stats || [];
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
    <section className="section-y bg-background">
      <div ref={ref} className="container-page">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">{t("impact.eyebrow")}</span>
          <h2 className="heading-display mt-3">{t("impact.heading")}</h2>
          <p className="mt-4 text-muted-foreground">
            {t("impact.subtitle")}
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {impactStats.map((s) => (
            <Stat key={s.label} {...s} start={start} />
          ))}
        </div>
      </div>
    </section>
  );
};
