import { Card, PageHeader, StatusBadge } from "@/components/dashboard/DashboardUI";
import type { Project } from "@/data/dashboardMock";
import {
  Plus, Edit3, Eye, Users, Download, Search, Filter, ChevronDown, X, Save,
  Image as ImageIcon, Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon,
  Quote, Heading1, Heading2, FolderKanban, BarChart3, CheckCircle2, Clock,
  Sparkles, Calendar, MapPin, Target, Trash2, Copy, Globe, Archive, Loader2,
  TrendingUp, HandCoins,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useProjectsAdmin,
  useSaveProject,
  useDeleteProject,
  type ApiProject,
} from "@/hooks/api/usePublic";

type ProjectEx = Project & {
  cover?: string;
  description?: string;
  html?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  goals?: string[];
  slug?: string;
};

const CATEGORIES = ["জরুরি সহায়তা", "শিশু কল্যাণ", "স্বাস্থ্যসেবা", "মৌসুমি সহায়তা", "ইবাদাহ", "শিক্ষা", "যেখানে প্রয়োজন"];

// ---- API ↔ UI mappers ----
function apiToUi(row: ApiProject): ProjectEx {
  const content: any = (() => {
    try { return row.content ? JSON.parse(row.content) : {}; } catch { return {}; }
  })();
  return {
    id: row.id,
    title: row.title,
    category: row.category || CATEGORIES[0],
    budget: Number(row.budget || row.target || 0),
    raised: Number(row.raised || 0),
    beneficiaries: Number(row.beneficiaries || 0),
    status: (row.status as ProjectEx["status"]) || "draft",
    cover: row.cover_image_url || "",
    description: row.short_description || "",
    html: typeof content?.html === "string" ? content.html : (typeof row.description === "string" ? row.description : ""),
    location: row.location || "",
    slug: row.slug,
    startDate: content?.startDate || "",
    endDate: content?.endDate || "",
    tags: Array.isArray(content?.tags) ? content.tags : [],
    goals: Array.isArray(content?.goals) ? content.goals : [],
  };
}
function uiToApi(p: ProjectEx): Partial<ApiProject> {
  const slug =
    p.slug ||
    p.title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]+/gu, "").slice(0, 80) ||
    `p-${Date.now()}`;
  return {
    title: p.title,
    slug,
    category: p.category,
    short_description: p.description || "",
    description: p.html || "",
    content: JSON.stringify({ html: p.html || "", startDate: p.startDate, endDate: p.endDate, tags: p.tags, goals: p.goals }),
    budget: Number(p.budget) || 0,
    target: Number(p.budget) || 0,
    raised: Number(p.raised) || 0,
    beneficiaries: Number(p.beneficiaries) || 0,
    location: p.location || "",
    status: (p.status as any) || "draft",
    cover_image_url: p.cover || "",
  };
}

