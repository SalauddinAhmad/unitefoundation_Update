// ============================================================
// Admin editor for automatic email templates.
// Wired inside Dashboard → Settings → "ইমেইল টেমপ্লেট" tab.
// Super-admin only (backend enforces).
// ============================================================
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RotateCcw, Save, Eye, Code2, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, Btn } from "@/components/dashboard/DashboardUI";

type Field = { key: string; label: string; type: "text" | "textarea" | "html" };
type Variable = { key: string; desc: string };
type TplDefaults = { subject: string; slots: Record<string, string> };
type TplSchema = {
  label: string;
  description: string;
  variables: Variable[];
  fields: Field[];
  sample: Record<string, unknown>;
  defaults: TplDefaults;
};
type TplValue = { subject: string; slots: Record<string, string> };
type Payload = {
  schema: Record<string, TplSchema>;
  values: Record<string, TplValue>;
};

const EmailTemplatesPanel = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<Payload | null>(null);
  const [activeKey, setActiveKey] = useState<string>("");
  const [draft, setDraft] = useState<TplValue>({ subject: "", slots: {} });
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewTimer = useRef<number | null>(null);
  const [htmlEditorOpen, setHtmlEditorOpen] = useState(false);
  const [htmlEditorLoading, setHtmlEditorLoading] = useState(false);
  const [htmlEditorValue, setHtmlEditorValue] = useState("");

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await api.get<Payload>("/email-templates");
      setData(res);
      const first = Object.keys(res.schema)[0];
      setActiveKey((k) => k || first);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "লোড করতে সমস্যা হয়েছে";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  // When active template changes, reset draft from server value.
  useEffect(() => {
    if (!data || !activeKey) return;
    const v = data.values[activeKey];
    setDraft({ subject: v.subject, slots: { ...v.slots } });
  }, [activeKey, data]);

  // Debounced preview render whenever draft changes.
  useEffect(() => {
    if (!activeKey) return;
    if (previewTimer.current) window.clearTimeout(previewTimer.current);
    previewTimer.current = window.setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const html = await api.post<string>(
          `/email-templates/${activeKey}/preview`,
          { subject: draft.subject, slots: draft.slots },
        );
        // api.post parses JSON when possible; when server sends HTML we get a string.
        setPreviewHtml(typeof html === "string" ? html : String(html));
      } catch {
        setPreviewHtml("<p style='padding:24px;font-family:sans-serif;color:#b91c1c'>প্রিভিউ লোড করা যায়নি।</p>");
      } finally {
        setPreviewLoading(false);
      }
    }, 400);
    return () => {
      if (previewTimer.current) window.clearTimeout(previewTimer.current);
    };
  }, [draft, activeKey]);

  const schema = useMemo(() => (data && activeKey ? data.schema[activeKey] : null), [data, activeKey]);

  const setField = (key: string, value: string) => {
    if (key === "subject") setDraft((d) => ({ ...d, subject: value }));
    else setDraft((d) => ({ ...d, slots: { ...d.slots, [key]: value } }));
  };

  const save = async () => {
    if (!activeKey) return;
    setSaving(true);
    try {
      const res = await api.put<{ ok: boolean; value: TplValue }>(
        `/email-templates/${activeKey}`,
        { subject: draft.subject, slots: draft.slots },
      );
      setData((d) => (d ? { ...d, values: { ...d.values, [activeKey]: res.value } } : d));
      toast({ title: "সংরক্ষিত হয়েছে", description: "টেমপ্লেট সফলভাবে আপডেট হয়েছে।" });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "সেভ করতে সমস্যা হয়েছে";
      toast({ title: "ত্রুটি", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!activeKey || !schema) return;
    if (!confirm("এই টেমপ্লেটটি ডিফল্ট অবস্থায় ফিরিয়ে আনতে চান?")) return;
    try {
      const res = await api.post<{ ok: boolean; value: TplValue }>(`/email-templates/${activeKey}/reset`);
      setData((d) => (d ? { ...d, values: { ...d.values, [activeKey]: res.value } } : d));
      setDraft({ subject: res.value.subject, slots: { ...res.value.slots } });
      toast({ title: "রিসেট হয়েছে", description: "ডিফল্ট টেক্সট পুনরায় লোড হয়েছে।" });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "রিসেট করা যায়নি";
      toast({ title: "ত্রুটি", description: msg, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          টেমপ্লেট লোড হচ্ছে...
        </div>
      </Card>
    );
  }

  if (err || !data) {
    return (
      <Card>
        <div className="text-sm text-destructive">{err || "ডেটা পাওয়া যায়নি।"}</div>
        <div className="mt-3"><Btn onClick={load}>আবার চেষ্টা</Btn></div>
      </Card>
    );
  }

  const templateKeys = Object.keys(data.schema);

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="font-bold">ইমেইল টেমপ্লেট</h3>
          <p className="text-xs text-muted-foreground mt-1">
            সিস্টেম থেকে স্বয়ংক্রিয়ভাবে যেসব ইমেইল পাঠানো হয় সেগুলোর বিষয় ও লেখা এখান থেকে সম্পাদনা করতে পারবেন।
            পরিবর্তন সেভ করলে ৬০ সেকেন্ডের মধ্যে সব নতুন ইমেইলে প্রয়োগ হবে।
          </p>
        </div>
      </div>

      {/* Template selector chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {templateKeys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setActiveKey(k)}
            className={
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition " +
              (activeKey === k
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/60 border-transparent hover:bg-secondary")
            }
          >
            {data.schema[k].label}
          </button>
        ))}
      </div>

      {schema && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: editor */}
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground bg-secondary/60 rounded-lg p-3 leading-relaxed">
              {schema.description}
              {schema.variables.length > 0 && (
                <div className="mt-2">
                  <div className="font-semibold text-foreground/80 mb-1">উপলব্ধ ভেরিয়েবল:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {schema.variables.map((v) => (
                      <code
                        key={v.key}
                        title={v.desc}
                        className="px-1.5 py-0.5 rounded bg-card border border-border text-[11px]"
                      >
                        {`{{${v.key}}}`}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {schema.fields.map((f) => {
              const value = f.key === "subject" ? draft.subject : (draft.slots[f.key] ?? "");
              return (
                <label key={f.key} className="block">
                  <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">{f.label}</span>
                  {f.type === "html" ? (
                    <>
                      <textarea
                        value={value}
                        onChange={(e) => setField(f.key, e.target.value)}
                        rows={16}
                        spellCheck={false}
                        placeholder="<!doctype html>&#10;<html>&#10;  ... এখানে সম্পূর্ণ HTML পেস্ট করুন। {{name}}, {{amount}} ইত্যাদি ভেরিয়েবল ব্যবহার করা যাবে ..."
                        className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-xs font-mono transition resize-y"
                      />
                      <span className="mt-1 block text-[11px] text-muted-foreground">
                        এই ফিল্ডে HTML দিলে উপরের অন্য সব ফিল্ড উপেক্ষা হবে এবং এটাই সরাসরি ইমেইলে যাবে। ফাঁকা রাখলে ডিফল্ট ডিজাইন ব্যবহার হবে।
                      </span>
                    </>
                  ) : f.type === "textarea" ? (
                    <textarea
                      value={value}
                      onChange={(e) => setField(f.key, e.target.value)}
                      rows={f.key === "main_message" || f.key === "intro" ? 5 : 3}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition resize-y"
                    />
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setField(f.key, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-transparent focus:bg-card focus:border-border focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition"
                    />
                  )}
                </label>
              );
            })}

            <div className="flex items-center gap-2 pt-2">
              <Btn onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                সংরক্ষণ করুন
              </Btn>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                ডিফল্টে ফিরে যান
              </button>
            </div>
          </div>

          {/* Right: live preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
                <Eye className="h-3.5 w-3.5" />
                লাইভ প্রিভিউ
              </div>
              {previewLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>
            <div className="rounded-xl border border-border overflow-hidden bg-white">
              <iframe
                title="Email preview"
                srcDoc={previewHtml}
                sandbox=""
                className="w-full"
                style={{ height: 720, border: 0, background: "#fff" }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              প্রিভিউতে নমুনা তথ্য (যেমন দাতার নাম, পরিমাণ) দেখানো হচ্ছে — আসল ইমেইলে প্রকৃত মান বসবে।
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default EmailTemplatesPanel;
