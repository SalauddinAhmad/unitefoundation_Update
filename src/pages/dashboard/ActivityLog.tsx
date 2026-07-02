// ============================================================
// Activity Log page — Super Admin only.
// Shows who did what across the entire dashboard.
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
  ScrollText, Search, RefreshCw, Download, Filter,
  LogIn, LogOut as LogOutIcon, Plus, Pencil, Trash2, Shield, KeyRound, AlertTriangle,
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

const ACTION_META: Record<string, { label: string; icon: any; color: string }> = {
  create:          { label: "তৈরি",         icon: Plus,         color: "bg-emerald-100 text-emerald-700" },
  update:          { label: "আপডেট",         icon: Pencil,       color: "bg-blue-100 text-blue-700" },
  delete:          { label: "ডিলিট",         icon: Trash2,       color: "bg-red-100 text-red-700" },
  login:           { label: "লগইন",         icon: LogIn,        color: "bg-green-100 text-green-700" },
  login_failed:    { label: "ব্যর্থ লগইন",   icon: AlertTriangle, color: "bg-amber-100 text-amber-700" },
  logout:          { label: "লগআউট",         icon: LogOutIcon,   color: "bg-slate-100 text-slate-700" },
  password_change: { label: "পাসওয়ার্ড",    icon: KeyRound,     color: "bg-purple-100 text-purple-700" },
  role_change:     { label: "রোল পরিবর্তন",  icon: Shield,       color: "bg-indigo-100 text-indigo-700" },
};

const fmtTime = (s: string) => {
  try {
    const d = new Date(s);
    return d.toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" });
  } catch { return s; }
};

export default function ActivityLog() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");
  const [limit] = useState(100);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
      const res = await api.get<{ items: LogRow[]; total: number }>(`/logs?${p.toString()}`);
      setRows(res.items || []);
      setTotal(res.total || 0);
    } catch (e: any) {
      setError(e?.message || "লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [offset, entity, action]);

  const entities = useMemo(() => Array.from(new Set(rows.map(r => r.entity))).sort(), [rows]);

  const exportCsv = () => {
    const header = ["সময়", "ইউজার", "রোল", "অ্যাকশন", "মডিউল", "আইডি", "মেথড", "পাথ", "স্ট্যাটাস", "IP", "সারাংশ"];
    const lines = rows.map(r => [
      fmtTime(r.created_at),
      r.user_name || r.user_email || "—",
      r.user_role || "—",
      r.action,
      r.entity,
      r.entity_id || "",
      r.method || "",
      r.path || "",
      r.status ?? "",
      r.ip || "",
      (r.summary || "").replace(/\n/g, " "),
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
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
            সকল অ্যাডমিন কার্যকলাপের সম্পূর্ণ রেকর্ড — কে, কখন, কী করেছে
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
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
            <Download className="h-4 w-4" /> CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center gap-3">
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
          className="px-3 py-2 rounded-lg bg-secondary text-sm"
        >
          <option value="">সব অ্যাকশন</option>
          {Object.keys(ACTION_META).map(a => (
            <option key={a} value={a}>{ACTION_META[a].label}</option>
          ))}
        </select>
        <select
          value={entity}
          onChange={(e) => { setEntity(e.target.value); setOffset(0); }}
          className="px-3 py-2 rounded-lg bg-secondary text-sm"
        >
          <option value="">সব মডিউল</option>
          {entities.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <button
          onClick={() => { setOffset(0); load(); }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-foreground text-background text-sm"
        >
          <Filter className="h-4 w-4" /> ফিল্টার
        </button>
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
                <th className="px-4 py-3">সময়</th>
                <th className="px-4 py-3">ইউজার</th>
                <th className="px-4 py-3">অ্যাকশন</th>
                <th className="px-4 py-3">মডিউল</th>
                <th className="px-4 py-3">এন্ডপয়েন্ট</th>
                <th className="px-4 py-3">স্ট্যাটাস</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">কোনো লগ পাওয়া যায়নি</td></tr>
              )}
              {rows.map((r) => {
                const meta = ACTION_META[r.action] || { label: r.action, icon: ScrollText, color: "bg-slate-100 text-slate-700" };
                const Icon = meta.icon;
                const statusColor = !r.status ? "text-muted-foreground"
                  : r.status < 300 ? "text-emerald-600"
                  : r.status < 400 ? "text-blue-600"
                  : r.status < 500 ? "text-amber-600"
                  : "text-red-600";
                return (
                  <tr key={r.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{fmtTime(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.user_name || "—"}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {r.user_email || "অতিথি"}
                        {r.user_role && <span className="ml-1 px-1.5 py-0.5 rounded bg-secondary text-[10px]">{r.user_role}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={"inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium " + meta.color}>
                        <Icon className="h-3 w-3" /> {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs">{r.entity}</div>
                      {r.entity_id && <div className="text-[10px] text-muted-foreground font-mono">#{r.entity_id}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-[11px] text-muted-foreground truncate max-w-[260px]" title={r.path || ""}>
                        <span className="text-foreground/70 font-semibold">{r.method}</span> {r.path}
                      </div>
                      {r.summary && <div className="text-[11px] mt-0.5">{r.summary}</div>}
                    </td>
                    <td className={"px-4 py-3 font-mono text-xs " + statusColor}>{r.status ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{r.ip || "—"}</td>
                  </tr>
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
              {offset + 1}–{Math.min(offset + limit, total)}
            </span>
            <button
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
              className="px-3 py-1.5 rounded-lg bg-secondary disabled:opacity-40"
            >পরের</button>
          </div>
        </div>
      </div>
    </div>
  );
}