export default function Projects() {
  const { data: rows = [] } = useProjectsAdmin();
  const saveMut = useSaveProject();
  const delMut = useDeleteProject();

  const list = useMemo<ProjectEx[]>(() => (rows as ApiProject[]).map(apiToUi), [rows]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "draft">("all");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [editor, setEditor] = useState<{ open: boolean; p?: ProjectEx }>({ open: false });
  const [viewer, setViewer] = useState<ProjectEx | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (category !== "all" && p.category !== category) return false;
      if (q && !p.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [list, search, filter, category]);

  const stats = useMemo(() => {
    const totalRaised = list.reduce((s, p) => s + p.raised, 0);
    const totalBudget = list.reduce((s, p) => s + p.budget, 0);
    const beneficiaries = list.reduce((s, p) => s + p.beneficiaries, 0);
    return {
      total: list.length,
      active: list.filter((p) => p.status === "active").length,
      completed: list.filter((p) => p.status === "completed").length,
      raised: totalRaised,
      budget: totalBudget,
      pct: totalBudget ? Math.round((totalRaised / totalBudget) * 100) : 0,
      beneficiaries,
    };
  }, [list]);

  const save = async (p: ProjectEx) => {
    const exists = list.some((x) => x.id === p.id);
    try {
      if (exists) await saveMut.mutateAsync({ id: p.id, data: uiToApi(p) });
      else await saveMut.mutateAsync({ data: uiToApi(p) });
      setEditor({ open: false });
      toast.success(exists ? "প্রকল্প আপডেট হয়েছে" : "নতুন প্রকল্প তৈরি হয়েছে");
    } catch (e: any) {
      toast.error(e?.message || "সেভ করা যায়নি");
    }
  };
  const remove = async (id: string) => {
    if (!confirm("ডিলিট করবেন?")) return;
    try { await delMut.mutateAsync(id); toast.success("ডিলিট হয়েছে"); }
    catch (e: any) { toast.error(e?.message || "ডিলিট ব্যর্থ"); }
  };
  const duplicate = async (p: ProjectEx) => {
    const copy: ProjectEx = { ...p, id: "", title: p.title + " (কপি)", status: "draft", raised: 0, slug: "" };
    try { await saveMut.mutateAsync({ data: uiToApi(copy) }); toast.success("কপি তৈরি হয়েছে"); }
    catch (e: any) { toast.error(e?.message || "কপি ব্যর্থ"); }
  };
  const toggleStatus = async (p: ProjectEx) => {
    const next = p.status === "active" ? ("completed" as const) : ("active" as const);
    try { await saveMut.mutateAsync({ id: p.id, data: { status: next } }); toast.success("স্ট্যাটাস আপডেট হয়েছে"); }
    catch (e: any) { toast.error(e?.message || "আপডেট ব্যর্থ"); }
  };

  const [importing, setImporting] = useState(false);
  const importDefaults = async () => {
    if (!confirm("ওয়েবসাইটের ডিফল্ট ১২টি প্রকল্প DB-তে ইমপোর্ট করবেন?")) return;
    setImporting(true);
    try {
      const { projects: defaults } = await import("@/data/projects");
      const { compressImageToDataURL } = await import("@/lib/imageCompress");
      let ok = 0;
      for (const p of defaults) {
        // skip if already imported by slug
        if (list.some((x) => x.slug === p.slug || x.title === p.title)) continue;
        let cover = "";
        try {
          const res = await fetch(p.image);
          const blob = await res.blob();
          const file = new File([blob], `${p.slug}.jpg`, { type: blob.type || "image/jpeg" });
          cover = await compressImageToDataURL(file, { maxWidth: 1400, quality: 0.8 });
        } catch { /* skip cover */ }
        await saveMut.mutateAsync({
          data: {
            title: p.title,
            slug: p.slug,
            category: p.category as any,
            short_description: p.shortDescription,
            description: p.description,
            content: JSON.stringify({ html: `<p>${p.description}</p>`, tags: [p.category], goals: [] }),
            budget: p.target,
            target: p.target,
            raised: p.raised,
            beneficiaries: p.donors,
            location: p.location,
            status: "active" as any,
            cover_image_url: cover,
          } as any,
        });
        ok++;
      }
      toast.success(`ইমপোর্ট সম্পন্ন — ${ok}টি প্রকল্প যুক্ত হয়েছে`);
    } catch (e: any) {
      toast.error(e?.message || "ইমপোর্ট ব্যর্থ");
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="প্রকল্পসমূহ"
        subtitle="চলমান ও সমাপ্ত সকল প্রকল্প — সম্পূর্ণ নিয়ন্ত্রণে ম্যানেজ করুন"
        actions={
          <>
            <button
              onClick={importDefaults}
              disabled={importing}
              className="inline-flex items-center gap-2 border border-border bg-card font-semibold px-3.5 py-2 rounded-lg text-sm hover:bg-secondary disabled:opacity-60"
            >
              <Download className="h-4 w-4" /> {importing ? "ইমপোর্ট হচ্ছে..." : "ডিফল্ট প্রকল্প ইমপোর্ট"}
            </button>
            <button
              onClick={() => setEditor({ open: true })}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/85 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm shadow-md hover:shadow-lg"
            >
              <Plus className="h-4 w-4" /> নতুন প্রকল্প
            </button>
          </>
        }
      />

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Stat icon={FolderKanban} label="মোট প্রকল্প" value={stats.total} tone="primary" />
        <Stat icon={TrendingUp} label="চলমান" value={stats.active} tone="emerald" />
        <Stat icon={CheckCircle2} label="সম্পন্ন" value={stats.completed} tone="violet" />
        <Stat icon={HandCoins} label="সংগৃহীত" value={`৳ ${(stats.raised / 100000).toFixed(1)}L`} sub={`${stats.pct}% of ৳ ${(stats.budget / 100000).toFixed(0)}L`} tone="amber" />
        <Stat icon={Users} label="উপকারভোগী" value={stats.beneficiaries.toLocaleString()} tone="sky" />
      </div>

      <Card pad={false}>
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="প্রকল্পের নাম খুঁজুন"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
          <div className="inline-flex p-1 bg-secondary rounded-lg">
            {(["all", "active", "completed", "draft"] as const).map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={"px-3 py-1.5 rounded-md text-xs font-semibold transition " + (filter === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {s === "all" ? "সব" : s === "active" ? "চলমান" : s === "completed" ? "সম্পন্ন" : "ড্রাফট"}
              </button>
            ))}
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="appearance-none pl-9 pr-9 py-2 rounded-lg bg-secondary text-xs font-semibold focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none cursor-pointer">
              <option value="all">সকল ক্যাটাগরি</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
          </div>
          <div className="ml-auto inline-flex p-1 bg-secondary rounded-lg">
            <button onClick={() => setView("grid")} className={"px-3 py-1.5 rounded-md text-xs font-semibold " + (view === "grid" ? "bg-card shadow-sm" : "text-muted-foreground")}>গ্রিড</button>
            <button onClick={() => setView("table")} className={"px-3 py-1.5 rounded-md text-xs font-semibold " + (view === "table" ? "bg-card shadow-sm" : "text-muted-foreground")}>টেবিল</button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">কোনো প্রকল্প পাওয়া যায়নি</div>
        ) : view === "grid" ? (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p) => {
              const pct = Math.min(100, Math.round((p.raised / p.budget) * 100));
              return (
                <div key={p.id} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col">
                  <div className="h-32 relative overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
                    {p.cover ? (
                      <img src={p.cover} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-primary/40">
                        <FolderKanban className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3"><StatusBadge status={p.status} /></div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-primary">{p.category}</div>
                    <h3 className="font-bold text-base mt-1 leading-snug line-clamp-2">{p.title}</h3>
                    {p.location && (
                      <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {p.location}
                      </div>
                    )}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">সংগৃহীত</span>
                        <span className="font-bold tabular-nums">{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-xs mt-2">
                        <span className="font-bold tabular-nums text-primary">৳ {(p.raised / 100000).toFixed(1)}L</span>
                        <span className="text-muted-foreground tabular-nums">/ ৳ {(p.budget / 100000).toFixed(1)}L</span>
                      </div>
                    </div>
                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span><b className="text-foreground">{p.beneficiaries.toLocaleString()}</b> উপকারভোগী</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <IconBtn icon={Eye} title="দেখুন" onClick={() => setViewer(p)} />
                        <IconBtn icon={Edit3} title="এডিট" onClick={() => setEditor({ open: true, p })} />
                        <IconBtn icon={Copy} title="কপি" onClick={() => duplicate(p)} />
                        <IconBtn icon={p.status === "active" ? Archive : Globe} title="টগল স্ট্যাটাস" onClick={() => toggleStatus(p)} />
                        <button onClick={() => remove(p.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="px-5 py-3">প্রকল্প</th>
                  <th className="py-3">ক্যাটাগরি</th>
                  <th className="py-3">অগ্রগতি</th>
                  <th className="py-3">সংগৃহীত</th>
                  <th className="py-3">উপকারভোগী</th>
                  <th className="py-3">স্ট্যাটাস</th>
                  <th className="py-3 pr-5 text-right">কর্ম</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const pct = Math.min(100, Math.round((p.raised / p.budget) * 100));
                  return (
                    <tr key={p.id} className="border-t border-border hover:bg-muted/40">
                      <td className="px-5 py-3 max-w-sm">
                        <div className="font-semibold truncate">{p.title}</div>
                        <div className="text-[11px] text-muted-foreground">{p.id}</div>
                      </td>
                      <td className="py-3"><span className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs font-semibold">{p.category}</span></td>
                      <td className="py-3 w-44">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-bold tabular-nums w-8">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 font-bold tabular-nums text-primary">৳ {(p.raised / 100000).toFixed(1)}L</td>
                      <td className="py-3 tabular-nums">{p.beneficiaries.toLocaleString()}</td>
                      <td className="py-3"><StatusBadge status={p.status} /></td>
                      <td className="py-3 pr-5">
                        <div className="flex items-center justify-end gap-0.5">
                          <IconBtn icon={Eye} title="দেখুন" onClick={() => setViewer(p)} />
                          <IconBtn icon={Edit3} title="এডিট" onClick={() => setEditor({ open: true, p })} />
                          <IconBtn icon={Copy} title="কপি" onClick={() => duplicate(p)} />
                          <button onClick={() => remove(p.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editor.open && <ProjectEditor p={editor.p} onClose={() => setEditor({ open: false })} onSave={save} />}
      {viewer && <ProjectViewer p={viewer} onClose={() => setViewer(null)} onEdit={() => { setEditor({ open: true, p: viewer }); setViewer(null); }} />}
    </>
  );
}

/* ---------- helpers ---------- */
const TONES: Record<string, string> = {
  primary: "from-primary/20 to-primary/5 text-primary",
  emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-700",
  amber: "from-amber-500/20 to-amber-500/5 text-amber-700",
  violet: "from-violet-500/20 to-violet-500/5 text-violet-700",
  sky: "from-sky-500/20 to-sky-500/5 text-sky-700",
};
const Stat = ({ icon: Icon, label, value, sub, tone }: any) => (
  <Card>
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
        <div className="text-2xl font-extrabold mt-2">{value}</div>
        {sub && <div className="text-[10px] text-muted-foreground mt-1">{sub}</div>}
      </div>
      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${TONES[tone]} flex items-center justify-center`}><Icon className="h-5 w-5" /></div>
    </div>
  </Card>
);
const IconBtn = ({ icon: Icon, onClick, title }: any) => (
  <button onClick={onClick} title={title} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Icon className="h-4 w-4" /></button>
);
const TBtn = ({ onClick, icon: Icon, title }: any) => (
  <button type="button" onClick={onClick} title={title} className="p-1.5 rounded-md hover:bg-secondary text-foreground/80 hover:text-foreground"><Icon className="h-3.5 w-3.5" /></button>
);
const Section = ({ title, icon: Icon, children }: any) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {title}</div>
    <div className="space-y-3">{children}</div>
  </div>
);
const Field = ({ label, children }: any) => (
  <div><div className="text-[11px] font-semibold text-foreground/70 mb-1">{label}</div>{children}</div>
);

/* ---------- editor ---------- */
function ProjectEditor({ p, onClose, onSave }: { p?: ProjectEx; onClose: () => void; onSave: (p: ProjectEx) => void }) {
  const isNew = !p;
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(p?.title || "");
  const [category, setCategory] = useState(p?.category || CATEGORIES[0]);
  const [description, setDescription] = useState(p?.description || "");
  const [cover, setCover] = useState(p?.cover || "");
  const [location, setLocation] = useState(p?.location || "");
  const [budget, setBudget] = useState(p?.budget || 0);
  const [raised, setRaised] = useState(p?.raised || 0);
  const [beneficiaries, setBeneficiaries] = useState(p?.beneficiaries || 0);
  const [status, setStatus] = useState<ProjectEx["status"]>(p?.status || "draft");
  const [startDate, setStartDate] = useState(p?.startDate || new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(p?.endDate || "");
  const [tags, setTags] = useState<string[]>(p?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [goals, setGoals] = useState<string[]>(p?.goals || []);
  const [goalInput, setGoalInput] = useState("");
  const [html, setHtml] = useState(p?.html || "");
  const [saving, setSaving] = useState(false);
  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]+/gu, "").slice(0, 80);
  const [slug, setSlug] = useState(p?.slug || "");
  const [slugTouched, setSlugTouched] = useState(!!p?.slug);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = p?.html || `<p>প্রকল্পের বিস্তারিত এখানে লিখুন...</p>`;
      setHtml(editorRef.current.innerHTML);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cmd = (c: string, v?: string) => { document.execCommand(c, false, v); editorRef.current?.focus(); if (editorRef.current) setHtml(editorRef.current.innerHTML); };
  const insertLink = () => { const u = prompt("লিংক URL:", "https://"); if (u) cmd("createLink", u); };
  const insertImage = () => { const u = prompt("ছবির URL:", "https://"); if (u) cmd("insertHTML", `<img src="${u}" style="max-width:100%;border-radius:10px;margin:10px 0"/>`); };
  const onImage = async (f?: File) => { if (!f) return; const { compressImageToDataURL } = await import("@/lib/imageCompress"); const url = await compressImageToDataURL(f, { maxWidth: 1600, quality: 0.82 }); cmd("insertHTML", `<img src="${url}" style="max-width:100%;border-radius:10px;margin:10px 0"/>`); };

  const addTag = (v: string) => { const t = v.trim().replace(/,$/, ""); if (t && !tags.includes(t)) setTags([...tags, t]); };
  const addGoal = (v: string) => { const g = v.trim(); if (g) setGoals([...goals, g]); };

  const submit = (publish?: boolean) => {
    if (!title.trim()) return toast.error("শিরোনাম দিন");
    if (budget <= 0) return toast.error("সঠিক বাজেট দিন");
    setSaving(true);
    const finalSlug = (slug.trim() ? slugify(slug) : slugify(title)) || `p-${Date.now()}`;
    const next: ProjectEx = {
      id: p?.id || `P-${Math.floor(Math.random() * 900) + 100}`,
      title: title.trim(), category, budget, raised, beneficiaries,
      status: publish ? "active" : status,
      cover, description: description.trim() || html.replace(/<[^>]+>/g, "").slice(0, 140),
      location, startDate, endDate, tags, goals, html,
      slug: finalSlug,
    };
    onSave(next); setSaving(false);
  };

  const pct = budget ? Math.min(100, Math.round((raised / budget) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-stretch justify-center">
      <div className="w-full bg-card shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 md:px-8 py-3.5 border-b border-border flex items-center justify-between gap-3 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center"><Sparkles className="h-4 w-4" /></div>
            <div className="min-w-0">
              <div className="text-[11px] text-muted-foreground">{isNew ? "নতুন প্রকল্প" : `এডিট · ${p?.id}`}</div>
              <div className="font-bold truncate">{title || "প্রকল্পের নাম..."}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-secondary">বাতিল</button>
            <button onClick={() => submit(false)} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-border hover:bg-secondary"><Save className="h-4 w-4" /> ড্রাফট সেভ</button>
            <button onClick={() => submit(true)} disabled={saving} className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary to-primary/85 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm shadow-md hover:shadow-lg disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />} সক্রিয় করুন
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden grid lg:grid-cols-[1fr_340px]">
          <div className="overflow-y-auto">
            <div className="max-w-3xl mx-auto px-5 md:px-10 py-8">
              <input value={title} onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} placeholder="প্রকল্পের নাম..." className="w-full bg-transparent text-3xl md:text-4xl font-extrabold focus:outline-none placeholder:text-muted-foreground/50" />



              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="সংক্ষিপ্ত বিবরণ..." rows={2} className="mt-3 w-full bg-transparent text-base text-muted-foreground focus:outline-none resize-none placeholder:text-muted-foreground/50" />

              {/* Cover */}
              <div className="mt-5 rounded-2xl border-2 border-dashed border-border p-4">
                {cover ? (
                  <div className="relative">
                    <img src={cover} alt="cover" className="w-full max-h-64 object-cover rounded-xl" />
                    <button onClick={() => setCover("")} className="absolute top-2 right-2 p-1.5 rounded-md bg-card/90 border border-border hover:bg-destructive/10 hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input value={cover} onChange={(e) => setCover(e.target.value)} placeholder="কভার ছবির URL দিন বা আপলোড করুন" className="flex-1 px-3 py-2.5 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                    <label className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary hover:bg-muted text-sm font-semibold cursor-pointer">
                      <ImageIcon className="h-4 w-4" /> আপলোড
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const { compressImageToDataURL } = await import("@/lib/imageCompress"); const url = await compressImageToDataURL(f, { maxWidth: 1920, quality: 0.85 }); setCover(url); }} />
                    </label>
                  </div>
                )}
              </div>

              {/* Toolbar */}
              <div className="mt-6 sticky top-0 z-10 -mx-2 px-2 bg-card/95 backdrop-blur border-b border-border py-2 flex flex-wrap items-center gap-0.5">
                <TBtn onClick={() => cmd("formatBlock", "h1")} icon={Heading1} title="H1" />
                <TBtn onClick={() => cmd("formatBlock", "h2")} icon={Heading2} title="H2" />
                <div className="h-5 w-px bg-border mx-1" />
                <TBtn onClick={() => cmd("bold")} icon={Bold} title="বোল্ড" />
                <TBtn onClick={() => cmd("italic")} icon={Italic} title="ইটালিক" />
                <TBtn onClick={() => cmd("underline")} icon={Underline} title="আন্ডারলাইন" />
                <div className="h-5 w-px bg-border mx-1" />
                <TBtn onClick={() => cmd("insertUnorderedList")} icon={List} title="বুলেট" />
                <TBtn onClick={() => cmd("insertOrderedList")} icon={ListOrdered} title="সংখ্যা" />
                <TBtn onClick={() => cmd("formatBlock", "blockquote")} icon={Quote} title="উদ্ধৃতি" />
                <div className="h-5 w-px bg-border mx-1" />
                <TBtn onClick={insertLink} icon={LinkIcon} title="লিংক" />
                <TBtn onClick={insertImage} icon={ImageIcon} title="ছবির URL" />
                <label className="p-1.5 rounded-md hover:bg-secondary cursor-pointer" title="ছবি আপলোড">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onImage(e.target.files?.[0])} />
                </label>
              </div>

              <div ref={editorRef} contentEditable suppressContentEditableWarning
                onInput={() => editorRef.current && setHtml(editorRef.current.innerHTML)}
                className="mt-4 min-h-[300px] focus:outline-none text-base leading-relaxed prose prose-base max-w-none [&_h1]:text-3xl [&_h1]:font-extrabold [&_h2]:text-2xl [&_h2]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-primary [&_a]:underline [&_img]:rounded-xl [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
              />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="border-t lg:border-t-0 lg:border-l border-border bg-muted/30 overflow-y-auto p-5 space-y-5">
            <Section title="মেট্রিক্স" icon={BarChart3}>
              <Field label="বাজেট (৳)">
                <input type="number" value={budget} onChange={(e) => setBudget(+e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
              </Field>
              <Field label="সংগৃহীত (৳)">
                <input type="number" value={raised} onChange={(e) => setRaised(+e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
              </Field>
              <div className="rounded-lg bg-card border border-border p-3">
                <div className="flex items-center justify-between text-xs mb-1.5"><span className="text-muted-foreground">অগ্রগতি</span><b>{pct}%</b></div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
              </div>
              <Field label="উপকারভোগী সংখ্যা">
                <input type="number" value={beneficiaries} onChange={(e) => setBeneficiaries(+e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
              </Field>
            </Section>

            <Section title="বিবরণ" icon={Target}>
              <Field label="ক্যাটাগরি">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="স্ট্যাটাস">
                <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm">
                  <option value="draft">ড্রাফট</option>
                  <option value="active">চলমান</option>
                  <option value="completed">সম্পন্ন</option>
                </select>
              </Field>
              <Field label="অবস্থান">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="যেমন: কুড়িগ্রাম" className="w-full pl-9 pr-3 py-2 rounded-lg bg-card border border-border text-sm" />
                </div>
              </Field>
              <Field label="কাস্টম লিঙ্ক (URL)">
                <div className="flex items-center gap-1 rounded-lg bg-card border border-border px-2 py-1.5">
                  <span className="text-[11px] text-muted-foreground shrink-0">/projects/</span>
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

            <Section title="সময়সূচি" icon={Calendar}>
              <Field label="শুরুর তারিখ"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" /></Field>
              <Field label="শেষের তারিখ"><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" /></Field>
            </Section>

            <Section title="লক্ষ্যসমূহ" icon={CheckCircle2}>
              <div className="space-y-1.5">
                {goals.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm bg-card border border-border rounded-lg px-3 py-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="flex-1 truncate">{g}</span>
                    <button onClick={() => setGoals(goals.filter((_, idx) => idx !== i))}><X className="h-3 w-3 text-muted-foreground hover:text-destructive" /></button>
                  </div>
                ))}
                <div className="flex gap-1.5">
                  <input value={goalInput} onChange={(e) => setGoalInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGoal(goalInput); setGoalInput(""); } }}
                    placeholder="নতুন লক্ষ্য..." className="flex-1 px-3 py-2 rounded-lg bg-card border border-border text-sm" />
                  <button type="button" onClick={() => { addGoal(goalInput); setGoalInput(""); }} className="px-3 rounded-lg bg-primary text-primary-foreground"><Plus className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </Section>

            <Section title="ট্যাগ" icon={Sparkles}>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-card border border-border">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                    {t}<button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
                  </span>
                ))}
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); setTagInput(""); } }}
                  placeholder={tags.length === 0 ? "ট্যাগ যোগ করুন..." : ""}
                  className="flex-1 min-w-[100px] bg-transparent text-xs focus:outline-none py-0.5" />
              </div>
            </Section>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ---------- viewer ---------- */
function ProjectViewer({ p, onClose, onEdit }: { p: ProjectEx; onClose: () => void; onEdit: () => void }) {
  const pct = Math.min(100, Math.round((p.raised / p.budget) * 100));
  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[92vh] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2">
            <StatusBadge status={p.status} />
            <span className="text-xs text-muted-foreground">{p.id}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onEdit} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-secondary text-sm font-semibold"><Edit3 className="h-4 w-4" /> এডিট</button>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-secondary"><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {p.cover && <img src={p.cover} alt={p.title} className="w-full h-56 object-cover" />}
          <div className="p-7 md:p-10">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground font-semibold">{p.category}</span>
              {p.location && <span className="text-muted-foreground inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.location}</span>}
            </div>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold leading-tight">{p.title}</h1>
            {p.description && <p className="mt-3 text-base text-muted-foreground">{p.description}</p>}

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border p-4 text-center"><div className="text-xs text-muted-foreground">বাজেট</div><div className="text-lg font-extrabold mt-1">৳ {(p.budget / 100000).toFixed(1)}L</div></div>
              <div className="rounded-xl border border-border p-4 text-center"><div className="text-xs text-muted-foreground">সংগৃহীত</div><div className="text-lg font-extrabold mt-1 text-primary">৳ {(p.raised / 100000).toFixed(1)}L</div></div>
              <div className="rounded-xl border border-border p-4 text-center"><div className="text-xs text-muted-foreground">উপকারভোগী</div><div className="text-lg font-extrabold mt-1">{p.beneficiaries.toLocaleString()}</div></div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5"><span className="text-muted-foreground">অগ্রগতি</span><b>{pct}%</b></div>
              <div className="h-2.5 rounded-full bg-secondary overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70" style={{ width: `${pct}%` }} /></div>
            </div>

            {p.goals && p.goals.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-bold mb-2">লক্ষ্যসমূহ</div>
                <ul className="space-y-1.5">
                  {p.goals.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {g}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 prose prose-base max-w-none text-foreground/90 [&_h1]:text-3xl [&_h2]:text-2xl [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-primary [&_a]:underline [&_img]:rounded-xl [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
              dangerouslySetInnerHTML={{ __html: p.html || "" }} />

            {p.tags && p.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-1.5">
                {p.tags.map((t) => <span key={t} className="bg-secondary text-foreground/80 text-xs font-medium px-2 py-1 rounded-full">#{t}</span>)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
