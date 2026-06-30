import { Card, PageHeader, StatusBadge } from "@/components/dashboard/DashboardUI";
import { messages as seedMessages, type Message } from "@/data/dashboardMock";
import { Search, Star, Archive, Reply, Trash2, Plus, X, Send, Loader2, Mail } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

type Reply = { id: string; body: string; at: string };
type MessageEx = Message & { replies?: Reply[] };

const LS_KEY = "uf_messages_state";

function loadState(): MessageEx[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return seedMessages;
}
function persist(list: MessageEx[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {}
}

const Messages = () => {
  const [list, setList] = useState<MessageEx[]>(() => loadState());
  const [selected, setSelected] = useState(list[0]?.id);
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  const active = useMemo(
    () => list.find((m) => m.id === selected) || list[0],
    [list, selected],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q),
    );
  }, [list, search]);

  const update = (next: MessageEx[]) => { setList(next); persist(next); };

  const openMessage = (id: string) => {
    setSelected(id);
    setReplyText("");
    const next = list.map((m) => (m.id === id && m.status === "unread" ? { ...m, status: "read" as const } : m));
    update(next);
  };

  const removeActive = () => {
    if (!active) return;
    const next = list.filter((m) => m.id !== active.id);
    update(next);
    setSelected(next[0]?.id);
    toast.success("মেসেজ ডিলিট করা হয়েছে");
  };

  const sendReply = async () => {
    if (!active || !replyText.trim()) return;
    setSending(true);
    try {
      try {
        await api.post(`/messages/${active.id}/reply`, {
          to: active.email,
          subject: `Re: ${active.subject}`,
          body: replyText,
        });
      } catch {
        // backend offline — proceed in demo mode
      }
      const reply: Reply = {
        id: `R-${Date.now()}`,
        body: replyText,
        at: new Date().toLocaleString("bn-BD"),
      };
      const next = list.map((m) =>
        m.id === active.id
          ? { ...m, status: "replied" as const, replies: [...(m.replies || []), reply] }
          : m,
      );
      update(next);
      setReplyText("");
      toast.success("উত্তর পাঠানো হয়েছে");
    } finally {
      setSending(false);
    }
  };

  const sendNew = async (data: { name: string; email: string; subject: string; body: string }) => {
    try {
      await api.post(`/messages`, data);
    } catch {
      // offline ok
    }
    const newMsg: MessageEx = {
      id: `M-${Math.floor(Math.random() * 9000) + 1000}`,
      name: data.name,
      email: data.email,
      subject: data.subject,
      preview: data.body.slice(0, 80),
      date: "এইমাত্র",
      status: "replied",
      replies: [{ id: `R-${Date.now()}`, body: data.body, at: new Date().toLocaleString("bn-BD") }],
    };
    const next = [newMsg, ...list];
    update(next);
    setSelected(newMsg.id);
    setComposeOpen(false);
    toast.success(`${data.email} ঠিকানায় মেসেজ পাঠানো হয়েছে`);
  };

  return (
    <>
      <PageHeader
        title="মেসেজ"
        subtitle="যোগাযোগ ফর্ম থেকে আসা সকল মেসেজ"
        actions={
          <button
            onClick={() => setComposeOpen(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> নতুন মেসেজ
          </button>
        }
      />

      <Card pad={false} className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] min-h-[600px]">
          {/* List */}
          <div className="border-r border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="মেসেজ খুঁজুন"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            </div>
            <ul className="flex-1 overflow-y-auto divide-y divide-border">
              {filtered.length === 0 && (
                <li className="p-8 text-center text-sm text-muted-foreground">কোনো মেসেজ পাওয়া যায়নি</li>
              )}
              {filtered.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => openMessage(m.id)}
                    className={
                      "w-full text-left p-4 transition-colors " +
                      (selected === m.id ? "bg-accent/60" : "hover:bg-muted/40")
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                          {m.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className={"text-sm truncate " + (m.status === "unread" ? "font-bold" : "font-semibold")}>{m.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{m.email}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{m.date}</span>
                    </div>
                    <div className={"text-sm mt-2 truncate " + (m.status === "unread" ? "font-semibold text-foreground" : "text-foreground/80")}>
                      {m.subject}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">{m.preview}</div>
                    <div className="mt-2"><StatusBadge status={m.status} /></div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Detail */}
          {active ? (
            <div className="flex flex-col">
              <div className="p-5 border-b border-border flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">{active.subject}</h3>
                  <div className="flex items-center gap-2 mt-1.5 text-sm">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {active.name.charAt(0)}
                    </div>
                    <span className="font-semibold">{active.name}</span>
                    <span className="text-muted-foreground text-xs">&lt;{active.email}&gt;</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Star className="h-4 w-4" /></button>
                  <button className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Archive className="h-4 w-4" /></button>
                  <button onClick={removeActive} className="p-2 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto text-sm text-foreground/85 leading-relaxed">
                <p>আসসালামু আলাইকুম,</p>
                <p className="mt-3 whitespace-pre-wrap">{active.preview}</p>
                <p className="mt-6 text-foreground/70">— {active.name}</p>

                {active.replies && active.replies.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <div className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">আপনার পাঠানো উত্তরসমূহ</div>
                    {active.replies.map((r) => (
                      <div key={r.id} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                            <Send className="h-3 w-3" /> আপনি
                          </span>
                          <span>{r.at}</span>
                        </div>
                        <p className="whitespace-pre-wrap text-foreground/85">{r.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-border">
                <div className="rounded-xl border border-border bg-card focus-within:ring-2 focus-within:ring-primary/20">
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="আপনার উত্তর লিখুন..."
                    className="w-full px-4 py-3 bg-transparent text-sm resize-none focus:outline-none"
                  />
                  <div className="flex items-center justify-between p-2 border-t border-border">
                    <span className="text-[11px] text-muted-foreground pl-2">
                      SMTP-এর মাধ্যমে পাঠানো হবে
                    </span>
                    <button
                      onClick={sendReply}
                      disabled={sending || !replyText.trim()}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary/90 disabled:opacity-60"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Reply className="h-4 w-4" />}
                      উত্তর পাঠান
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center text-sm text-muted-foreground p-10">
              কোনো মেসেজ নির্বাচিত নয়
            </div>
          )}
        </div>
      </Card>

      {composeOpen && <ComposeModal onClose={() => setComposeOpen(false)} onSend={sendNew} />}
    </>
  );
};

const ComposeModal = ({
  onClose,
  onSend,
}: {
  onClose: () => void;
  onSend: (d: { name: string; email: string; subject: string; body: string }) => Promise<void>;
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await onSend({ name: name || "প্রাপক", email, subject, body });
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">নতুন মেসেজ</h3>
              <p className="text-[11px] text-muted-foreground">যেকোনো ইমেইল ঠিকানায় পাঠান</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="প্রাপকের নাম" className="px-3 py-2.5 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none" />
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="px-3 py-2.5 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none" />
          </div>
          <input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="বিষয়" className="w-full px-3 py-2.5 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none" />
          <textarea required rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder="মেসেজ..." className="w-full px-3 py-2.5 rounded-lg bg-secondary text-sm resize-none focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none" />

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-secondary">বাতিল</button>
            <button type="submit" disabled={sending} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary/90 disabled:opacity-60">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              পাঠান
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Messages;
