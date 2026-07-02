import { useEffect, useState } from "react";

import { Eye, Users, CalendarDays, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";

type Totals = { total: number; today: number; week: number; month: number };

const bn = (n: number) => n.toLocaleString("bn-BD");

export const VisitorCounter = () => {
  const [t, setT] = useState<Totals | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const counted = sessionStorage.getItem("uf_visit_counted") === "1";
        const data = counted
          ? await api.get<Totals>("/stats/visits", { auth: false })
          : await api.post<Totals>("/stats/visit", undefined, { auth: false });
        if (!counted) sessionStorage.setItem("uf_visit_counted", "1");
        if (!cancelled) setT(data);
      } catch {
        /* silent */
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const items = [
    { icon: Eye, label: "মোট ভিজিটর", value: t?.total ?? 0, tone: "text-primary" },
    { icon: Users, label: "আজ", value: t?.today ?? 0, tone: "text-emerald-600" },
    { icon: CalendarDays, label: "গত ৭ দিন", value: t?.week ?? 0, tone: "text-amber-600" },
    { icon: TrendingUp, label: "গত ৩০ দিন", value: t?.month ?? 0, tone: "text-blue-600" },
  ];

  return (
    <section className="py-10 bg-secondary/30 border-y border-border/60">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-5">
            <p className="text-[11px] font-bold tracking-[0.2em] text-primary uppercase">Live Visitors</p>
            <h3 className="text-lg sm:text-xl font-black mt-1">আমাদের সাইটে ভিজিটর পরিসংখ্যান</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {items.map((it) => (
              <div
                key={it.label}
                className="rounded-xl bg-card border border-border px-4 py-3.5 flex items-center gap-3 shadow-sm"
              >
                <div className={`h-9 w-9 rounded-lg bg-secondary flex items-center justify-center ${it.tone}`}>
                  <it.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                    {it.label}
                  </div>
                  <div className="text-lg font-black tabular-nums">
                    {t ? bn(it.value) : "—"}
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
