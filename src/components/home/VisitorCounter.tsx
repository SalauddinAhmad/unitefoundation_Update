import { useEffect, useState } from "react";
import { Eye, Users, CalendarDays, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { useLocaleNum } from "@/hooks/useLocaleNum";

type Totals = { total: number; today: number; week: number; month: number };

export const VisitorCounter = () => {
  const { t } = useTranslation();
  const { fmt } = useLocaleNum();
  const [tot, setTot] = useState<Totals | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const counted = sessionStorage.getItem("uf_visit_counted") === "1";
        const data = counted
          ? await api.get<Totals>("/stats/visits", { auth: false })
          : await api.post<Totals>("/stats/visit", undefined, { auth: false });
        if (!counted) sessionStorage.setItem("uf_visit_counted", "1");
        if (!cancelled) setTot(data);
      } catch {
        /* silent */
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const items = [
    { icon: Eye, label: t("visitor.total"), value: tot?.total ?? 0 },
    { icon: Users, label: t("visitor.today"), value: tot?.today ?? 0 },
    { icon: CalendarDays, label: t("visitor.week"), value: tot?.week ?? 0 },
    { icon: TrendingUp, label: t("visitor.month"), value: tot?.month ?? 0 },
  ];

  return (
    <section className="relative py-14 overflow-hidden border-y border-border/60">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-background to-secondary/30" />
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.10), transparent 45%), radial-gradient(circle at 85% 80%, hsl(var(--primary) / 0.08), transparent 40%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      <div className="relative container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center mb-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-[11px] font-bold tracking-[0.22em] text-primary uppercase">
                {t("visitor.liveLabel")}
              </span>
            </div>
            <h3 className="mt-3 text-xl sm:text-2xl font-black tracking-tight">
              {t("visitor.heading")}
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-md">
              {t("visitor.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {items.map((it, i) => (
              <div
                key={it.label}
                className="group relative rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm px-5 py-5 shadow-[0_1px_0_hsl(var(--foreground)/0.03),0_10px_30px_-18px_hsl(var(--primary)/0.35)] hover:shadow-[0_1px_0_hsl(var(--foreground)/0.03),0_18px_40px_-18px_hsl(var(--primary)/0.55)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15 flex items-center justify-center text-primary">
                    <it.icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em]">
                    {it.label}
                  </div>
                </div>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <div className="text-3xl font-black tabular-nums tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {tot ? fmt(it.value) : "—"}
                  </div>
                  <div className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                    {i === 1 ? t("visitor.unitVisits") : t("visitor.unitPeople")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisitorCounter;
