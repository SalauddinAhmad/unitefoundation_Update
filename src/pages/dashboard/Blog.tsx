import { Card, PageHeader, StatusBadge } from "@/components/dashboard/DashboardUI";
import ImagePickerButton from "@/components/dashboard/ImagePickerButton";
import MediaLibrary from "@/components/dashboard/MediaLibrary";
import type { BlogPost } from "@/data/dashboardMock";
import {
  Plus, Edit3, Eye, Trash2, Search, X, Save, Image as ImageIcon,
  Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Quote,
  AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Code as CodeIcon,
  FileText, Calendar, Clock, BarChart3, FolderTree, Loader2, Filter,
  ChevronDown, Globe, Archive, Copy, Sparkles, Tags, Check,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  usePostsAdmin,
  useSavePost,
  useDeletePost,
  type ApiPost,
} from "@/hooks/api/usePublic";
import { api } from "@/lib/api";


type Post = BlogPost & {
  excerpt?: string;
  cover?: string;
  tags?: string[];
  html?: string;
  slug?: string;
};

const DEFAULT_CATEGORIES = ["ইসলামিক", "দাওয়াহ", "সংবাদ", "রিপোর্ট", "প্রকল্প", "ইভেন্ট"];
const CAT_STORAGE_KEY = "blog:custom-categories:v1";
const DELETED_CAT_STORAGE_KEY = "blog:deleted-categories:v1";

