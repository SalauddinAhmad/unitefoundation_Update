import { HandCoins, Users2, HeartHandshake, FolderKanban, Plus, Download, Calendar, TrendingUp, Activity, FileText, Inbox, Briefcase, Eye, CalendarDays } from "lucide-react";
import { Card, KpiCard, PageHeader, SectionHeader, StatusBadge, Btn } from "@/components/dashboard/DashboardUI";
import { kpis, donationTrend, channelSplit, donations, volunteerApps, recentActivity, projects } from "@/data/dashboardMock";
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type VisitorTotals = { total: number; today: number; week: number; month: number };
const bn = (n: number) => n.toLocaleString("bn-BD");

const VisitorStrip = () => {
  const [t, setT] = useState<VisitorTotals | null>(null);
  const [trend, setTrend] = useState<{ day: string; visits: number }[]>([]);
  useEffect(() => {
    api.get<VisitorTotals>("/stats/visits", { auth: false }).then(setT).catch(() => {});
    api.get<{ day: string; visits: number }[]>("/stats/visits-trend").then((r) =>
      setTrend(r.map((x) => ({ day: String(x.day).slice(5), visits: Number(x.visits) })))
    ).catch(() => {});
  }, []);
  const items = [
    { icon: Eye, label: "মোট ভিজিটর", value: t?.total ?? 0 },
    { icon: Users2, label: "আজ", value: t?.today ?? 0 },
    { icon: CalendarDays, label: "গত ৭ দিন", value: t?.week ?? 0 },
    { icon: TrendingUp, label: "গত ৩০ দিন", value: t?.month ?? 0 },
  ];
  return (
    <Card className="mb-6">
      <SectionHeader title="ভিজিটর পরিসংখ্যান" action={<span className="text-xs text-muted-foreground">Live</span>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {items.map((it) => (
          <div key={it.label} className="rounded-xl bg-secondary/60 px-4 py-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-card text-primary flex items-center justify-center">
              <it.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{it.label}</div>
              <div className="text-lg font-black tabular-nums">{t ? bn(it.value) : "—"}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={30} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="visits" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gv)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const icons = { donations: HandCoins, donors: Users2, volunteers: HeartHandshake, projects: FolderKanban };

const Overview = () => {
  return (
    <>
      <PageHeader
        title="স্বাগতম, এডমিন 👋"
        subtitle="আজ আপনার ফাউন্ডেশনের সকল কার্যক্রমের সারসংক্ষেপ"
        actions={
          <>
            <Btn variant="outline"><Calendar className="h-4 w-4" /> এই মাস</Btn>
            <Btn variant="outline"><Download className="h-4 w-4" /> এক্সপোর্ট</Btn>
            <Btn><Plus className="h-4 w-4" /> নতুন প্রকল্প</Btn>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {kpis.map((k, i) => (
          <KpiCard
            key={k.key}
            label={k.label}
            value={k.value}
            delta={k.delta}
            trend={k.trend as "up" | "down" | "flat"}
            note={k.note}
            icon={icons[k.key as keyof typeof icons]}
            highlight={i === 0}
          />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Donation trend */}
        <Card className="lg:col-span-2">
          <SectionHeader
            title="সাপ্তাহিক দান প্রবাহ"
            action={
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span>+১৮% গত সপ্তাহ থেকে</span>
              </div>
            }
          />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={donationTrend} margin={{ left: -8, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => [`৳ ${v.toLocaleString()}`, "দান"]}
                />
                <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#gd)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment channel split */}
        <Card>
          <SectionHeader title="পেমেন্ট মাধ্যম" />
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={channelSplit} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={2}>
                  {channelSplit.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number, n) => [`${v}%`, n]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {channelSplit.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="text-foreground/80">{c.name}</span>
                </div>
                <span className="font-bold tabular-nums">{c.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Second row: recent donations + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2" pad={false}>
          <div className="p-5 md:p-6 pb-3">
            <SectionHeader title="সাম্প্রতিক দান" action={<a href="/dashboard/donations" className="text-xs font-bold text-primary hover:underline">সব দেখুন →</a>} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-y border-border bg-muted/40">
                  <th className="font-semibold px-6 py-2.5">দাতা</th>
                  <th className="font-semibold py-2.5">পরিমাণ</th>
                  <th className="font-semibold py-2.5">মাধ্যম</th>
                  <th className="font-semibold py-2.5">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {donations.slice(0, 6).map((d) => (
                  <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-semibold">{d.name}</div>
                      <div className="text-xs text-muted-foreground">{d.area}</div>
                    </td>
                    <td className="py-3 font-bold tabular-nums">৳ {d.amount.toLocaleString()}</td>
                    <td className="py-3 text-foreground/70">{d.method}</td>
                    <td className="py-3"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <SectionHeader title="সাম্প্রতিক কার্যক্রম" />
          <ul className="space-y-4">
            {recentActivity.map((a, i) => {
              const Icon = a.type === "donation" ? HandCoins : a.type === "volunteer" ? Users2 : a.type === "member" ? HeartHandshake : a.type === "post" ? FileText : Inbox;
              return (
                <li key={i} className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-accent text-primary flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground/90 leading-snug">{a.text}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{a.time}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* Third row: project progress + pending applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <SectionHeader
            title="প্রকল্পের অগ্রগতি"
            action={<a href="/dashboard/projects" className="text-xs font-bold text-primary hover:underline">ম্যানেজ করুন →</a>}
          />
          <div className="space-y-4">
            {projects.slice(0, 4).map((p) => {
              const pct = Math.round((p.raised / p.budget) * 100);
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.category} · {p.beneficiaries.toLocaleString()} উপকারভোগী</div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="font-bold tabular-nums">৳ {(p.raised / 100000).toFixed(1)}L</div>
                      <div className="text-xs text-muted-foreground">/ ৳ {(p.budget / 100000).toFixed(1)}L</div>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="অপেক্ষমাণ আবেদন"
            action={<a href="/dashboard/volunteers" className="text-xs font-bold text-primary hover:underline">দেখুন →</a>}
          />
          <ul className="space-y-3">
            {volunteerApps.slice(0, 4).map((v) => (
              <li key={v.id} className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/60 transition-colors">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {v.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{v.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{v.type}</div>
                </div>
                <StatusBadge status={v.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
};

export default Overview;
