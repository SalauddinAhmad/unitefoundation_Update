import { useEffect, useRef, useState } from "react";
import { impactStats } from "@/data/impact";
import { toBnNum } from "@/data/projects";

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

const Stat = ({ value, label, suffix, start }: { value: number; label: string; suffix: string; start: boolean }) => {
  const v = useCount(value, start);
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-extrabold gradient-donate-text">
        {toBnNum(new Intl.NumberFormat("en-IN").format(v))}
        <span className="text-donate-highlight">{suffix}</span>
      </div>
      <div className="mt-2 text-sm md:text-base text-muted-foreground font-medium">{label}</div>
    </div>
  );
};

export const ImpactStats = () => {
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
          <span className="eyebrow">আমাদের প্রভাব</span>
          <h2 className="heading-display mt-3">আপনাদের বিশ্বাসেই গড়ে উঠেছে এই অর্জন</h2>
          <p className="mt-4 text-muted-foreground">
            ১৫ বছরের যাত্রায় লক্ষাধিক মানুষের জীবনে পরিবর্তন এনেছেন আপনারা।
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
