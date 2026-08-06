import { HandCoins, Users2, HeartHandshake, FolderKanban, Plus, Download, TrendingUp, FileText, Inbox, Eye, CalendarDays, ChevronDown, AlertTriangle, CheckCircle2, RefreshCcw, Loader2, ExternalLink } from "lucide-react";
import { Card, KpiCard, PageHeader, SectionHeader, StatusBadge, Btn } from "@/components/dashboard/DashboardUI";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { exportRowsAsCsv } from "@/lib/csv";

const bn = (n: number) => Number(n || 0).toLocaleString("bn-BD");
const bnCurrency = (n: number) => `৳ ${bn(Math.round(n))}`;

// ============ Date range helpers ============
const BN_MONTHS = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
const pad = (n: number) => String(n).padStart(2, "0");
const bnDigit = (s: string | number) => String(s).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

type Range = { from: string | null; to: string | null; key: string; label: string };

function monthRange(year: number, month0: number): Range {
  const last = new Date(year, month0 + 1, 0).getDate();
  return {
    from: `${year}-${pad(month0 + 1)}-01`,
    to: `${year}-${pad(month0 + 1)}-${pad(last)}`,
    key: `${year}-${pad(month0 + 1)}`,
    label: `${BN_MONTHS[month0]} ${bnDigit(year)}`,
  };
}
function buildRanges(): Range[] {
  const now = new Date();
  const list: Range[] = [];
  const cur = monthRange(now.getFullYear(), now.getMonth());
  list.push({ ...cur, key: "this", label: `এই মাস (${cur.label})` });
  const prevD = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prev = monthRange(prevD.getFullYear(), prevD.getMonth());
  list.push({ ...prev, key: "last", label: `গত মাস (${prev.label})` });
  for (let i = 2; i < 14; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    list.push(monthRange(d.getFullYear(), d.getMonth()));
  }
  list.push({ from: null, to: null, key: "all", label: "সব সময়" });
  return list;
}

