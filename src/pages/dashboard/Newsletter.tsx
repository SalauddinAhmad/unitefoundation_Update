import { useEffect, useMemo, useState } from "react";
import { Card, PageHeader } from "@/components/dashboard/DashboardUI";
import { Mail, Search, Trash2, Download, Loader2, Send, X } from "lucide-react";
import { api, API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";


type Subscriber = {
  id: string;
  email: string;
  source: string | null;
  status: string;
  created_at: string;
};

const Newsletter = () => {
  const [list, setList] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const rows = await api.get<Subscriber[]>("/newsletter");
      setList(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.warn("[newsletter] load failed", e);
      toast.error("সাবস্ক্রাইবার লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((s) => s.email.toLowerCase().includes(term));
  }, [list, q]);

  const removeOne = async (id: string) => {
    if (!confirm("এই সাবস্ক্রাইবার ডিলিট করবেন?")) return;
    try {
      await api.delete(`/newsletter/${id}`);
      setList((prev) => prev.filter((s) => s.id !== id));
      toast.success("ডিলিট করা হয়েছে");
    } catch {
      toast.error("ডিলিট করা যায়নি");
    }
  };

  const exportCsv = () => {
    const url = `${API_BASE_URL}/newsletter/export.csv`;
    window.open(url, "_blank");
  };

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleString("bn-BD"); } catch { return d; }
  };

  const [composeOpen, setComposeOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="নিউজলেটার সাবস্ক্রাইবার"
        subtitle={`মোট ${list.length} জন সাবস্ক্রাইবার`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setComposeOpen(true)}
              disabled={list.length === 0}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> সবাইকে ইমেইল পাঠান
            </button>
            <button
              onClick={exportCsv}
              disabled={list.length === 0}
              className="inline-flex items-center gap-2 bg-secondary text-foreground font-semibold px-4 py-2 rounded-lg text-sm hover:bg-secondary/70 disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> CSV
            </button>
          </div>
        }
      />


      <Card pad={false} className="overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ইমেইল খুঁজুন"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> লোড হচ্ছে…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            <Mail className="h-8 w-8 mx-auto mb-2 opacity-40" />
            কোনো সাবস্ক্রাইবার পাওয়া যায়নি
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">ইমেইল</th>
                  <th className="text-left px-4 py-3 font-semibold">সোর্স</th>
                  <th className="text-left px-4 py-3 font-semibold">তারিখ</th>
                  <th className="text-right px-4 py-3 font-semibold">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{s.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.source || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{fmtDate(s.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => removeOne(s.id)}
                        className="inline-flex items-center gap-1 text-destructive hover:bg-destructive/10 px-2 py-1 rounded-md text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> ডিলিট
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {composeOpen && (
        <BroadcastModal
          totalActive={list.filter((s) => s.status === "active").length}
          onClose={() => setComposeOpen(false)}
        />
      )}
    </>
  );
};

type BroadcastModalProps = { totalActive: number; onClose: () => void };

const BroadcastModal = ({ totalActive, onClose }: BroadcastModalProps) => {
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [preheader, setPreheader] = useState("");
  const [message, setMessage] = useState("");
  const [testTo, setTestTo] = useState("");
  const [sending, setSending] = useState(false);
  const isHtml = false;

  const validate = () => {
    if (!subject.trim()) { toast.error("সাবজেক্ট দিন"); return false; }
    if (!message.trim()) { toast.error("মেসেজ লিখুন"); return false; }
    return true;
  };

  const sendTest = async () => {
    if (!testTo.trim()) { toast.error("টেস্ট ইমেইল দিন"); return; }
    if (!validate()) return;
    setSending(true);
    try {
      await api.post("/newsletter/broadcast", { subject, title, preheader, message, isHtml, testTo });
      toast.success(`টেস্ট ইমেইল পাঠানো হয়েছে: ${testTo}`);
    } catch (e: any) {
      toast.error(e?.message || "টেস্ট পাঠানো যায়নি");
    } finally {
      setSending(false);
    }
  };

  const sendAll = async () => {
    if (!validate()) return;
    if (!confirm(`${totalActive} জন সাবস্ক্রাইবারকে আলাদা আলাদা ইমেইল পাঠানো হবে। নিশ্চিত?`)) return;
    setSending(true);
    try {
      const r: any = await api.post("/newsletter/broadcast", { subject, title, preheader, message, isHtml });
      toast.success(`${r?.total ?? totalActive} জনকে পাঠানো শুরু হয়েছে (ব্যাকগ্রাউন্ডে)`);
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "পাঠানো যায়নি");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2"><Send className="h-4 w-4" /> সবাইকে ইমেইল পাঠান</h3>
            <p className="text-xs text-muted-foreground mt-0.5">প্রত্যেক সাবস্ক্রাইবারের কাছে আলাদা ইমেইল যাবে ({totalActive} জন)</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">সাবজেক্ট *</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="ইমেইলের সাবজেক্ট"
              className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">টাইটেল (ঐচ্ছিক)</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="ইমেইলের ভিতরের বড় শিরোনাম"
                className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">প্রি-হেডার (ঐচ্ছিক)</label>
              <input value={preheader} onChange={(e) => setPreheader(e.target.value)}
                placeholder="ইনবক্স প্রিভিউ টেক্সট"
                className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-muted-foreground">মেসেজ *</label>
              <label className="text-xs flex items-center gap-1.5 text-muted-foreground">
                <input type="checkbox" checked={isHtml} onChange={(e) => setIsHtml(e.target.checked)} />
                HTML হিসেবে পাঠান
              </label>
            </div>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)}
              rows={9}
              placeholder={isHtml ? "<p>Hello ...</p>" : "আসসালামু আলাইকুম..."}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm font-[inherit] focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none" />
          </div>
          <div className="border-t border-border pt-3">
            <label className="text-xs font-semibold text-muted-foreground">টেস্ট ইমেইল (ঐচ্ছিক)</label>
            <div className="mt-1 flex gap-2">
              <input value={testTo} onChange={(e) => setTestTo(e.target.value)}
                placeholder="test@example.com"
                className="flex-1 px-3 py-2 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none" />
              <button onClick={sendTest} disabled={sending}
                className="px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/70 text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" /> টেস্ট
              </button>
            </div>
          </div>

          {preview && (
            <div className="border border-border rounded-lg p-3 bg-background">
              <div className="text-xs font-semibold text-muted-foreground mb-1">প্রিভিউ (বডি)</div>
              {isHtml
                ? <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: message }} />
                : <div className="whitespace-pre-wrap text-sm">{message}</div>}
            </div>
          )}
        </div>

        <div className="border-t border-border px-5 py-3 flex items-center justify-between gap-2 bg-secondary/30">
          <button onClick={() => setPreview((p) => !p)}
            className="text-sm px-3 py-2 rounded-lg hover:bg-secondary inline-flex items-center gap-1.5">
            <Eye className="h-4 w-4" /> {preview ? "প্রিভিউ বন্ধ" : "প্রিভিউ"}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold hover:bg-secondary rounded-lg">বাতিল</button>
            <button onClick={sendAll} disabled={sending}
              className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-2">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              সবাইকে পাঠান ({totalActive})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;

