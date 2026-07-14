// ============================================================
// Activity Log page — Super Admin only.
// Shows who did what across the entire dashboard, with rich details.
// ============================================================
import { Fragment, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
  ScrollText, Search, RefreshCw, Download, Filter,
  LogIn, LogOut as LogOutIcon, Plus, Pencil, Trash2, Shield, KeyRound, AlertTriangle,
  ChevronDown, ChevronRight, Activity, Users, Layers, Clock, Globe, Monitor, Copy, X,
} from "lucide-react";

type LogRow = {
  id: number;
  user_id: number | null;
  user_email: string | null;
  user_name: string | null;
  user_role: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  method: string | null;
  path: string | null;
  status: number | null;
  ip: string | null;
  user_agent: string | null;
  summary: string | null;
  meta: any;
  created_at: string;
};

type Summary = {
  days: number;
  byAction: { action: string; n: number }[];
  byUser: { user_id: number; user_email: string; user_name: string; n: number }[];
  byEntity: { entity: string; n: number }[];
};

const ACTION_META: Record<string, { label: string; icon: any; color: string; dot: string }> = {
  create:          { label: "তৈরি",          icon: Plus,         color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  update:          { label: "আপডেট",          icon: Pencil,       color: "bg-blue-100 text-blue-700 border-blue-200",         dot: "bg-blue-500" },
  delete:          { label: "ডিলিট",          icon: Trash2,       color: "bg-red-100 text-red-700 border-red-200",             dot: "bg-red-500" },
  login:           { label: "লগইন",           icon: LogIn,        color: "bg-green-100 text-green-700 border-green-200",       dot: "bg-green-500" },
  login_failed:    { label: "ব্যর্থ লগইন",     icon: AlertTriangle,color: "bg-amber-100 text-amber-700 border-amber-200",       dot: "bg-amber-500" },
  logout:          { label: "লগআউট",          icon: LogOutIcon,   color: "bg-slate-100 text-slate-700 border-slate-200",       dot: "bg-slate-500" },
  password_change: { label: "পাসওয়ার্ড",      icon: KeyRound,     color: "bg-purple-100 text-purple-700 border-purple-200",    dot: "bg-purple-500" },
  role_change:     { label: "রোল পরিবর্তন",   icon: Shield,       color: "bg-indigo-100 text-indigo-700 border-indigo-200",    dot: "bg-indigo-500" },
  export:          { label: "এক্সপোর্ট",       icon: Download,     color: "bg-cyan-100 text-cyan-700 border-cyan-200",          dot: "bg-cyan-500" },
};

const ENTITY_LABEL: Record<string, string> = {
  posts: "ব্লগ",
  projects: "প্রকল্প",
  donations: "ডোনেশন",
  settings: "সেটিংস",
  admins: "অ্যাডমিন",
  messages: "বার্তা",
  gallery: "গ্যালারি",
  team: "টিম",
  partners: "পার্টনার",
  applications: "আবেদন",
  forms: "ফর্ম",
  media: "মিডিয়া",
  auth: "অথ",
  logs: "লগ",
};

const fmtTime = (s: string) => {
  try {
    const d = new Date(s);
    return d.toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "medium" });
  } catch { return s; }
};

const relTime = (s: string) => {
  try {
    const diff = (Date.now() - new Date(s).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)} সেকেন্ড আগে`;
    if (diff < 3600) return `${Math.floor(diff / 60)} মিনিট আগে`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ঘণ্টা আগে`;
    return `${Math.floor(diff / 86400)} দিন আগে`;
  } catch { return ""; }
};

const parseUA = (ua: string | null) => {
  if (!ua) return { browser: "—", os: "—" };
  const b = /Edg\//.test(ua) ? "Edge"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Firefox\//.test(ua) ? "Firefox"
    : /Safari\//.test(ua) ? "Safari"
    : "Other";
  const o = /Windows/.test(ua) ? "Windows"
    : /Mac OS X/.test(ua) ? "macOS"
    : /Android/.test(ua) ? "Android"
    : /iPhone|iPad/.test(ua) ? "iOS"
    : /Linux/.test(ua) ? "Linux"
    : "—";
  return { browser: b, os: o };
};

