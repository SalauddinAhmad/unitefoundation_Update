import { useEffect, useState } from "react";
import { Card, Btn } from "@/components/dashboard/DashboardUI";
import { api, API_BASE_URL, auth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DatabaseBackup, Download, Loader2, RefreshCw, Trash2, ShieldCheck } from "lucide-react";

type BackupFile = { file: string; size: number; createdAt: string };
type BackupConfig = {
  enabled: boolean;
  frequency: "hourly" | "daily" | "weekly";
  retention: number;
  emailCopy: boolean;
  emailTo: string;
};
type BackupState = {
  lastRunAt: string | null;
  lastStatus: string | null;
  lastError: string | null;
  lastFile: string | null;
  lastSize?: number;
  lastTables?: number;
  lastRows?: number;
};
type BackupInfo = {
  config: BackupConfig;
  state: BackupState;
  running: boolean;
  nextRunAt: string | null;
  backups: BackupFile[];
};

const FREQ_LABEL: Record<BackupConfig["frequency"], string> = {
  hourly: "প্রতি ঘণ্টায়",
  daily: "প্রতিদিন",
  weekly: "সপ্তাহে একবার",
};

const fmtSize = (n = 0) =>
  n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(2)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" }) : "—";

const BackupPanel = () => {
  const { toast } = useToast();
  const [info, setInfo] = useState<BackupInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [running, setRunning] = useState(false);

  const load = async () => {
    try {
      setInfo(await api.get<BackupInfo>("/backups"));
    } catch (e) {
      toast({ title: "লোড করা যায়নি", description: (e as Error).message, variant: "destructive" });
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patchConfig = async (patch: Partial<BackupConfig>) => {
    if (!info) return;
    setBusy(true);
    try {
      const cfg = await api.put<BackupConfig>("/backups/config", patch);
      setInfo({ ...info, config: cfg });
      toast({ title: "সংরক্ষিত হয়েছে", description: "ব্যাকআপ সেটিংস আপডেট হয়েছে।" });
    } catch (e) {
      toast({ title: "সেভ হয়নি", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const runNow = async () => {
    setRunning(true);
    try {
      await api.post("/backups/run");
      toast({ title: "ব্যাকআপ সম্পন্ন", description: "নতুন ব্যাকআপ ফাইল তৈরি হয়েছে।" });
      await load();
    } catch (e) {
      toast({ title: "ব্যাকআপ ব্যর্থ", description: (e as Error).message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const download = async (file: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/backups/download/${encodeURIComponent(file)}`, {
        headers: { Authorization: `Bearer ${auth.token ?? ""}` },
      });
      if (!res.ok) throw new Error(`ডাউনলোড ব্যর্থ (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast({ title: "ডাউনলোড ব্যর্থ", description: (e as Error).message, variant: "destructive" });
    }
  };

  const remove = async (file: string) => {
    if (!confirm(`"${file}" ডিলিট করবেন?`)) return;
    try {
      await api.delete(`/backups/${encodeURIComponent(file)}`);
      await load();
    } catch (e) {
      toast({ title: "ডিলিট হয়নি", description: (e as Error).message, variant: "destructive" });
    }
  };

  if (!info) return <Card><div className="text-sm text-muted-foreground">লোড হচ্ছে...</div></Card>;

  const { config, state, backups } = info;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="font-bold flex items-center gap-2">
              <DatabaseBackup className="h-4 w-4 text-primary" /> স্বয়ংক্রিয় ব্যাকআপ
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              পুরো ডেটাবেজ নির্ধারিত সময় পর পর নিজে থেকেই ব্যাকআপ হয় — কোনো ম্যানুয়াল কাজ লাগে না।
            </p>
          </div>
          <Btn onClick={runNow} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">{running ? "চলছে..." : "এখনই ব্যাকআপ"}</span>
          </Btn>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          {[
            { l: "সর্বশেষ ব্যাকআপ", v: fmtDate(state.lastRunAt) },
            { l: "পরবর্তী ব্যাকআপ", v: config.enabled ? fmtDate(info.nextRunAt) : "বন্ধ আছে" },
            { l: "সংরক্ষিত ফাইল", v: `${backups.length} টি` },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-border bg-secondary/40 p-3">
              <div className="text-[11px] text-muted-foreground">{s.l}</div>
              <div className="text-sm font-semibold mt-1">{s.v}</div>
            </div>
          ))}
        </div>

        {state.lastStatus === "error" && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            সর্বশেষ ব্যাকআপ ব্যর্থ হয়েছে: {state.lastError}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">অটো ব্যাকআপ</span>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={config.enabled ? "on" : "off"}
              disabled={busy}
              onChange={(e) => patchConfig({ enabled: e.target.value === "on" })}
            >
              <option value="on">চালু</option>
              <option value="off">বন্ধ</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">সময়সূচি</span>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={config.frequency}
              disabled={busy}
              onChange={(e) => patchConfig({ frequency: e.target.value as BackupConfig["frequency"] })}
            >
              {(Object.keys(FREQ_LABEL) as BackupConfig["frequency"][]).map((f) => (
                <option key={f} value={f}>{FREQ_LABEL[f]}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">
              কতগুলো ব্যাকআপ রাখা হবে
            </span>
            <input
              type="number"
              min={1}
              max={60}
              defaultValue={config.retention}
              disabled={busy}
              onBlur={(e) => {
                const v = Number(e.target.value);
                if (v && v !== config.retention) patchConfig({ retention: v });
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              এর চেয়ে পুরনো ফাইল স্বয়ংক্রিয়ভাবে মুছে যাবে (ডিস্ক ভরে যাওয়া রোধ করতে)।
            </span>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">
              ইমেইলে কপি পাঠানো হবে
            </span>
            <div className="flex gap-2">
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={config.emailCopy ? "on" : "off"}
                disabled={busy}
                onChange={(e) => patchConfig({ emailCopy: e.target.value === "on" })}
              >
                <option value="off">না</option>
                <option value="on">হ্যাঁ</option>
              </select>
              <input
                type="email"
                placeholder="admin@unitefoundation.bd"
                defaultValue={config.emailTo}
                disabled={busy || !config.emailCopy}
                onBlur={(e) => {
                  if (e.target.value !== config.emailTo) patchConfig({ emailTo: e.target.value.trim() });
                }}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </label>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold mb-1">ব্যাকআপ ফাইলসমূহ</h3>
        <p className="text-xs text-muted-foreground mb-4">
          প্রতিটি ফাইল সম্পূর্ণ ডেটাবেজের gzip করা SQL ডাম্প — phpMyAdmin দিয়ে সরাসরি রিস্টোর করা যায়।
        </p>
        {backups.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            এখনো কোনো ব্যাকআপ তৈরি হয়নি।
          </div>
        ) : (
          <div className="divide-y divide-border">
            {backups.map((b) => (
              <div key={b.file} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{b.file}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {fmtDate(b.createdAt)} · {fmtSize(b.size)}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => download(b.file)}
                    className="p-2 rounded-lg hover:bg-secondary text-foreground/70"
                    title="ডাউনলোড"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(b.file)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"
                    title="ডিলিট"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span>
            ব্যাকআপ সার্ভারেই সংরক্ষিত থাকে। সার্ভার-লেভেল দুর্ঘটনার সুরক্ষার জন্য ইমেইল কপি চালু রাখা
            অথবা মাসে একবার ফাইল ডাউনলোড করে রাখা উত্তম।
          </span>
        </div>
      </Card>
    </div>
  );
};

export default BackupPanel;
