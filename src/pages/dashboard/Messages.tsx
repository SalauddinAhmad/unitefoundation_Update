import { Card, PageHeader, StatusBadge } from "@/components/dashboard/DashboardUI";
import { useMessages } from "@/hooks/api/useDashboardData";
import {

  Search,
  Star,
  Archive,
  Reply,
  Trash2,
  Plus,
  X,
  Send,
  Loader2,
  Mail,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Paperclip,
  Eye,
  PenLine,
  Smile,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code as CodeIcon,
  Palette,
  FileText,
  Minimize2,
  Maximize2,
  ChevronDown,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

type ReplyItem = { id: string; body: string; at: string };
type MessageEx = {
  id: string;
  name: string;
  email: string;
  subject: string;
  preview: string;
  date: string;
  status: "unread" | "read" | "replied";
  replies?: ReplyItem[];
};

const Messages = () => {
  const { data: apiMessages, isLoading } = useMessages();
  const [list, setList] = useState<MessageEx[]>([]);
  const [selected, setSelected] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<"idle" | "ok" | "fail" | "auth" | "network" | "checking">("idle");
  const [smtpError, setSmtpError] = useState<string>("");

  useEffect(() => {
    if (apiMessages) {
      const msgs = apiMessages as MessageEx[];
      setList(msgs);
      if (!selected && msgs.length > 0) setSelected(msgs[0].id);
    }
  }, [apiMessages, selected]);


  // SMTP health check
  useEffect(() => {
    (async () => {
      setSmtpStatus("checking");
      try {
        await api.get("/health/smtp", { auth: false });
        try {
          const d = await api.get<{ token?: { valid: boolean; reason?: string } }>("/health/auth");
          if (d?.token && !d.token.valid) {
            setSmtpStatus("auth");
            setSmtpError(
              d.token.reason?.includes("expired")
                ? "লগইন সেশনের মেয়াদ শেষ হয়েছে — আবার লগইন করুন"
                : `টোকেন অবৈধ (${d.token.reason || "unknown"}) — লগআউট করে আবার লগইন করুন`,
            );
            return;
          }
        } catch {}
        setSmtpStatus("ok");
        setSmtpError("");
      } catch (e: unknown) {
        if (e instanceof ApiError && e.status === 404) {
          try {
            await api.get("/messages/smtp/test");
            setSmtpStatus("ok");
            setSmtpError("");
            return;
          } catch (e2: unknown) {
            if (e2 instanceof ApiError && e2.status === 401) {
              setSmtpStatus("auth");
              setSmtpError("লগইন সেশনের মেয়াদ শেষ হয়েছে — আবার লগইন করুন");
              return;
            }
            e = e2;
          }
        }
        if (!(e instanceof ApiError)) {
          setSmtpStatus("network");
          setSmtpError((e as Error)?.message || String(e));
          return;
        }
        setSmtpStatus("fail");
        const anyE = e as { data?: { error?: string; message?: string }; message?: string };
        setSmtpError(anyE?.data?.error || anyE?.data?.message || anyE?.message || String(e));
      }
    })();
  }, []);

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

  const openMessage = async (id: string) => {
    setSelected(id);
    setReplyText("");
    const msg = list.find((m) => m.id === id);
    if (msg && msg.status === "unread") {
      try {
        await api.patch(`/messages/${id}`, { status: "read" });
        const next = list.map((m) => (m.id === id ? { ...m, status: "read" as const } : m));
        update(next);
      } catch (e) {
        console.error("[messages] status update failed", e);
      }
    }
  };

  const removeActive = async () => {
    if (!active) return;
    try {
      await api.delete(`/messages/${active.id}`);
      const next = list.filter((m) => m.id !== active.id);
      update(next);
      setSelected(next[0]?.id);
      toast.success("মেসেজ ডিলিট করা হয়েছে");
    } catch (e) {
      console.error("[messages] delete failed", e);
      toast.error("মেসেজ ডিলিট করা যায়নি");
    }
  };

  const sendReply = async () => {
    if (!active || !replyText.trim()) return;
    setSending(true);
    try {
      await api.post(`/messages/${active.id}/reply`, {
        to: active.email,
        subject: `Re: ${active.subject}`,
        body: replyText,
      });
      const reply: ReplyItem = {
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
      toast.success("SMTP এর মাধ্যমে উত্তর পাঠানো হয়েছে ✅");
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        toast.error("আপনার লগইন সেশনের মেয়াদ শেষ হয়েছে — লগআউট করে আবার লগইন করুন, তারপর মেসেজ পাঠান।");
        setSending(false);
        return;
      }
      const anyE = e as { data?: { error?: string; message?: string }; message?: string };
      const msg = anyE?.data?.error || anyE?.data?.message || anyE?.message || "উত্তর পাঠানো যায়নি";
      toast.error(`SMTP ব্যর্থ: ${msg}`);
    } finally {
      setSending(false);
    }
  };

  const sendNew = async (data: {
    to: string[];
    cc: string[];
    bcc: string[];
    subject: string;
    html: string;
    attachments: { name: string; size: number }[];
  }) => {
    try {
      await api.post(`/messages/compose`, {
        to: data.to,
        cc: data.cc,
        bcc: data.bcc,
        subject: data.subject,
        html: data.html,
      });
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        toast.error("আপনার লগইন সেশনের মেয়াদ শেষ হয়েছে — লগআউট করে আবার লগইন করুন, তারপর মেসেজ পাঠান।");
        return;
      }
      const anyE = e as { data?: { error?: string; message?: string }; message?: string };
      const msg = anyE?.data?.error || anyE?.data?.message || anyE?.message || "মেসেজ পাঠানো যায়নি";
      toast.error(`SMTP ব্যর্থ: ${msg}`);
      return;
    }
    const newMsg: MessageEx = {
      id: `M-${Math.floor(Math.random() * 9000) + 1000}`,
      name: data.to[0] || "প্রাপক",
      email: data.to[0] || "",
      subject: data.subject,
      preview: data.html.replace(/<[^>]+>/g, "").slice(0, 80),
      date: "এইমাত্র",
      status: "replied",
      replies: [{ id: `R-${Date.now()}`, body: data.html, at: new Date().toLocaleString("bn-BD") }],
    };
    const next = [newMsg, ...list];
    update(next);
    setSelected(newMsg.id);
    setComposeOpen(false);
    toast.success(`${data.to.join(", ")} ঠিকানায় মেসেজ পাঠানো হয়েছে ✅`);
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

      {/* SMTP status banner */}
      {smtpStatus !== "idle" && smtpStatus !== "ok" && (
        <div
          className={
            "mb-4 rounded-lg border px-4 py-3 text-sm flex items-start gap-3 " +
            (smtpStatus === "fail"
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : "border-border bg-secondary/40 text-muted-foreground")
          }
        >
          <Mail className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="min-w-0">
            {smtpStatus === "checking" && <span>SMTP সার্ভার যাচাই করা হচ্ছে...</span>}
            {smtpStatus === "auth" && (
              <>
                <div className="font-semibold">লগইন টোকেন সমস্যা — SMTP ঠিক আছে ✅</div>
                <div className="text-xs mt-1 break-all opacity-90">{smtpError}</div>
                <div className="text-xs mt-1 opacity-90">
                  এটি SMTP-এর সমস্যা নয়।{" "}
                  <a href="/login" className="underline font-semibold">
                    লগইন পেজে যান
                  </a>
                </div>
              </>
            )}
            {smtpStatus === "network" && (
              <>
                <div className="font-semibold">API সার্ভারে সংযোগ করা যায়নি</div>
                <div className="text-xs mt-1 break-all opacity-90">{smtpError}</div>
                <div className="text-xs mt-2 text-foreground/70">
                  এটি SMTP-এর সমস্যা নয় — সার্ভার request block করছে (CORS) অথবা নেটওয়ার্ক
                  সমস্যা। cPanel → Setup Node.js App → Environment Variables-এ{" "}
                  <code className="font-mono">CORS_ORIGINS</code> ঠিক আছে কিনা দেখুন এবং
                  নতুন backend deploy করে app <b>Restart</b> করুন।
                </div>
              </>
            )}
            {smtpStatus === "fail" && (
              <>
                <div className="font-semibold">SMTP সার্ভার কাজ করছে না — মেসেজ পাঠানো যাবে না</div>
                <div className="text-xs mt-1 break-all opacity-90">{smtpError}</div>
                <div className="text-xs mt-2 text-foreground/70">
                  cPanel → Setup Node.js App → Environment Variables-এ যোগ করুন:{" "}
                  <code className="font-mono">SMTP_HOST</code>,{" "}
                  <code className="font-mono">SMTP_PORT</code>,{" "}
                  <code className="font-mono">SMTP_USER</code>,{" "}
                  <code className="font-mono">SMTP_PASS</code>,{" "}
                  <code className="font-mono">SMTP_FROM</code> → তারপর app <b>Restart</b> করুন।
                </div>
              </>
            )}
          </div>
        </div>
      )}


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
                        {/^<.+>/.test(r.body.trim()) ? (
                          <div className="prose prose-sm max-w-none text-foreground/85" dangerouslySetInnerHTML={{ __html: r.body }} />
                        ) : (
                          <p className="whitespace-pre-wrap text-foreground/85">{r.body}</p>
                        )}
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

/* ============================================================
   Premium Compose Modal — rich text, images, attachments,
   templates, preview, expand, CC/BCC.
   ============================================================ */

type Recipient = string;

const TEMPLATES = [
  {
    id: "blank",
    name: "ফাঁকা",
    subject: "",
    html: "",
  },
  {
    id: "thanks",
    name: "ধন্যবাদ বার্তা",
    subject: "আপনাকে ধন্যবাদ",
    html: `<p>আসসালামু আলাইকুম,</p><p>আপনার সদয় সহযোগিতার জন্য <b>ইউনাইট ফাউন্ডেশন</b> আন্তরিকভাবে কৃতজ্ঞ। আপনার অবদান আমাদের মানবিক কাজগুলোকে এগিয়ে নিতে অসামান্য ভূমিকা রাখছে।</p><p>মহান আল্লাহ আপনাকে উত্তম প্রতিদান দান করুন।</p><p>— ইউনাইট ফাউন্ডেশন টিম</p>`,
  },
  {
    id: "donation",
    name: "ডোনেশন রিসিট",
    subject: "আপনার দান গৃহীত হয়েছে",
    html: `<p>আসসালামু আলাইকুম,</p><p>আপনার দান <b>সফলভাবে গৃহীত</b> হয়েছে। নিচে রসিদের বিবরণ দেওয়া হলো:</p><ul><li>রসিদ নম্বর: <b>UF-XXXXX</b></li><li>পরিমাণ: <b>৳ ___</b></li><li>তারিখ: ___</li></ul><p>জাযাকাল্লাহু খাইরান।</p>`,
  },
  {
    id: "volunteer",
    name: "স্বেচ্ছাসেবক স্বাগতম",
    subject: "ইউনাইট ফাউন্ডেশনে আপনাকে স্বাগতম",
    html: `<p>প্রিয় স্বেচ্ছাসেবক,</p><p>আপনার আবেদন গৃহীত হয়েছে। শিগগিরই আমাদের টিম আপনার সাথে যোগাযোগ করবে এবং পরবর্তী ধাপের নির্দেশনা প্রদান করবে।</p><p>— ইউনাইট ফাউন্ডেশন</p>`,
  },
];

const COLORS = ["#0F172A", "#1F6F4A", "#2563EB", "#DC2626", "#D97706", "#7C3AED", "#0891B2", "#64748B"];

const ComposeModal = ({
  onClose,
  onSend,
}: {
  onClose: () => void;
  onSend: (d: {
    to: string[];
    cc: string[];
    bcc: string[];
    subject: string;
    html: string;
    attachments: { name: string; size: number }[];
  }) => Promise<void>;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [to, setTo] = useState<Recipient[]>([]);
  const [cc, setCc] = useState<Recipient[]>([]);
  const [bcc, setBcc] = useState<Recipient[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [attachments, setAttachments] = useState<{ name: string; size: number; url?: string }[]>([]);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showTpl, setShowTpl] = useState(false);
  const [showColor, setShowColor] = useState(false);

  // Insert initial template HTML
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = `<p>আসসালামু আলাইকুম,</p><p><br/></p><p>— ইউনাইট ফাউন্ডেশন</p>`;
      setHtml(editorRef.current.innerHTML);
    }
  }, []);

  const cmd = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    if (editorRef.current) setHtml(editorRef.current.innerHTML);
  };

  const onEditorInput = () => {
    if (editorRef.current) setHtml(editorRef.current.innerHTML);
  };

  const insertImage = () => {
    const url = window.prompt("ছবির URL দিন:", "https://");
    if (url && /^https?:\/\//.test(url)) {
      cmd("insertHTML", `<img src="${url}" alt="image" style="max-width:100%;border-radius:8px;margin:8px 0" />`);
    }
  };

  const insertLink = () => {
    const url = window.prompt("লিংক URL দিন:", "https://");
    if (url && /^https?:\/\//.test(url)) cmd("createLink", url);
  };

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const { compressImageToDataURL } = await import("@/lib/imageCompress");
    const arr: { name: string; size: number; url?: string }[] = [];
    for (const f of Array.from(files)) {
      const item: { name: string; size: number; url?: string } = { name: f.name, size: f.size };
      if (f.type.startsWith("image/")) {
        try {
          const url = await compressImageToDataURL(f, { maxWidth: 1600, quality: 0.75, mimeType: "image/webp" });
          item.url = url;
          item.size = Math.round((url.length * 3) / 4);
          cmd("insertHTML", `<img src="${url}" alt="${f.name}" style="max-width:100%;border-radius:8px;margin:8px 0" />`);
        } catch {
          const url = URL.createObjectURL(f);
          item.url = url;
          cmd("insertHTML", `<img src="${url}" alt="${f.name}" style="max-width:100%;border-radius:8px;margin:8px 0" />`);
        }
      }
      arr.push(item);
    }
    setAttachments((p) => [...p, ...arr]);
  };

  const addRecipient = (kind: "to" | "cc" | "bcc", value: string) => {
    const v = value.trim().replace(/,$/, "");
    if (!v) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      toast.error("সঠিক ইমেইল ঠিকানা দিন");
      return;
    }
    const set = kind === "to" ? setTo : kind === "cc" ? setCc : setBcc;
    set((prev) => (prev.includes(v) ? prev : [...prev, v]));
  };

  const applyTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t || !editorRef.current) return;
    setSubject(t.subject);
    editorRef.current.innerHTML = t.html || "<p><br/></p>";
    setHtml(editorRef.current.innerHTML);
    setShowTpl(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (to.length === 0) return toast.error("কমপক্ষে একজন প্রাপক যুক্ত করুন");
    if (!subject.trim()) return toast.error("বিষয় লিখুন");
    if (!html.replace(/<[^>]+>/g, "").trim()) return toast.error("মেসেজ লিখুন");

    setSending(true);
    await onSend({
      to,
      cc,
      bcc,
      subject,
      html,
      attachments: attachments.map(({ name, size }) => ({ name, size })),
    });
    setSending(false);
  };

  const charCount = html.replace(/<[^>]+>/g, "").length;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6">
      <div
        className={
          "w-full bg-card rounded-t-2xl md:rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col " +
          (expanded ? "max-w-[1200px] h-[95vh]" : "max-w-3xl max-h-[90vh]")
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center shadow-sm">
              <PenLine className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">নতুন মেসেজ</h3>
              <p className="text-[11px] text-muted-foreground">SMTP-এর মাধ্যমে সরাসরি পাঠানো হবে</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              className={
                "px-2.5 py-1.5 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition " +
                (preview ? "bg-primary text-primary-foreground" : "hover:bg-secondary")
              }
            >
              <Eye className="h-3.5 w-3.5" /> {preview ? "এডিট" : "প্রিভিউ"}
            </button>
            <button type="button" onClick={() => setExpanded((e) => !e)} className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground" title="পূর্ণ স্ক্রিন">
              {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button type="button" onClick={onClose} className="p-2 rounded-md hover:bg-secondary"><X className="h-4 w-4" /></button>
          </div>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-hidden flex flex-col">
          {/* Recipients */}
          <div className="px-5 py-3 border-b border-border space-y-2 bg-background/50">
            <RecipientField
              label="প্রাপক"
              values={to}
              onAdd={(v) => addRecipient("to", v)}
              onRemove={(v) => setTo((p) => p.filter((x) => x !== v))}
              right={
                <div className="flex gap-2 text-[11px] font-semibold">
                  {!showCc && <button type="button" onClick={() => setShowCc(true)} className="text-muted-foreground hover:text-primary">Cc</button>}
                  {!showBcc && <button type="button" onClick={() => setShowBcc(true)} className="text-muted-foreground hover:text-primary">Bcc</button>}
                </div>
              }
            />
            {showCc && (
              <RecipientField label="Cc" values={cc} onAdd={(v) => addRecipient("cc", v)} onRemove={(v) => setCc((p) => p.filter((x) => x !== v))} />
            )}
            {showBcc && (
              <RecipientField label="Bcc" values={bcc} onAdd={(v) => addRecipient("bcc", v)} onRemove={(v) => setBcc((p) => p.filter((x) => x !== v))} />
            )}
            <div className="flex items-center gap-3 border-t border-border pt-2">
              <span className="text-[11px] font-bold text-muted-foreground w-14">বিষয়</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="মেসেজের বিষয় লিখুন..."
                className="flex-1 bg-transparent text-sm font-semibold focus:outline-none placeholder:font-normal placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Toolbar */}
          {!preview && (
            <div className="px-3 py-2 border-b border-border flex flex-wrap items-center gap-0.5 bg-muted/30">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTpl((s) => !s)}
                  className="px-2.5 py-1.5 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-secondary"
                >
                  <FileText className="h-3.5 w-3.5" /> টেমপ্লেট <ChevronDown className="h-3 w-3" />
                </button>
                {showTpl && (
                  <div className="absolute top-full left-0 mt-1 w-56 rounded-lg border border-border bg-card shadow-xl z-10 py-1">
                    {TEMPLATES.map((t) => (
                      <button key={t.id} type="button" onClick={() => applyTemplate(t.id)} className="w-full text-left px-3 py-2 text-xs hover:bg-secondary">
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-5 w-px bg-border mx-1" />
              <TBtn onClick={() => cmd("bold")} icon={Bold} title="বোল্ড" />
              <TBtn onClick={() => cmd("italic")} icon={Italic} title="ইটালিক" />
              <TBtn onClick={() => cmd("underline")} icon={Underline} title="আন্ডারলাইন" />

              <div className="h-5 w-px bg-border mx-1" />
              <select
                onChange={(e) => { cmd("formatBlock", e.target.value); e.target.value = "p"; }}
                defaultValue="p"
                className="bg-transparent text-xs font-semibold px-2 py-1.5 rounded-md hover:bg-secondary focus:outline-none cursor-pointer"
              >
                <option value="p">টেক্সট</option>
                <option value="h1">হেডিং ১</option>
                <option value="h2">হেডিং ২</option>
                <option value="h3">হেডিং ৩</option>
                <option value="blockquote">উদ্ধৃতি</option>
              </select>

              <div className="relative">
                <button type="button" onClick={() => setShowColor((s) => !s)} className="p-1.5 rounded-md hover:bg-secondary" title="রঙ">
                  <Palette className="h-3.5 w-3.5" />
                </button>
                {showColor && (
                  <div className="absolute top-full left-0 mt-1 p-2 rounded-lg border border-border bg-card shadow-xl z-10 flex gap-1.5">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { cmd("foreColor", c); setShowColor(false); }}
                        className="h-5 w-5 rounded-full border border-border hover:scale-110 transition"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="h-5 w-px bg-border mx-1" />
              <TBtn onClick={() => cmd("insertUnorderedList")} icon={List} title="বুলেট" />
              <TBtn onClick={() => cmd("insertOrderedList")} icon={ListOrdered} title="সংখ্যা" />
              <TBtn onClick={() => cmd("formatBlock", "blockquote")} icon={Quote} title="উদ্ধৃতি" />
              <TBtn onClick={() => cmd("formatBlock", "pre")} icon={CodeIcon} title="কোড" />

              <div className="h-5 w-px bg-border mx-1" />
              <TBtn onClick={() => cmd("justifyLeft")} icon={AlignLeft} title="বাম" />
              <TBtn onClick={() => cmd("justifyCenter")} icon={AlignCenter} title="মাঝে" />
              <TBtn onClick={() => cmd("justifyRight")} icon={AlignRight} title="ডানে" />

              <div className="h-5 w-px bg-border mx-1" />
              <TBtn onClick={insertLink} icon={LinkIcon} title="লিংক" />
              <TBtn onClick={insertImage} icon={ImageIcon} title="ছবির লিংক" />
              <TBtn onClick={() => cmd("insertHTML", "😊")} icon={Smile} title="ইমোজি" />
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {preview ? (
              <div className="p-8 max-w-2xl mx-auto">
                <div className="rounded-2xl border border-border overflow-hidden bg-white">
                  <div className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground p-6 text-center">
                    <div className="text-xs font-bold tracking-[0.2em] opacity-80">UNITE FOUNDATION</div>
                    <div className="mt-2 text-xl font-bold">{subject || "মেসেজের বিষয়"}</div>
                  </div>
                  <div className="p-7 text-sm text-foreground/85 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
                  <div className="p-5 bg-muted/40 border-t border-border text-center text-[11px] text-muted-foreground">
                    © ইউনাইট ফাউন্ডেশন · unitefoundation.bd
                  </div>
                </div>
              </div>
            ) : (
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={onEditorInput}
                className="min-h-[260px] p-6 text-sm leading-relaxed focus:outline-none prose prose-sm max-w-none [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_a]:text-primary [&_a]:underline [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-md"
              />
            )}

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="px-6 pb-4 flex flex-wrap gap-2">
                {attachments.map((a, i) => (
                  <div key={i} className="inline-flex items-center gap-2 bg-secondary border border-border rounded-lg pl-2 pr-1 py-1 text-xs">
                    <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium max-w-[160px] truncate">{a.name}</span>
                    <span className="text-muted-foreground">{(a.size / 1024).toFixed(0)} KB</span>
                    <button
                      type="button"
                      onClick={() => setAttachments((p) => p.filter((_, idx) => idx !== i))}
                      className="ml-1 p-0.5 rounded hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-3 bg-background">
            <div className="flex items-center gap-1">
              <label className="p-2 rounded-md hover:bg-secondary cursor-pointer text-muted-foreground hover:text-foreground" title="ফাইল সংযুক্ত">
                <Paperclip className="h-4 w-4" />
                <input type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
              </label>
              <label className="p-2 rounded-md hover:bg-secondary cursor-pointer text-muted-foreground hover:text-foreground" title="ছবি আপলোড">
                <ImageIcon className="h-4 w-4" />
                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => onFiles(e.target.files)} />
              </label>
              <span className="ml-2 text-[11px] text-muted-foreground">
                {charCount} অক্ষর · {attachments.length} সংযুক্তি
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-secondary">
                বাতিল
              </button>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/85 text-primary-foreground font-semibold px-5 py-2 rounded-lg text-sm shadow-md hover:shadow-lg disabled:opacity-60 transition"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                পাঠান
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const TBtn = ({ onClick, icon: Icon, title }: { onClick: () => void; icon: any; title: string }) => (
  <button type="button" onClick={onClick} title={title} className="p-1.5 rounded-md hover:bg-secondary text-foreground/80 hover:text-foreground">
    <Icon className="h-3.5 w-3.5" />
  </button>
);

const RecipientField = ({
  label,
  values,
  onAdd,
  onRemove,
  right,
}: {
  label: string;
  values: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  right?: React.ReactNode;
}) => {
  const [input, setInput] = useState("");
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-bold text-muted-foreground w-14">{label}</span>
      <div className="flex-1 flex flex-wrap items-center gap-1.5">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
            {v}
            <button type="button" onClick={() => onRemove(v)} className="hover:bg-primary/20 rounded-full">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "," || e.key === " ") {
              e.preventDefault();
              if (input.trim()) { onAdd(input); setInput(""); }
            } else if (e.key === "Backspace" && !input && values.length) {
              onRemove(values[values.length - 1]);
            }
          }}
          onBlur={() => { if (input.trim()) { onAdd(input); setInput(""); } }}
          placeholder={values.length === 0 ? "email@example.com" : ""}
          className="flex-1 min-w-[160px] bg-transparent text-sm focus:outline-none py-1"
        />
      </div>
      {right}
    </div>
  );
};

export default Messages;