export default function ActivityLog() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [limit] = useState(100);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [detail, setDetail] = useState<LogRow | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams();
      p.set("limit", String(limit));
      p.set("offset", String(offset));
      if (q) p.set("q", q);
      if (entity) p.set("entity", entity);
      if (action) p.set("action", action);
      if (from) p.set("from", from);
      if (to) p.set("to", to);
      const res = await api.get<{ items: LogRow[]; total: number }>(`/logs?${p.toString()}`);
      setRows(res.items || []);
      setTotal(res.total || 0);
    } catch (e: any) {
      setError(e?.message || "লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const s = await api.get<Summary>("/logs/summary?days=7");
      setSummary(s);
    } catch { /* silent */ }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [offset, entity, action, from, to]);
  useEffect(() => { loadSummary(); }, []);

  const entities = useMemo(
    () => Array.from(new Set([...rows.map(r => r.entity), ...(summary?.byEntity.map(e => e.entity) || [])])).sort(),
    [rows, summary],
  );

  const kpis = useMemo(() => {
    if (!summary) return null;
    const total7d = summary.byAction.reduce((a, b) => a + b.n, 0);
    const failed = summary.byAction.find(a => a.action === "login_failed")?.n || 0;
    const activeUsers = summary.byUser.length;
    const topEntity = summary.byEntity[0];
    return { total7d, failed, activeUsers, topEntity };
  }, [summary]);

  const toggle = (id: number) => {
    const n = new Set(expanded);
    n.has(id) ? n.delete(id) : n.add(id);
    setExpanded(n);
  };

  const clearFilters = () => {
    setQ(""); setEntity(""); setAction(""); setFrom(""); setTo(""); setOffset(0);
  };

  const exportCsv = () => {
    const header = ["সময়", "ইউজার", "ইমেইল", "রোল", "অ্যাকশন", "মডিউল", "আইডি", "মেথড", "পাথ", "স্ট্যাটাস", "IP", "ব্রাউজার", "OS", "সারাংশ"];
    const lines = rows.map(r => {
      const ua = parseUA(r.user_agent);
      return [
        fmtTime(r.created_at),
        r.user_name || "—",
        r.user_email || "—",
        r.user_role || "—",
        r.action,
        r.entity,
        r.entity_id || "",
        r.method || "",
        r.path || "",
        r.status ?? "",
        r.ip || "",
        ua.browser,
        ua.os,
        (r.summary || "").replace(/\n/g, " "),
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });
    const csv = "\uFEFF" + [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <ScrollText className="h-6 w-6 text-primary" />
            অ্যাক্টিভিটি লগ
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            সকল অ্যাডমিন কার্যকলাপের সম্পূর্ণ রেকর্ড — কে, কখন, কোথা থেকে, কী করেছে
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { load(); loadSummary(); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border border-border hover:bg-secondary text-sm"
          >
            <RefreshCw className={"h-4 w-4 " + (loading ? "animate-spin" : "")} />
            রিফ্রেশ
          </button>
          <button
            onClick={exportCsv}
            disabled={!rows.length}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> CSV এক্সপোর্ট
          </button>
        </div>
      </div>

      {/* KPI cards (last 7 days) */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard icon={Activity} label="মোট ইভেন্ট (৭ দিন)" value={kpis.total7d.toLocaleString("bn-BD")} tone="text-primary" />
          <KpiCard icon={Users}    label="সক্রিয় অ্যাডমিন"    value={kpis.activeUsers.toLocaleString("bn-BD")} tone="text-blue-600" />
          <KpiCard icon={Layers}   label="শীর্ষ মডিউল"          value={kpis.topEntity ? `${ENTITY_LABEL[kpis.topEntity.entity] || kpis.topEntity.entity} · ${kpis.topEntity.n}` : "—"} tone="text-emerald-600" />
          <KpiCard icon={AlertTriangle} label="ব্যর্থ লগইন" value={kpis.failed.toLocaleString("bn-BD")} tone={kpis.failed ? "text-red-600" : "text-muted-foreground"} />
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (setOffset(0), load())}
              placeholder="খুঁজুন — ইমেইল, নাম, পাথ, সারাংশ"
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); setOffset(0); }}
            className="px-3 py-2 rounded-lg bg-secondary text-sm min-w-[140px]"
          >
            <option value="">সব অ্যাকশন</option>
            {Object.keys(ACTION_META).map(a => (
              <option key={a} value={a}>{ACTION_META[a].label}</option>
            ))}
          </select>
          <select
            value={entity}
            onChange={(e) => { setEntity(e.target.value); setOffset(0); }}
            className="px-3 py-2 rounded-lg bg-secondary text-sm min-w-[140px]"
          >
            <option value="">সব মডিউল</option>
            {entities.map(e => <option key={e} value={e}>{ENTITY_LABEL[e] || e}</option>)}
          </select>
          <button
            onClick={() => { setOffset(0); load(); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-foreground text-background text-sm"
          >
            <Filter className="h-4 w-4" /> প্রয়োগ করুন
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" /> থেকে
            <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setOffset(0); }}
              className="px-2 py-1.5 rounded-lg bg-secondary text-sm" />
          </label>
          <label className="flex items-center gap-2 text-muted-foreground">
            পর্যন্ত
            <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setOffset(0); }}
              className="px-2 py-1.5 rounded-lg bg-secondary text-sm" />
          </label>
          {(q || entity || action || from || to) && (
            <button onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" /> ফিল্টার মুছুন
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left">
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-3 w-8"></th>
                <th className="px-3 py-3">সময়</th>
                <th className="px-3 py-3">ইউজার</th>
                <th className="px-3 py-3">অ্যাকশন</th>
                <th className="px-3 py-3">মডিউল</th>
                <th className="px-3 py-3">এন্ডপয়েন্ট</th>
                <th className="px-3 py-3">স্ট্যাটাস</th>
                <th className="px-3 py-3">ডিভাইস / IP</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">কোনো লগ পাওয়া যায়নি</td></tr>
              )}
              {rows.map((r) => {
                const meta = ACTION_META[r.action] || { label: r.action, icon: ScrollText, color: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-500" };
                const Icon = meta.icon;
                const statusColor = !r.status ? "text-muted-foreground"
                  : r.status < 300 ? "text-emerald-600"
                  : r.status < 400 ? "text-blue-600"
                  : r.status < 500 ? "text-amber-600"
                  : "text-red-600";
                const ua = parseUA(r.user_agent);
                const isOpen = expanded.has(r.id);
                return (
                  <Fragment key={r.id}>
                    <tr className="border-t border-border hover:bg-secondary/30 cursor-pointer" onClick={() => toggle(r.id)}>
                      <td className="px-3 py-3 align-top">
                        {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      </td>
                      <td className="px-3 py-3 align-top whitespace-nowrap">
                        <div className="text-foreground/90">{fmtTime(r.created_at)}</div>
                        <div className="text-[10px] text-muted-foreground">{relTime(r.created_at)}</div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="font-medium flex items-center gap-1.5">
                          <span className={"h-1.5 w-1.5 rounded-full " + meta.dot} />
                          {r.user_name || "—"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {r.user_email || "অতিথি"}
                          {r.user_role && <span className="ml-1 px-1.5 py-0.5 rounded bg-secondary text-[10px] uppercase tracking-wider">{r.user_role}</span>}
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <span className={"inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border " + meta.color}>
                          <Icon className="h-3 w-3" /> {meta.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="text-xs font-medium">{ENTITY_LABEL[r.entity] || r.entity}</div>
                        {r.entity_id && <div className="text-[10px] text-muted-foreground font-mono">#{r.entity_id}</div>}
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="font-mono text-[11px] text-muted-foreground truncate max-w-[280px]" title={r.path || ""}>
                          <span className="text-foreground/70 font-semibold">{r.method}</span> {r.path}
                        </div>
                        {r.summary && <div className="text-[11px] mt-0.5 text-foreground/80 line-clamp-1">{r.summary}</div>}
                      </td>
                      <td className={"px-3 py-3 align-top font-mono text-xs " + statusColor}>{r.status ?? "—"}</td>
                      <td className="px-3 py-3 align-top">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Monitor className="h-3 w-3 text-muted-foreground" />
                          <span>{ua.browser} · {ua.os}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                          <Globe className="h-3 w-3" /> {r.ip || "—"}
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-secondary/20 border-t border-border">
                        <td></td>
                        <td colSpan={7} className="px-4 py-4">
                          <DetailPanel row={r} onOpenFull={() => setDetail(r)} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
          <div className="text-muted-foreground">
            মোট <span className="font-bold text-foreground">{total.toLocaleString("bn-BD")}</span> রেকর্ড
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
              className="px-3 py-1.5 rounded-lg bg-secondary disabled:opacity-40"
            >আগের</button>
            <span className="text-muted-foreground text-xs">
              {total === 0 ? 0 : offset + 1}–{Math.min(offset + limit, total)}
            </span>
            <button
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
              className="px-3 py-1.5 rounded-lg bg-secondary disabled:opacity-40"
            >পরের</button>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {detail && <DetailModal row={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

// ----------------- Sub-components -----------------

function KpiCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{label}</div>
        <Icon className={"h-4 w-4 " + tone} />
      </div>
      <div className={"text-2xl font-extrabold mt-1 " + tone}>{value}</div>
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={"text-xs mt-0.5 break-all " + (mono ? "font-mono" : "")}>{value ?? "—"}</div>
    </div>
  );
}

function DetailPanel({ row, onOpenFull }: { row: LogRow; onOpenFull: () => void }) {
  const ua = parseUA(row.user_agent);
  const copy = (t: string) => { try { navigator.clipboard.writeText(t); } catch { /* ignore */ } };
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <Field label="ইভেন্ট ID" value={<span className="flex items-center gap-1 font-mono">#{row.id}
        <button onClick={() => copy(String(row.id))} className="text-muted-foreground hover:text-foreground"><Copy className="h-3 w-3" /></button>
      </span>} />
      <Field label="ইউজার ID" value={row.user_id ?? "—"} mono />
      <Field label="ব্রাউজার" value={`${ua.browser} · ${ua.os}`} />
      <Field label="IP" value={row.ip || "—"} mono />
      <div className="col-span-2 md:col-span-4">
        <Field label="সম্পূর্ণ পাথ" value={<span className="font-mono">{row.method} {row.path}</span>} />
      </div>
      {row.summary && (
        <div className="col-span-2 md:col-span-4">
          <Field label="সারাংশ" value={row.summary} />
        </div>
      )}
      {row.user_agent && (
        <div className="col-span-2 md:col-span-4">
          <Field label="User-Agent" value={<span className="font-mono text-[10px]">{row.user_agent}</span>} />
        </div>
      )}
      {row.meta && (
        <div className="col-span-2 md:col-span-4">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">মেটা ডেটা</div>
            <button onClick={onOpenFull} className="text-[11px] text-primary hover:underline">সম্পূর্ণ JSON দেখুন</button>
          </div>
          <pre className="text-[10px] font-mono bg-background border border-border rounded-md p-2 mt-1 max-h-40 overflow-auto">
            {(() => { try { return JSON.stringify(typeof row.meta === "string" ? JSON.parse(row.meta) : row.meta, null, 2); } catch { return String(row.meta); } })()}
          </pre>
        </div>
      )}
    </div>
  );
}

function DetailModal({ row, onClose }: { row: LogRow; onClose: () => void }) {
  const metaStr = (() => {
    try { return JSON.stringify(typeof row.meta === "string" ? JSON.parse(row.meta) : row.meta, null, 2); }
    catch { return String(row.meta); }
  })();
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
          <div className="font-bold">ইভেন্ট #{row.id} — সম্পূর্ণ বিবরণ</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-all">{metaStr}</pre>
      </div>
    </div>
  );
}
