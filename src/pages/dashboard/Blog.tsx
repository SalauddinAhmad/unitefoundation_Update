import { Card, PageHeader, StatusBadge } from "@/components/dashboard/DashboardUI";
import type { BlogPost } from "@/data/dashboardMock";
import {
  Plus, Edit3, Eye, Trash2, Search, X, Save, Image as ImageIcon,
  Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Quote,
  AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Code as CodeIcon,
  FileText, Calendar, Clock, BarChart3, FolderTree, Loader2, Filter,
  ChevronDown, Globe, Archive, Copy, Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  usePostsAdmin,
  useSavePost,
  useDeletePost,
  type ApiPost,
} from "@/hooks/api/usePublic";

type Post = BlogPost & {
  excerpt?: string;
  cover?: string;
  tags?: string[];
  html?: string;
  slug?: string;
};

const CATEGORIES = ["ইসলামিক", "দাওয়াহ", "সংবাদ", "রিপোর্ট", "প্রকল্প", "ইভেন্ট"];

// ---- API ↔ UI mappers ----
function apiToUi(row: ApiPost): Post {
  const dateStr = (row.published_at || row.created_at || "").slice(0, 10);
  return {
    id: row.id,
    title: row.title,
    author: "এডিটোরিয়াল টিম",
    category: row.category || CATEGORIES[0],
    views: 0,
    date: dateStr || new Date().toISOString().slice(0, 10),
    status: (row.status as Post["status"]) || "draft",
    excerpt: row.excerpt || "",
    cover: row.cover_image_url || "",
    tags: row.category ? [row.category] : [],
    html: row.content || "",
    slug: row.slug || row.id,
  };
}
function uiToApi(p: Post): Partial<ApiPost> {
  const slug =
    p.slug ||
    p.title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]+/gu, "").slice(0, 80) ||
    `post-${Date.now()}`;
  return {
    title: p.title,
    slug,
    excerpt: p.excerpt || "",
    content: p.html || "",
    cover_image_url: p.cover || "",
    category: p.category,
    status: p.status === "published" ? "published" : "draft",
  };
}