function loadCustomCategories(): string[] {
  try {
    const raw = localStorage.getItem(CAT_STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch { return []; }
}
function saveCustomCategories(list: string[]) {
  try { localStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(list)); } catch {}
}
function loadDeletedCategories(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_CAT_STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch { return []; }
}
function saveDeletedCategories(list: string[]) {
  try { localStorage.setItem(DELETED_CAT_STORAGE_KEY, JSON.stringify(list)); } catch {}
}


// ---- API ↔ UI mappers ----
function apiToUi(row: ApiPost): Post {
  const dateStr = (row.published_at || row.created_at || "").slice(0, 10);
  return {
    id: row.id,
    title: row.title,
    author: row.author_name || "",
    category: row.category || DEFAULT_CATEGORIES[0],
    views: typeof row.views === "number" ? row.views : Number(row.views) || 0,

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
    author_name: p.author || null,
  };
}

export default function Blog() {
  const { data: rows = [], isLoading } = usePostsAdmin();
  const saveMut = useSavePost();
  const delMut = useDeletePost();

  const list = useMemo<Post[]>(() => (rows as ApiPost[]).map(apiToUi), [rows]);

  const [customCats, setCustomCats] = useState<string[]>(() => loadCustomCategories());
  const [deletedCats, setDeletedCats] = useState<string[]>(() => loadDeletedCategories());
  const [catManagerOpen, setCatManagerOpen] = useState(false);
  const categories = useMemo(() => {
    const deleted = new Set(deletedCats);
    const fromPosts = list.map((p) => p.category).filter(Boolean) as string[];
    const merged = [...DEFAULT_CATEGORIES, ...customCats, ...fromPosts];
    return Array.from(new Set(merged.map((s) => s.trim()).filter(Boolean))).filter((c) => !deleted.has(c));
  }, [list, customCats, deletedCats]);
  const updateCats = (next: string[]) => {
    const clean = Array.from(new Set(next.map((s) => s.trim()).filter(Boolean)));
    setCustomCats(clean);
    saveCustomCategories(clean);
  };
  const addCategory = (name: string) => {
    const v = name.trim();
    if (!v) return;
    if (categories.some((c) => c.toLowerCase() === v.toLowerCase())) { toast.error("এই ক্যাটাগরি ইতিমধ্যে আছে"); return; }
    const nextDeleted = deletedCats.filter((c) => c !== v);
    setDeletedCats(nextDeleted); saveDeletedCategories(nextDeleted);
    updateCats([...customCats, v]);
    toast.success("ক্যাটাগরি যোগ হয়েছে");
  };
  const removeCategory = (name: string) => {
    const target = name.trim();
    if (!target) return;
    updateCats(customCats.filter((c) => c !== target));
    const nextDeleted = Array.from(new Set([...deletedCats, target]));
    setDeletedCats(nextDeleted); saveDeletedCategories(nextDeleted);
    if (category === target) setCategory("all");
    toast.success(`"${target}" ডিলিট হয়েছে`);
  };
  const renameCategory = (oldName: string, newName: string) => {
    const oldValue = oldName.trim();
    const nextValue = newName.trim();
    if (!oldValue || !nextValue) return;
    if (DEFAULT_CATEGORIES.includes(oldValue)) { toast.error("ডিফল্ট ক্যাটাগরি রিনেম করা যাবে না"); return; }
    if (!customCats.includes(oldValue)) { toast.error("শুধু কাস্টম ক্যাটাগরি রিনেম করা যাবে"); return; }
    updateCats(customCats.map((c) => (c === oldValue ? nextValue : c)));
    toast.success("আপডেট হয়েছে");
  };

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "scheduled">("all");
  const [category, setCategory] = useState<string>("all");
  const [editor, setEditor] = useState<{ open: boolean; post?: Post }>({ open: false });
  const [viewer, setViewer] = useState<Post | null>(null);

  // The list endpoint omits `content` for performance — fetch the full post
  // before opening the editor/viewer so the body text is visible.
  const withFullContent = async (p: Post): Promise<Post> => {
    if (p.html) return p;
    try {
      const row = await api.get<ApiPost>(`/posts/${p.id}`);
      return { ...p, html: row?.content || "" };
    } catch {
      toast.error("পোস্টের কনটেন্ট লোড করা যায়নি");
      return p;
    }
  };
  const openEditor = async (p: Post) => setEditor({ open: true, post: await withFullContent(p) });
  const openViewer = async (p: Post) => setViewer(await withFullContent(p));



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

  // NOTE: The "Import default posts" feature was removed intentionally.
  // Demo posts must never be pushed into the live database.


  return (
    <>
      <PageHeader
        title="ব্লগ ও কনটেন্ট"
        subtitle="পোস্ট তৈরি, সম্পাদনা ও প্রকাশনা — সম্পূর্ণ নিজস্ব নিয়ন্ত্রণে"
        actions={
          <>
            <button
              onClick={() => setEditor({ open: true })}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/85 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm shadow-md hover:shadow-lg transition"
            >
              <Plus className="h-4 w-4" /> নতুন পোস্ট
            </button>
          </>
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
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
          </div>
          <button
            type="button"
            onClick={() => {
              const n = prompt("নতুন ক্যাটাগরির নাম:");
              if (!n) return;
              addCategory(n);
            }}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-secondary hover:bg-muted text-xs font-semibold"
            title="নতুন ক্যাটাগরি যোগ"
          >
            <Plus className="h-3.5 w-3.5" /> যোগ
          </button>
          <button
            type="button"
            onClick={() => {
              const deletable = categories.filter((c) => !DEFAULT_CATEGORIES.includes(c));
              if (deletable.length === 0) { toast.error("কোনো কাস্টম ক্যাটাগরি নেই"); return; }
              const n = prompt(`কোন ক্যাটাগরি ডিলিট করবেন?\n\n${deletable.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\nনাম লিখুন:`);
              if (!n) return;
              const target = n.trim();
              if (!deletable.includes(target)) { toast.error("এই নামে কাস্টম ক্যাটাগরি নেই"); return; }
              removeCategory(target);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/30"
            title="কাস্টম ক্যাটাগরি ডিলিট"
          >
            <Trash2 className="h-3.5 w-3.5" /> ক্যাটাগরি ডিলিট
          </button>
          <button
            onClick={() => setCatManagerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary hover:bg-muted text-xs font-semibold"
            title="ক্যাটাগরি ব্যবস্থাপনা"
          >
            <Tags className="h-3.5 w-3.5" /> ব্যবস্থাপনা
          </button>
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
                      <IconBtn title="দেখুন" onClick={() => openViewer(p)} icon={Eye} />
                      <IconBtn title="এডিট" onClick={() => openEditor(p)} icon={Edit3} />
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
          categories={categories}
          defaults={DEFAULT_CATEGORIES}
          onAddCategory={addCategory}
          onRemoveCategory={removeCategory}
          onClose={() => setEditor({ open: false })}
          onSave={save}
        />
      )}
      {viewer && <PostViewer post={viewer} onClose={() => setViewer(null)} onEdit={() => { setEditor({ open: true, post: viewer }); setViewer(null); }} />}
      {catManagerOpen && (
        <CategoryManager
          categories={categories}
          customCategories={customCats}
          defaults={DEFAULT_CATEGORIES}
          usage={list.reduce<Record<string, number>>((acc, p) => { const c = p.category; if (c) acc[c] = (acc[c] || 0) + 1; return acc; }, {})}
          onAdd={addCategory}
          onRemove={removeCategory}
          onRename={renameCategory}
          onClose={() => setCatManagerOpen(false)}
        />
      )}
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

function PostEditor({ post, onClose, onSave, categories, defaults, onAddCategory, onRemoveCategory }: { post?: Post; onClose: () => void; onSave: (p: Post) => void; categories: string[]; defaults: string[]; onAddCategory: (c: string) => void; onRemoveCategory: (c: string) => void }) {
  const isNew = !post;
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(post?.title || "");
  const [author, setAuthor] = useState(post?.author || "");
  const [category, setCategory] = useState(post?.category || categories[0] || DEFAULT_CATEGORIES[0]);
  const [newCatInput, setNewCatInput] = useState("");

  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [cover, setCover] = useState(post?.cover || "");
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<Post["status"]>(post?.status || "draft");
  const [date, setDate] = useState(post?.date || new Date().toISOString().slice(0, 10));
  const [html, setHtml] = useState(post?.html || "");
  const [saving, setSaving] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]+/gu, "").slice(0, 80);
  const [slug, setSlug] = useState(post?.slug || "");
  const [slugTouched, setSlugTouched] = useState(!!post?.slug);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = post?.html || `<p>এখানে লিখুন...</p>`;
      setHtml(editorRef.current.innerHTML);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cmd = (c: string, v?: string) => { document.execCommand(c, false, v); editorRef.current?.focus(); if (editorRef.current) setHtml(editorRef.current.innerHTML); };

  const insertLink = () => { const u = prompt("লিংক URL দিন:", "https://"); if (u) cmd("createLink", u); };
  const insertImage = () => setMediaOpen(true);
  const insertImageUrl = (url: string) => cmd("insertHTML", `<img src="${url}" alt="" style="max-width:100%;border-radius:10px;margin:10px 0"/>`);

  const addTag = (v: string) => {
    const t = v.trim().replace(/,$/, "");
    if (t && !tags.includes(t)) setTags([...tags, t]);
  };

  const submit = (publish?: boolean) => {
    if (!title.trim()) return toast.error("শিরোনাম দিন");
    setSaving(true);
    const finalStatus = publish ? "published" : status;
    const finalSlug = (slug.trim() ? slugify(slug) : slugify(title)) || `post-${Date.now()}`;
    const text = html.replace(/<[^>]+>/g, "").trim();
    const p: Post = {
      id: post?.id || `B-${Math.floor(Math.random() * 900) + 100}`,
      title: title.trim(),
      author: author.trim(),
      category,
      views: post?.views ?? 0,
      date,
      status: finalStatus,
      excerpt: excerpt.trim() || text.slice(0, 120),
      cover,
      tags,
      html,
      slug: finalSlug,
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
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
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
                <ImagePickerButton
                  value={cover}
                  onChange={setCover}
                  aspect="wide"
                  hint="প্রস্তাবিত: 1600×900 px (16:9), JPG/WebP · সর্বোচ্চ ~2MB"
                />
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
                
                {/* বাংলা ফন্ট ড্রপডাউন */}
                <div className="relative group">
                  <button type="button" className="inline-flex items-center gap-1 p-1.5 rounded-md hover:bg-secondary text-foreground/80 hover:text-foreground">
                    <span className="text-[11px] font-bold">বাংলা ফন্ট</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-card border border-border rounded-lg shadow-xl z-20 min-w-[200px] p-1 animate-in fade-in slide-in-from-top-1 duration-150 max-h-[300px] overflow-y-auto">
                    <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">সিস্টেম ফন্ট</div>
                    <button type="button" onClick={() => cmd("fontName", "'Bornomala BN', sans-serif")} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm font-semibold" style={{ fontFamily: "'Bornomala BN', sans-serif" }}>বর্ণমালা (Regular)</button>
                    <button type="button" onClick={() => cmd("insertHTML", `<span style="font-family:'Bornomala BN', sans-serif; font-weight:700;">${window.getSelection()}</span>`)} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm font-bold" style={{ fontFamily: "'Bornomala BN', sans-serif" }}>বর্ণমালা (Bold)</button>
                    <button type="button" onClick={() => cmd("fontName", "var(--font-heading)")} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm font-semibold">হেডিং ফন্ট</button>
                    <button type="button" onClick={() => cmd("fontName", "var(--font-body)")} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm">বডি ফন্ট</button>
                    
                    <div className="h-px bg-border my-1" />
                    <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">অতিরিক্ত ফন্ট</div>
                    <button type="button" onClick={() => cmd("fontName", "'AdorshoLipi', sans-serif")} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm" style={{ fontFamily: "'AdorshoLipi', sans-serif" }}>আদর্শ লিপি (AdorshoLipi)</button>
                    <button type="button" onClick={() => cmd("fontName", "'Akaash', sans-serif")} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm" style={{ fontFamily: "'Akaash', sans-serif" }}>আকাশ (Akaash)</button>
                    <button type="button" onClick={() => cmd("fontName", "'Alinur', sans-serif")} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm" style={{ fontFamily: "'Alinur', sans-serif" }}>আলিনুর (Alinur)</button>
                    <button type="button" onClick={() => cmd("fontName", "'SolaimanLipi', sans-serif")} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm" style={{ fontFamily: "'SolaimanLipi', sans-serif" }}>সোলায়মান লিপি (SolaimanLipi)</button>
                  </div>
                </div>

                {/* আরবি ফন্ট ড্রপডাউন */}
                <div className="relative group">
                  <button type="button" className="inline-flex items-center gap-1 p-1.5 rounded-md hover:bg-secondary text-foreground/80 hover:text-foreground">
                    <span className="text-[11px] font-bold">ARABIC FONTS</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-card border border-border rounded-lg shadow-xl z-20 min-w-[220px] p-1 animate-in fade-in slide-in-from-top-1 duration-150 max-h-[350px] overflow-y-auto">
                    <button type="button" onClick={() => cmd("fontName", "'KFGQPC Uthman Taha Naskh', serif")} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm font-arabic" style={{ fontFamily: "'KFGQPC Uthman Taha Naskh', serif" }}>KFGQPC Uthman (Original)</button>
                    <button type="button" onClick={() => cmd("fontName", "'Al-Quran IndoPak', serif")} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm font-arabic" style={{ fontFamily: "'Al-Quran IndoPak', serif" }}>Al-Quran IndoPak (IndoPak)</button>
                    <button type="button" onClick={() => cmd("fontName", "'Noto Kufi Arabic', sans-serif")} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm font-arabic" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>Noto Kufi (Kufi Style)</button>
                    <div className="h-px bg-border my-1" />
                    <button type="button" onClick={() => cmd("fontName", "'Amiri', serif")} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm font-arabic" style={{ fontFamily: "'Amiri', serif" }}>Amiri (Regular)</button>
                    <button type="button" onClick={() => cmd("insertHTML", `<span style="font-family:'Amiri', serif; font-weight:700;">${window.getSelection()}</span>`)} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm font-bold" style={{ fontFamily: "'Amiri', serif" }}>Amiri (Bold)</button>
                    <button type="button" onClick={() => cmd("fontName", "'Scheherazade New', serif")} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm" style={{ fontFamily: "'Scheherazade New', serif" }}>Scheherazade (Regular)</button>
                    <button type="button" onClick={() => cmd("insertHTML", `<span style="font-family:'Scheherazade New', serif; font-weight:700;">${window.getSelection()}</span>`)} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm font-bold" style={{ fontFamily: "'Scheherazade New', serif" }}>Scheherazade (Bold)</button>
                    <button type="button" onClick={() => cmd("fontName", "'Lateef', serif")} className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm font-arabic text-lg" style={{ fontFamily: "'Lateef', serif" }}>Lateef (Original)</button>
                  </div>
                </div>

                <TBtn onClick={() => cmd("fontName", "monospace")} icon={CodeIcon} title="মনোস্পেস" />

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
                <TBtn onClick={insertImage} icon={ImageIcon} title="ছবি (মিডিয়া লাইব্রেরি)" />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground px-1">লেখার ভেতরের ছবির প্রস্তাবিত সাইজ: <b>1200px চওড়া</b>, JPG/WebP · সর্বোচ্চ ~1.5MB</p>


              {/* Editor */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={() => editorRef.current && setHtml(editorRef.current.innerHTML)}
                className="mt-4 min-h-[400px] focus:outline-none text-base leading-relaxed prose prose-base max-w-none [&_h1]:text-3xl [&_h1]:font-extrabold [&_h2]:text-2xl [&_h2]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_a]:text-primary [&_a]:underline [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_img]:rounded-xl [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_font[face*='Bornomala']]:font-['Bornomala_BN',_sans-serif] [&_font[face='var(--font-heading)']]:font-heading [&_font[face='var(--font-body)']]:font-sans [&_font[face*='SolaimanLipi']]:font-['SolaimanLipi',_sans-serif] [&_font[face*='AdorshoLipi']]:font-['AdorshoLipi',_sans-serif] [&_font[face*='Akaash']]:font-['Akaash',_sans-serif] [&_font[face*='Alinur']]:font-['Alinur',_sans-serif] [&_font[face*='Amiri']]:font-['Amiri',_serif] [&_font[face*='Scheherazade']]:font-['Scheherazade_New',_serif] [&_font[face*='Lateef']]:font-['Lateef',_serif] [&_font[face='monospace']]:font-mono"
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
              <Field label="কাস্টম লিঙ্ক (URL)">
                <div className="flex items-center gap-1 rounded-lg bg-card border border-border px-2 py-1.5">
                  <span className="text-[11px] text-muted-foreground shrink-0">/blog/</span>
                  <input
                    value={slug}
                    onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
                    onBlur={(e) => setSlug(slugify(e.target.value))}
                    placeholder="my-custom-url"
                    className="flex-1 min-w-0 bg-transparent text-xs focus:outline-none"
                  />
                  {slugTouched && (
                    <button type="button" onClick={() => { setSlug(slugify(title)); setSlugTouched(false); }}
                      className="text-[10px] px-1.5 py-0.5 rounded hover:bg-muted text-muted-foreground shrink-0" title="অটো রিসেট">↺</button>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">খালি রাখলে শিরোনাম থেকে অটো তৈরি হবে</p>
              </Field>
            </Section>


            <Section title="বিবরণ" icon={FolderTree}>
              <Field label="লেখক">
                <input value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
              </Field>
              <Field label="ক্যাটাগরি">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="mt-2 flex items-center gap-1.5">
                  <input
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const v = newCatInput.trim();
                        if (!v) return;
                        onAddCategory(v);
                        setCategory(v);
                        setNewCatInput("");
                      }
                    }}
                    placeholder="নতুন ক্যাটাগরি যোগ করুন..."
                    className="flex-1 px-2.5 py-1.5 rounded-md bg-card border border-border text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const v = newCatInput.trim();
                      if (!v) return;
                      onAddCategory(v);
                      setCategory(v);
                      setNewCatInput("");
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold"
                    title="যোগ করুন"
                  >
                    <Plus className="h-3.5 w-3.5" /> যোগ
                  </button>
                  <button
                    type="button"
                    disabled={!category}
                    onClick={() => {
                      if (!category) return;
                      const target = category;
                      onRemoveCategory(target);
                      setCategory("");
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-destructive hover:bg-destructive/10 border border-destructive/30 text-xs font-semibold disabled:opacity-45 disabled:cursor-not-allowed"
                    title="এই ক্যাটাগরি ডিলিট"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> ডিলিট
                  </button>
                </div>
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
      {mediaOpen && (
        <MediaLibrary
          onClose={() => setMediaOpen(false)}
          onSelect={(url) => { insertImageUrl(url); setMediaOpen(false); }}
          hint="লেখার ভেতরের ছবির প্রস্তাবিত সাইজ: 1200px চওড়া"
        />
      )}
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

/* ============================ Category Manager ============================ */

function CategoryManager({
  categories, customCategories, defaults, usage, onAdd, onRemove, onRename, onClose,
}: {
  categories: string[];
  customCategories: string[];
  defaults: string[];
  usage: Record<string, number>;
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState<{ old: string; val: string } | null>(null);

  const add = () => {
    const v = input.trim();
    if (!v) return;
    onAdd(v);
    setInput("");
  };
  const removeCat = (c: string) => {
    onRemove(c);
  };
  const saveEdit = () => {
    if (!editing) return;
    const v = editing.val.trim();
    if (!v || v === editing.old) { setEditing(null); return; }
    if (categories.some((c) => c.toLowerCase() === v.toLowerCase())) {
      toast.error("একই নামে ক্যাটাগরি আছে");
      return;
    }
    onRename(editing.old, v);
    setEditing(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Tags className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-sm">ক্যাটাগরি ব্যবস্থাপনা</div>
              <div className="text-[11px] text-muted-foreground">ব্লগ পোস্টের জন্য কাস্টম ক্যাটাগরি তৈরি করুন</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
              placeholder="নতুন ক্যাটাগরি নাম..."
              className="flex-1 px-3 py-2 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
            <button onClick={add} className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold px-3.5 py-2 rounded-lg text-sm">
              <Plus className="h-4 w-4" /> যোগ
            </button>
          </div>

          <div className="rounded-xl border border-border divide-y divide-border">
            {categories.map((c) => {
              const isDefault = defaults.includes(c);
              const count = usage[c] || 0;
              const isEditing = editing?.old === c;
              return (
                <div key={c} className="flex items-center gap-2 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editing!.val}
                        onChange={(e) => setEditing({ old: c, val: e.target.value })}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(null); }}
                        className="w-full px-2 py-1 rounded-md bg-card border border-border text-sm"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{c}</span>
                        {isDefault && <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">ডিফল্ট</span>}
                        <span className="text-[11px] text-muted-foreground">{count} পোস্ট</span>
                      </div>
                    )}
                  </div>
                  {isEditing ? (
                    <>
                      <button onClick={saveEdit} className="p-1.5 rounded-md hover:bg-secondary text-emerald-600"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setEditing(null)} className="p-1.5 rounded-md hover:bg-secondary"><X className="h-4 w-4" /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditing({ old: c, val: c })} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground" title="রিনেম">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeCat(c)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold hover:bg-destructive/10 text-destructive"
                        title="ডিলিট"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> ডিলিট
                      </button>
                    </>
                  )}
                </div>
              );
            })}
            {categories.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">এখনও কোনো ক্যাটাগরি নেই</div>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            যেকোনো ক্যাটাগরি রিনেম বা ডিলিট করা যাবে। পরিবর্তন এই ব্রাউজারে সংরক্ষিত হয়।
          </p>
        </div>

        <div className="px-5 py-3 border-t border-border flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground">সম্পন্ন</button>
        </div>
      </div>
    </div>
  );
}