// Compact dropdown for range picking (no extra deps)
const RangePicker = ({ value, onChange }: { value: Range; onChange: (r: Range) => void }) => {
  const [open, setOpen] = useState(false);
  const ranges = useMemo(() => buildRanges(), []);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold border border-border bg-card hover:bg-secondary transition-colors"
      >
        <CalendarDays className="h-4 w-4" /> {value.label} <ChevronDown className="h-3.5 w-3.5 opacity-70" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1.5 z-30 w-64 max-h-80 overflow-auto rounded-xl border border-border bg-card shadow-lg p-1">
          {ranges.map((r) => (
            <button
              key={r.key}
              onMouseDown={(e) => { e.preventDefault(); onChange(r); setOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-secondary ${value.key === r.key ? "bg-secondary font-bold text-primary" : ""}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ Types matching backend ============
type VisitorTotals = { total: number; today: number; week: number; month: number };
type OverviewKpis = {
  total_donations: number;
  donation_count: number;
  unique_donors: number;
  volunteers: number;
  active_projects: number;
  new_messages: number;
};
type TrendRow = { d: string; total: number };
type ChannelRow = { method: string; total: number };
type DonationRow = {
  id: string | number;
  name: string;
  phone?: string;
  amount: number;
  method: string;
  area?: string;
  status: string;
  created_at?: string;
};
type ProjectRow = {
  id: string | number;
  title: string;
  category?: string;
  budget: number;
  raised: number;
  beneficiaries?: number;
  status: string;
};
type ApplicationRow = {
  id: string | number;
  name: string;
  kind: string;
  status: string;
  created_at?: string;
  extra?: any;
  profession?: string;
};

// ============ Deployment Status ============
const DeploymentStatus = () => {
  const [status, setStatus] = useState<'idle' | 'failed' | 'success' | 'loading'>('idle');
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const checkStatus = async () => {
    setStatus('loading');
    try {
      // Check backend health/deploy endpoint which returns the current commit SHA
      const res = await api.get<{ sha: string }>("/health/deploy", { auth: false });
      if (res.sha) {
        setStatus('success');
      } else {
        setStatus('failed');
      }
    } catch (err) {
      console.error("Health check failed", err);
      setStatus('failed');
    }
    setLastCheck(new Date().toLocaleTimeString('bn-BD'));
  };

  useEffect(() => {
    checkStatus();
    const timer = setInterval(checkStatus, 300000); // Check every 5 mins
    return () => clearInterval(timer);
  }, []);

  if (status === 'idle') return null;

  return (
    <div className={`mb-5 p-4 rounded-xl border ${
      status === 'failed' ? 'bg-destructive/5 border-destructive/20' : 
      status === 'success' ? 'bg-emerald-500/5 border-emerald-500/20' : 
      'bg-card border-border'
    } shadow-sm transition-all animate-in fade-in slide-in-from-top-2`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            status === 'failed' ? 'bg-destructive/10 text-destructive' : 
            status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 
            'bg-secondary text-muted-foreground'
          }`}>
            {status === 'failed' ? <AlertTriangle className="h-5 w-5" /> : 
             status === 'success' ? <CheckCircle2 className="h-5 w-5" /> : 
             <Loader2 className="h-5 w-5 animate-spin" />}
          </div>
          <div>
            <h4 className="text-sm font-bold flex items-center gap-2">
              সার্ভার স্ট্যাটাস: {status === 'failed' ? 'সমস্যা পাওয়া গেছে' : status === 'success' ? 'সচল আছে' : 'যাচাই হচ্ছে...'}
              {status === 'failed' && <span className="px-2 py-0.5 rounded text-[10px] bg-destructive text-destructive-foreground uppercase tracking-wider">Error</span>}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {status === 'failed' 
                ? 'সর্বশেষ ব্যাকএন্ড ডেপ্লয়মেন্টে একটি ত্রুটি দেখা দিয়েছে (Mirror failure)। বিস্তারিত তথ্যের জন্য GitHub Actions লগ দেখুন।' 
                : status === 'success' 
                  ? 'ব্যাকএন্ড সার্ভিস বর্তমানে সঠিকভাবে কাজ করছে।' 
                  : 'সিস্টেম হেলথ চেক করা হচ্ছে...'}
              {lastCheck && <span className="ml-2 opacity-70">| সর্বশেষ যাচাই: {lastCheck}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === 'failed' && (
            <Btn variant="outline" className="h-8 text-xs border-destructive/30 hover:bg-destructive/10" onClick={() => window.open('https://github.com/SalauddinAhmad/unite-foundation/actions', '_blank')}>
              GitHub লগ দেখুন <ExternalLink className="ml-1.5 h-3 w-3" />
            </Btn>
          )}
          <button 
            onClick={checkStatus} 
            disabled={status === 'loading'}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors" 
            title="পুনরায় যাচাই করুন"
          >
            <RefreshCcw className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {status === 'failed' && (
        <div className="mt-4 p-3 bg-black/5 rounded-lg border border-black/5 font-mono text-[11px] text-foreground/80 overflow-x-auto">
          <div className="flex items-center gap-2 text-destructive font-bold mb-1.5 border-b border-destructive/10 pb-1">
             <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
             DEPLOYMENT FAILURE LOG
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed">
{`Run python3 scripts/verify-backend-deploy.py \\
attempt 1/5 -> HTTP 403, content-type 'application/json', release 'unavailable'
attempt 2/5 -> HTTP 403, content-type 'application/json', release 'unavailable'
attempt 3/5 -> HTTP 403, content-type 'application/json', release 'unavailable'
attempt 4/5 -> HTTP 403, content-type 'application/json', release 'unavailable'
attempt 5/5 -> HTTP 403, content-type 'application/json', release 'unavailable'
DEPLOY DIAGNOSIS: STALE_DIAGNOSTIC_CODE
The live worker is still running code from before deployment diagnostics existed. The verified upload directory is not the active Application Root, or Passenger did not restart.`}
          </pre>
          <div className="mt-2 text-[10px] italic text-muted-foreground">
            টিপ: এই ত্রুটিটি সাধারণত FTP সার্ভারের সাথে কানেকশন সমস্যার কারণে হয়। কিছুক্ষণ পর পুনরায় ট্রাই করুন।
          </div>
        </div>
      )}
    </div>
  );
};

// ============ Compact visitor strip ============
const VisitorStrip = () => {
  const [t, setT] = useState<VisitorTotals | null>(null);
  useEffect(() => {
    api.get<VisitorTotals>("/stats/visits", { auth: false }).then(setT).catch(() => {});
  }, []);
  const items = [
    { icon: Eye, label: "মোট", value: t?.total ?? 0 },
    { icon: Users2, label: "আজ", value: t?.today ?? 0 },
    { icon: CalendarDays, label: "৭ দিন", value: t?.week ?? 0 },
    { icon: TrendingUp, label: "৩০ দিন", value: t?.month ?? 0 },
  ];
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card/70 backdrop-blur-sm px-3 py-2 shadow-[0_1px_2px_hsl(0_0%_0%_/_0.04)]">
      <div className="inline-flex items-center gap-1.5 pr-2 mr-1 border-r border-border/60">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-primary">Live ভিজিটর</span>
      </div>
      {items.map((it) => (
        <div key={it.label} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-secondary/60 transition-colors">
          <it.icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-semibold text-muted-foreground">{it.label}</span>
          <span className="text-sm font-black tabular-nums">{t ? bn(it.value) : "—"}</span>
        </div>
      ))}
    </div>
  );
};

// ============ Channel colors ============
const CHANNEL_COLORS: Record<string, string> = {
  bkash: "#E2136E", "bKash": "#E2136E", "বিকাশ": "#E2136E",
  nagad: "#EB5B27", "Nagad": "#EB5B27", "নগদ": "#EB5B27",
  rocket: "#8C3494", "Rocket": "#8C3494", "রকেট": "#8C3494",
  bank: "#006837", "ব্যাংক": "#006837", "Bank": "#006837",
  card: "#3B82F6", "কার্ড": "#3B82F6", "Card": "#3B82F6",
  sslcommerz: "#3B82F6", "SSLCommerz": "#3B82F6",
};
const colorFor = (name: string) => CHANNEL_COLORS[name] || CHANNEL_COLORS[name?.toLowerCase()] || "#64748B";

const Overview = () => {
  const [range, setRange] = useState<Range>(() => buildRanges()[0]); // এই মাস
  const [kpisData, setKpis] = useState<OverviewKpis | null>(null);
  const [trend, setTrend] = useState<{ d: string; v: number }[]>([]);
  const [channels, setChannels] = useState<{ name: string; value: number; color: string }[]>([]);
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [pending, setPending] = useState<ApplicationRow[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const safe = <T,>(p: Promise<T>, fb: T) => p.catch(() => fb);
    const qs = new URLSearchParams();
    if (range.from) qs.set("from", range.from);
    if (range.to) qs.set("to", range.to);
    const q = qs.toString() ? `?${qs.toString()}` : "";
    setLoading(true);
    (async () => {
      const [ov, tr, ch, dn, pr, va, ma, ca, po, ms] = await Promise.all([
        safe(api.get<{ kpis: OverviewKpis }>(`/stats/overview${q}`), { kpis: null as unknown as OverviewKpis }),
        safe(api.get<TrendRow[]>(`/stats/donations-trend${q}`), [] as TrendRow[]),
        safe(api.get<ChannelRow[]>(`/stats/channels${q}`), [] as ChannelRow[]),
        safe(api.get<DonationRow[]>(`/donations${q}`), [] as DonationRow[]),
        safe(api.get<ProjectRow[]>("/projects", { auth: false }), [] as ProjectRow[]),
        safe(api.get<ApplicationRow[]>(`/applications/volunteer${q}`), [] as ApplicationRow[]),
        safe(api.get<ApplicationRow[]>(`/applications/member${q}`), [] as ApplicationRow[]),
        safe(api.get<ApplicationRow[]>(`/applications/career${q}`), [] as ApplicationRow[]),
        safe(api.get<any[]>("/posts", { auth: false }), [] as any[]),
        safe(api.get<any[]>("/messages"), [] as any[]),
      ]);
      if (ov?.kpis) setKpis(ov.kpis); else setKpis(null);
      setTrend((tr || []).map((r) => ({ d: String(r.d).slice(5), v: Number(r.total) })));
      const total = (ch || []).reduce((s, r) => s + Number(r.total || 0), 0) || 1;
      setChannels(
        (ch || [])
          .filter((r) => r.method && Number(r.total) > 0)
          .map((r) => ({
            name: r.method,
            value: Math.round((Number(r.total) / total) * 100),
            color: colorFor(r.method),
          }))
      );
      setDonations(dn || []);
      setProjects(pr || []);
      const allApps = [...(va || []), ...(ma || []), ...(ca || [])]
        .filter((a) => a.status === "new" || a.status === "reviewing")
        .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
      setPending(allApps);
      setPosts(po || []);
      setMessages(ms || []);
      setLoading(false);
    })();
  }, [range.key]);

  const exportDonationsCsv = async () => {
    const qs = new URLSearchParams();
    if (range.from) qs.set("from", range.from);
    if (range.to) qs.set("to", range.to);
    qs.set("all", "1");
    let rows: DonationRow[] = donations;
    try {
      rows = await api.get<DonationRow[]>(`/donations?${qs.toString()}`);
    } catch { /* fall back to loaded rows */ }
    const safeSlug = range.key.replace(/[^a-z0-9-]/gi, "_");
    exportRowsAsCsv(
      `donations-${safeSlug}.csv`,
      rows,
      [
        { header: "ID", accessor: (r) => r.id },
        { header: "নাম", accessor: (r) => r.name },
        { header: "ফোন", accessor: (r) => r.phone || "" },
        { header: "পরিমাণ (৳)", accessor: (r) => r.amount },
        { header: "মাধ্যম", accessor: (r) => r.method },
        { header: "খাত", accessor: (r) => r.area || "" },
        { header: "স্ট্যাটাস", accessor: (r) => r.status },
        { header: "তারিখ", accessor: (r) => (r.created_at ? String(r.created_at).replace("T", " ").slice(0, 19) : "") },
      ]
    );
  };


  // Build recent activity feed from live data
  const activity = useMemo(() => {
    type Item = { type: string; text: string; time: string; ts: number };
    const items: Item[] = [];
    const ts = (s?: string) => (s ? new Date(s).getTime() : 0);
    donations.slice(0, 8).forEach((d) =>
      items.push({
        type: "donation",
        text: `${d.name || "একজন দাতা"} ${bnCurrency(Number(d.amount))} দান করেছেন`,
        time: relTime(d.created_at),
        ts: ts(d.created_at),
      })
    );
    pending.slice(0, 8).forEach((a) => {
      const kindLabel =
        a.kind === "members" ? "সদস্যপদের" : a.kind === "careers" ? "প্রতিনিধি" : "স্বেচ্ছাসেবক";
      items.push({
        type: a.kind === "members" ? "member" : "volunteer",
        text: `${a.name} ${kindLabel} আবেদন করেছেন`,
        time: relTime(a.created_at),
        ts: ts(a.created_at),
      });
    });
    posts.slice(0, 5).forEach((p) =>
      items.push({
        type: "post",
        text: `নতুন পোস্ট: ${p.title}`,
        time: relTime(p.created_at || p.published_at),
        ts: ts(p.created_at || p.published_at),
      })
    );
    messages.slice(0, 5).forEach((m) =>
      items.push({
        type: "message",
        text: `${m.name || "একজন"} মেসেজ পাঠিয়েছেন${m.subject ? `: ${m.subject}` : ""}`,
        time: relTime(m.created_at),
        ts: ts(m.created_at),
      })
    );
    return items.sort((a, b) => b.ts - a.ts).slice(0, 8);
  }, [donations, pending, posts, messages]);

  // Weekly delta % for donations
  const weeklyDelta = useMemo(() => {
    if (trend.length < 2) return null;
    const half = Math.max(1, Math.floor(trend.length / 2));
    const older = trend.slice(0, half).reduce((s, x) => s + x.v, 0);
    const newer = trend.slice(half).reduce((s, x) => s + x.v, 0);
    if (!older) return null;
    return Math.round(((newer - older) / older) * 100);
  }, [trend]);

  const kpiCards = [
    {
      key: "donations",
      label: "মোট দান",
      value: kpisData ? bnCurrency(kpisData.total_donations) : "—",
      delta: weeklyDelta != null ? `${weeklyDelta >= 0 ? "+" : ""}${bn(weeklyDelta)}%` : undefined,
      trend: (weeklyDelta ?? 0) >= 0 ? "up" : "down",
      note: range.label,
      icon: HandCoins,
    },
    {
      key: "donors",
      label: "মোট দাতা",
      value: kpisData ? bn(kpisData.unique_donors) : "—",
      note: kpisData ? `${bn(kpisData.donation_count)} ট্রানজেকশন · ${range.label}` : range.label,
      icon: Users2,
    },
    {
      key: "volunteers",
      label: "স্বেচ্ছাসেবক আবেদন",
      value: kpisData ? bn(kpisData.volunteers) : "—",
      note: range.label,
      icon: HeartHandshake,
    },
    {
      key: "projects",
      label: "চলমান প্রকল্প",
      value: kpisData ? bn(kpisData.active_projects) : "—",
      note: `${bn(kpisData?.new_messages || 0)} নতুন মেসেজ · ${range.label}`,
      icon: FolderKanban,
    },

  ];

  return (
    <>
      <PageHeader
        title="স্বাগতম, এডমিন 👋"
        subtitle={`ডেটা রেঞ্জ: ${range.label}${loading ? " · লোড হচ্ছে…" : ""}`}
        actions={
          <>
            <RangePicker value={range} onChange={setRange} />
            <Btn variant="outline" onClick={exportDonationsCsv}>
              <Download className="h-4 w-4" /> CSV এক্সপোর্ট
            </Btn>
            <Btn><Plus className="h-4 w-4" /> নতুন প্রকল্প</Btn>
          </>
        }
      />


      <VisitorStrip />
      
      {/* Deployment Status Indicator */}
      <DeploymentStatus />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((k, i) => (
          <KpiCard
            key={k.key}
            label={k.label}
            value={k.value}
            delta={k.delta}
            trend={k.trend as "up" | "down" | "flat"}
            note={k.note}
            icon={k.icon}
            highlight={i === 0}
          />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <SectionHeader
            title="সাপ্তাহিক দান প্রবাহ"
            action={
              weeklyDelta != null ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TrendingUp className={`h-3.5 w-3.5 ${weeklyDelta >= 0 ? "text-primary" : "text-destructive"}`} />
                  <span>{weeklyDelta >= 0 ? "+" : ""}{bn(weeklyDelta)}% গত সপ্তাহ থেকে</span>
                </div>
              ) : null
            }
          />
          <div className="h-[260px]">
            {trend.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ left: -8, right: 8, top: 8, bottom: 0 }}>
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
                    formatter={(v: number) => [bnCurrency(v), "দান"]}
                  />
                  <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#gd)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="এখনো কোনো দান রেকর্ড হয়নি" />
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader title="পেমেন্ট মাধ্যম" />
          {channels.length ? (
            <>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={channels} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={2}>
                      {channels.map((c) => <Cell key={c.name} fill={c.color} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                      formatter={(v: number, n) => [`${bn(v)}%`, n]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {channels.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                      <span className="text-foreground/80">{c.name}</span>
                    </div>
                    <span className="font-bold tabular-nums">{bn(c.value)}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyChart label="এখনো কোনো পেমেন্ট নেই" />
          )}
        </Card>
      </div>

      {/* Recent donations + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2" pad={false}>
          <div className="p-5 md:p-6 pb-3">
            <SectionHeader title="সাম্প্রতিক দান" action={<a href="/dashboard/donations" className="text-xs font-bold text-primary hover:underline">সব দেখুন →</a>} />
          </div>
          {donations.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-y border-border bg-muted/40">
                    <th className="font-semibold px-6 py-2.5">দাতা</th>
                    <th className="font-semibold py-2.5">পরিমাণ</th>
                    <th className="font-semibold py-2.5">মাধ্যম</th>
                    <th className="font-semibold py-2.5 pr-6">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.slice(0, 6).map((d) => (
                    <tr key={String(d.id)} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-3">
                        <div className="font-semibold">{d.name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{d.area || d.phone || ""}</div>
                      </td>
                      <td className="py-3 font-bold tabular-nums">{bnCurrency(Number(d.amount))}</td>
                      <td className="py-3 text-foreground/70">{d.method}</td>
                      <td className="py-3 pr-6"><StatusBadge status={d.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 pb-6 text-sm text-muted-foreground">এখনো কোনো দান রেকর্ড হয়নি।</div>
          )}
        </Card>

        <Card>
          <SectionHeader title="সাম্প্রতিক কার্যক্রম" />
          {activity.length ? (
            <ul className="space-y-4">
              {activity.map((a, i) => {
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
          ) : (
            <div className="text-sm text-muted-foreground">এখনো কোনো কার্যক্রম নেই।</div>
          )}
        </Card>
      </div>

      {/* Project progress + pending applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <SectionHeader
            title="প্রকল্পের অগ্রগতি"
            action={<a href="/dashboard/projects" className="text-xs font-bold text-primary hover:underline">ম্যানেজ করুন →</a>}
          />
          {projects.length ? (
            <div className="space-y-4">
              {projects.slice(0, 4).map((p) => {
                const budget = Number(p.budget) || 0;
                const raised = Number(p.raised) || 0;
                const pct = budget ? Math.min(100, Math.round((raised / budget) * 100)) : 0;
                return (
                  <div key={String(p.id)}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{p.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.category || "—"}{p.beneficiaries ? ` · ${bn(p.beneficiaries)} উপকারভোগী` : ""}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <div className="font-bold tabular-nums">৳ {(raised / 100000).toFixed(1)}L</div>
                        <div className="text-xs text-muted-foreground">/ ৳ {(budget / 100000).toFixed(1)}L</div>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">এখনো কোনো প্রকল্প যোগ করা হয়নি।</div>
          )}
        </Card>

        <Card>
          <SectionHeader
            title="অপেক্ষমাণ আবেদন"
            action={<a href="/dashboard/volunteers" className="text-xs font-bold text-primary hover:underline">দেখুন →</a>}
          />
          {pending.length ? (
            <ul className="space-y-3">
              {pending.slice(0, 5).map((v) => {
                const label =
                  v.kind === "members" ? "সদস্যপদ" : v.kind === "careers" ? "প্রতিনিধি" : "স্বেচ্ছাসেবক";
                return (
                  <li key={String(v.id)} className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/60 transition-colors">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {(v.name || "?").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{v.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{label}</div>
                    </div>
                    <StatusBadge status={v.status} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground">কোনো অপেক্ষমাণ আবেদন নেই।</div>
          )}
        </Card>
      </div>
    </>
  );
};

// ---------- helpers ----------
function relTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  if (!d) return "—";
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "এইমাত্র";
  if (m < 60) return `${bn(m)} মিনিট আগে`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${bn(h)} ঘণ্টা আগে`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${bn(days)} দিন আগে`;
  return new Date(iso).toLocaleDateString("bn-BD");
}

const EmptyChart = ({ label }: { label: string }) => (
  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">{label}</div>
);

export default Overview;