export default function Blog() {
  const { data: rows = [], isLoading } = usePostsAdmin();
  const saveMut = useSavePost();
  const delMut = useDeletePost();

  const list = useMemo<Post[]>(() => (rows as ApiPost[]).map(apiToUi), [rows]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "scheduled">("all");
  const [category, setCategory] = useState<string>("all");
  const [editor, setEditor] = useState<{ open: boolean; post?: Post }>({ open: false });
  const [viewer, setViewer] = useState<Post | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (category !== "all" && p.category !== category) return false;
      if (q && !p.title.toLowerCase().includes(q) && !p.author.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [list, search, filter, category]);

  const stats = useMemo(() => ({
    total: list.length,
    published: list.filter((p) => p.status === "published").length,
    draft: list.filter((p) => p.status === "draft").length,
    scheduled: list.filter((p) => p.status === "scheduled").length,
    views: list.reduce((s, p) => s + (p.views || 0), 0),
  }), [list]);

  const save = async (p: Post) => {
    const exists = list.some((x) => x.id === p.id);
    const data = uiToApi(p);
    try {
      if (exists) {
        await saveMut.mutateAsync({ id: p.id, data });
        toast.success("পোস্ট আপডেট হয়েছে");
      } else {
        await saveMut.mutateAsync({ data });
        toast.success("নতুন পোস্ট তৈরি হয়েছে");
      }
      setEditor({ open: false });
    } catch (e: any) {
      toast.error(e?.message || "সেভ করা যায়নি — লগইন যাচাই করুন");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("এই পোস্টটি ডিলিট করবেন?")) return;
    try {
      await delMut.mutateAsync(id);
      toast.success("পোস্ট ডিলিট করা হয়েছে");
    } catch (e: any) {
      toast.error(e?.message || "ডিলিট করা যায়নি");
    }
  };

  const duplicate = async (p: Post) => {
    const copy: Post = {
      ...p,
      id: "",
      title: p.title + " (কপি)",
      status: "draft",
      views: 0,
      slug: "",
      date: new Date().toISOString().slice(0, 10),
    };
    try {
      await saveMut.mutateAsync({ data: uiToApi(copy) });
      toast.success("পোস্ট কপি করা হয়েছে");
    } catch (e: any) {
      toast.error(e?.message || "কপি করা যায়নি");
    }
  };

  const togglePublish = async (p: Post) => {
    const next = p.status === "published" ? "draft" : "published";
    try {
      await saveMut.mutateAsync({ id: p.id, data: { status: next } });
      toast.success(next === "published" ? "পাবলিশ করা হয়েছে" : "ড্রাফট-এ পাঠানো হয়েছে");
    } catch (e: any) {
      toast.error(e?.message || "স্ট্যাটাস বদলানো যায়নি");
    }
  };

  return (
    <>
      <PageHeader
        title="ব্লগ ও কনটেন্ট"
        subtitle="পোস্ট তৈরি, সম্পাদনা ও প্রকাশনা — সম্পূর্ণ নিজস্ব নিয়ন্ত্রণে"
        actions={
          <button
            onClick={() => setEditor({ open: true })}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/85 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm shadow-md hover:shadow-lg transition"
          >
            <Plus className="h-4 w-4" /> নতুন পোস্ট
          </button>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Stat icon={FileText} label="মোট পোস্ট" value={stats.total} tone="primary" />
        <Stat icon={Globe} label="প্রকাশিত" value={stats.published} tone="emerald" />
        <Stat icon={Edit3} label="ড্রাফট" value={stats.draft} tone="amber" />
        <Stat icon={Calendar} label="সময়সূচি" value={stats.scheduled} tone="violet" />
        <Stat icon={BarChart3} label="মোট ভিউ" value={stats.views.toLocaleString()} tone="sky" />
      </div>

      <Card pad={false}>
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="শিরোনাম বা লেখক দিয়ে খুঁজুন"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
          <div className="inline-flex p-1 bg-secondary rounded-lg">
            {(["all", "published", "draft", "scheduled"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={
                  "px-3 py-1.5 rounded-md text-xs font-semibold transition " +
                  (filter === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")
                }
              >
                {s === "all" ? "সব" : s === "published" ? "প্রকাশিত" : s === "draft" ? "ড্রাফট" : "সময়সূচি"}
              </button>
            ))}
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none pl-9 pr-9 py-2 rounded-lg bg-secondary text-xs font-semibold focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none cursor-pointer"
            >
              <option value="all">সকল ক্যাটাগরি</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                <th className="font-semibold px-5 py-3">শিরোনাম</th>
                <th className="font-semibold py-3">লেখক</th>
                <th className="font-semibold py-3">ক্যাটাগরি</th>
                <th className="font-semibold py-3">ভিউ</th>
                <th className="font-semibold py-3">তারিখ</th>
                <th className="font-semibold py-3">স্ট্যাটাস</th>
                <th className="font-semibold py-3 pr-5 text-right">কর্ম</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-10 text-center text-sm text-muted-foreground">কোনো পোস্ট পাওয়া যায়নি</td></tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3 max-w-md">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {p.title.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{p.title}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{p.id} · {p.excerpt?.slice(0, 60)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-foreground/80">{p.author}</td>
                  <td className="py-3"><span className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs font-semibold">{p.category}</span></td>
                  <td className="py-3 font-bold tabular-nums">{p.views.toLocaleString()}</td>
                  <td className="py-3 text-foreground/70 text-xs whitespace-nowrap">{p.date}</td>
                  <td className="py-3"><StatusBadge status={p.status} /></td>
                  <td className="py-3 pr-5">
                    <div className="flex items-center justify-end gap-0.5">
                      <IconBtn title="দেখুন" onClick={() => setViewer(p)} icon={Eye} />
                      <IconBtn title="এডিট" onClick={() => setEditor({ open: true, post: p })} icon={Edit3} />
                      <IconBtn title="কপি" onClick={() => duplicate(p)} icon={Copy} />
                      <IconBtn
                        title={p.status === "published" ? "ড্রাফটে নিন" : "পাবলিশ করুন"}
                        onClick={() => togglePublish(p)}
                        icon={p.status === "published" ? Archive : Globe}
                      />
                      <button
                        onClick={() => remove(p.id)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editor.open && (
        <PostEditor
          post={editor.post}
          onClose={() => setEditor({ open: false })}
          onSave={save}
        />
      )}
      {viewer && <PostViewer post={viewer} onClose={() => setViewer(null)} onEdit={() => { setEditor({ open: true, post: viewer }); setViewer(null); }} />}
    </>
  );
}

/* ============================ Helpers ============================ */

const TONES: Record<string, string> = {
  primary: "from-primary/20 to-primary/5 text-primary",
  emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-700",
  amber: "from-amber-500/20 to-amber-500/5 text-amber-700",
  violet: "from-violet-500/20 to-violet-500/5 text-violet-700",
  sky: "from-sky-500/20 to-sky-500/5 text-sky-700",
};

const Stat = ({ icon: Icon, label, value, tone }: { icon: any; label: string; value: any; tone: string }) => (
  <Card>
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
        <div className="text-2xl font-extrabold mt-2">{value}</div>
      </div>
      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${TONES[tone]} flex items-center justify-center`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </Card>
);

const IconBtn = ({ icon: Icon, onClick, title }: { icon: any; onClick: () => void; title: string }) => (
  <button onClick={onClick} title={title} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground">
    <Icon className="h-4 w-4" />
  </button>
);

/* ============================ Editor ============================ */

function PostEditor({ post, onClose, onSave }: { post?: Post; onClose: () => void; onSave: (p: Post) => void }) {
  const isNew = !post;
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(post?.title || "");
  const [author, setAuthor] = useState(post?.author || "এডিটোরিয়াল টিম");
  const [category, setCategory] = useState(post?.category || CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [cover, setCover] = useState(post?.cover || "");
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<Post["status"]>(post?.status || "draft");
  const [date, setDate] = useState(post?.date || new Date().toISOString().slice(0, 10));
  const [html, setHtml] = useState(post?.html || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = post?.html || `<p>এখানে লিখুন...</p>`;
      setHtml(editorRef.current.innerHTML);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cmd = (c: string, v?: string) => { document.execCommand(c, false, v); editorRef.current?.focus(); if (editorRef.current) setHtml(editorRef.current.innerHTML); };

  const insertLink = () => { const u = prompt("লিংক URL দিন:", "https://"); if (u) cmd("createLink", u); };
  const insertImage = () => { const u = prompt("ছবির URL দিন:", "https://"); if (u) cmd("insertHTML", `<img src="${u}" alt="" style="max-width:100%;border-radius:10px;margin:10px 0"/>`); };
  const onImage = (f?: File) => { if (!f) return; const url = URL.createObjectURL(f); cmd("insertHTML", `<img src="${url}" alt="${f.name}" style="max-width:100%;border-radius:10px;margin:10px 0"/>`); };

  const addTag = (v: string) => {
    const t = v.trim().replace(/,$/, "");
    if (t && !tags.includes(t)) setTags([...tags, t]);
  };

  const submit = (publish?: boolean) => {
    if (!title.trim()) return toast.error("শিরোনাম দিন");
    setSaving(true);
    const finalStatus = publish ? "published" : status;
    const slug = title.toLowerCase().replace(/\s+/g, "-").slice(0, 80);
    const text = html.replace(/<[^>]+>/g, "").trim();
    const p: Post = {
      id: post?.id || `B-${Math.floor(Math.random() * 900) + 100}`,
      title: title.trim(),
      author: author.trim() || "এডিটোরিয়াল টিম",
      category,
      views: post?.views ?? 0,
      date,
      status: finalStatus,
      excerpt: excerpt.trim() || text.slice(0, 120),
      cover,
      tags,
      html,
      slug,
    };
    onSave(p);
    setSaving(false);
  };

  const wordCount = html.replace(/<[^>]+>/g, "").trim().split(/\s+/).filter(Boolean).length;
  const readMin = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-stretch justify-center">
      <div className="w-full bg-card shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 md:px-8 py-3.5 border-b border-border flex items-center justify-between gap-3 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-muted-foreground">{isNew ? "নতুন তৈরি" : `এডিট · ${post?.id}`}</div>
              <div className="font-bold truncate">{title || "শিরোনাম দিন..."}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-[11px] text-muted-foreground">{wordCount} শব্দ · {readMin} মিনিট পড়া</span>
            <button onClick={onClose} className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-secondary">বাতিল</button>
            <button onClick={() => submit(false)} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-border hover:bg-secondary disabled:opacity-60">
              <Save className="h-4 w-4" /> ড্রাফট সেভ
            </button>
            <button onClick={() => submit(true)} disabled={saving} className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary to-primary/85 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm shadow-md hover:shadow-lg disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />} পাবলিশ
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden grid lg:grid-cols-[1fr_320px]">
          {/* Editor area */}
          <div className="overflow-y-auto">
            <div className="max-w-3xl mx-auto px-5 md:px-10 py-8">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="পোস্টের শিরোনাম..."
                className="w-full bg-transparent text-3xl md:text-4xl font-extrabold focus:outline-none placeholder:text-muted-foreground/50"
              />
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="সংক্ষিপ্ত সারাংশ (excerpt)..."
                rows={2}
                className="mt-3 w-full bg-transparent text-base text-muted-foreground focus:outline-none resize-none placeholder:text-muted-foreground/50"
              />

              {/* Cover */}
              <div className="mt-5 rounded-2xl border-2 border-dashed border-border p-4">
                {cover ? (
                  <div className="relative">
                    <img src={cover} alt="cover" className="w-full max-h-64 object-cover rounded-xl" />
                    <button onClick={() => setCover("")} className="absolute top-2 right-2 p-1.5 rounded-md bg-card/90 border border-border hover:bg-destructive/10 hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      value={cover}
                      onChange={(e) => setCover(e.target.value)}
                      placeholder="কভার ছবির URL দিন বা আপলোড করুন"
                      className="flex-1 px-3 py-2.5 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                    <label className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary hover:bg-muted text-sm font-semibold cursor-pointer">
                      <ImageIcon className="h-4 w-4" /> আপলোড
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) setCover(URL.createObjectURL(f)); }}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Toolbar */}
              <div className="mt-6 sticky top-0 z-10 -mx-2 px-2 bg-card/95 backdrop-blur border-b border-border py-2 flex flex-wrap items-center gap-0.5">
                <TBtn onClick={() => cmd("formatBlock", "h1")} icon={Heading1} title="হেডিং ১" />
                <TBtn onClick={() => cmd("formatBlock", "h2")} icon={Heading2} title="হেডিং ২" />
                <div className="h-5 w-px bg-border mx-1" />
                <TBtn onClick={() => cmd("bold")} icon={Bold} title="বোল্ড" />
                <TBtn onClick={() => cmd("italic")} icon={Italic} title="ইটালিক" />
                <TBtn onClick={() => cmd("underline")} icon={Underline} title="আন্ডারলাইন" />
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
                <TBtn onClick={insertImage} icon={ImageIcon} title="ছবির URL" />
                <label className="p-1.5 rounded-md hover:bg-secondary text-foreground/80 hover:text-foreground cursor-pointer" title="ছবি আপলোড">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onImage(e.target.files?.[0])} />
                </label>
              </div>

              {/* Editor */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={() => editorRef.current && setHtml(editorRef.current.innerHTML)}
                className="mt-4 min-h-[400px] focus:outline-none text-base leading-relaxed prose prose-base max-w-none [&_h1]:text-3xl [&_h1]:font-extrabold [&_h2]:text-2xl [&_h2]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_a]:text-primary [&_a]:underline [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_img]:rounded-xl [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
              />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="border-t lg:border-t-0 lg:border-l border-border bg-muted/30 overflow-y-auto p-5 space-y-5">
            <Section title="প্রকাশনা" icon={Globe}>
              <Field label="স্ট্যাটাস">
                <select value={status} onChange={(e) => setStatus(e.target.value as Post["status"])} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm">
                  <option value="draft">ড্রাফট</option>
                  <option value="published">প্রকাশিত</option>
                  <option value="scheduled">সময়সূচি</option>
                </select>
              </Field>
              <Field label="তারিখ">
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg bg-card border border-border text-sm" />
                </div>
              </Field>
            </Section>

            <Section title="বিবরণ" icon={FolderTree}>
              <Field label="লেখক">
                <input value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
              </Field>
              <Field label="ক্যাটাগরি">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="ট্যাগ">
                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-card border border-border">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                      {t}
                      <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); setTagInput(""); }
                    }}
                    placeholder={tags.length === 0 ? "ট্যাগ যোগ করুন..." : ""}
                    className="flex-1 min-w-[100px] bg-transparent text-xs focus:outline-none py-0.5"
                  />
                </div>
              </Field>
            </Section>

            <Section title="পরিসংখ্যান" icon={BarChart3}>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-card border border-border p-3">
                  <div className="text-lg font-extrabold">{wordCount}</div>
                  <div className="text-[10px] text-muted-foreground">শব্দ</div>
                </div>
                <div className="rounded-lg bg-card border border-border p-3">
                  <div className="text-lg font-extrabold">{readMin}</div>
                  <div className="text-[10px] text-muted-foreground">মিনিট পড়া</div>
                </div>
              </div>
            </Section>
          </aside>
        </div>
      </div>
    </div>
  );
}

const Section = ({ title, icon: Icon, children }: any) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
      <Icon className="h-3.5 w-3.5" /> {title}
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const Field = ({ label, children }: any) => (
  <div>
    <div className="text-[11px] font-semibold text-foreground/70 mb-1">{label}</div>
    {children}
  </div>
);

const TBtn = ({ onClick, icon: Icon, title }: any) => (
  <button type="button" onClick={onClick} title={title} className="p-1.5 rounded-md hover:bg-secondary text-foreground/80 hover:text-foreground">
    <Icon className="h-3.5 w-3.5" />
  </button>
);

/* ============================ Viewer ============================ */

function PostViewer({ post, onClose, onEdit }: { post: Post; onClose: () => void; onEdit: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[92vh] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2">
            <StatusBadge status={post.status} />
            <span className="text-xs text-muted-foreground">{post.id} · {post.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onEdit} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-secondary text-sm font-semibold">
              <Edit3 className="h-4 w-4" /> এডিট
            </button>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-secondary"><X className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {post.cover && <img src={post.cover} alt={post.title} className="w-full h-56 object-cover" />}
          <div className="p-7 md:p-10">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground font-semibold">{post.category}</span>
              <span className="text-muted-foreground">{post.author} · {post.views.toLocaleString()} ভিউ</span>
            </div>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold leading-tight">{post.title}</h1>
            {post.excerpt && <p className="mt-3 text-base text-muted-foreground">{post.excerpt}</p>}
            <div
              className="mt-6 prose prose-base max-w-none text-foreground/90 [&_h1]:text-3xl [&_h2]:text-2xl [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-primary [&_a]:underline [&_img]:rounded-xl [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
              dangerouslySetInnerHTML={{ __html: post.html || "" }}
            />
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 bg-secondary text-foreground/80 text-xs font-medium px-2 py-1 rounded-full">#{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
