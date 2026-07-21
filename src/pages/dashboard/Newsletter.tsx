import { useEffect, useMemo, useState } from "react";
import { Card, PageHeader } from "@/components/dashboard/DashboardUI";
import { Mail, Search, Trash2, Download, Loader2, Send, X, Eye } from "lucide-react";
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
    </>
  );
};

export default Newsletter;
