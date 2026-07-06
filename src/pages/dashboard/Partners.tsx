import { useEffect, useMemo, useState } from "react";
import { Plus, Edit3, Trash2, Search, X, Save, Loader2, ExternalLink, GripVertical, Download, Upload, Image as ImageIcon } from "lucide-react";
import { partners as DEFAULT_PARTNERS } from "@/data/partners";
import { toast } from "sonner";
import { Card, PageHeader } from "@/components/dashboard/DashboardUI";
import {
  usePartnersAdmin,
  useSavePartner,
  useDeletePartner,
  type ApiPartner,
} from "@/hooks/api/usePublic";

type Draft = Partial<ApiPartner> & { activitiesText?: string; galleryText?: string; programsText?: string };

const emptyDraft = (): Draft => ({
  name: "",
  slug: "",
  logo_url: "",
  tagline: "",
  description: "",
  website: "",
  category: "",
  theme: "green",
  established: "",
  address: "",
  phone: "",
  sort_order: 0,
  status: "active",
  activitiesText: "",
  galleryText: "",
  programsText: "",
});

function toDraft(p: ApiPartner): Draft {
  const c = (p.content as any) || {};
  return {
    ...p,
    activitiesText: Array.isArray(c.activities)
      ? c.activities.map((a: any) => `${a.title || ""} | ${a.detail || ""}`).join("\n")
      : "",
    galleryText: Array.isArray(c.gallery) ? c.gallery.join("\n") : "",
    programsText: Array.isArray(c.programs)
      ? c.programs.map((p: any) => `${p.category || ""}: ${(p.items || []).join(", ")}`).join("\n")
      : "",
  };
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0980-\u09FF-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function fromDraft(d: Draft) {
  const activities = (d.activitiesText || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [title, ...rest] = l.split("|");
      return { title: (title || "").trim(), detail: rest.join("|").trim() };
    });
  const gallery = (d.galleryText || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const programs = (d.programsText || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [cat, ...rest] = l.split(":");
      return {
        category: (cat || "").trim(),
        items: rest.join(":").split(",").map((s) => s.trim()).filter(Boolean),
      };
    });

  const { activitiesText, galleryText, programsText, ...rest } = d;
  return {
    ...rest,
    content: { activities, gallery, programs },
  };
}

export default function DashboardPartners() {
  const { data: partners = [], isLoading, refetch } = usePartnersAdmin();
  const save = useSavePartner();
  const remove = useDeletePartner();
  const [editor, setEditor] = useState<{ open: boolean; draft?: Draft }>({ open: false });
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return partners;
    return partners.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q),
    );
  }, [partners, search]);

  const onSave = async (draft: Draft) => {
    if (!draft.name?.trim()) return toast.error("নাম দিন");
    if (!draft.slug?.trim()) draft.slug = slugify(draft.name);
    try {
      await save.mutateAsync({ id: draft.id, data: fromDraft(draft) as any });
      toast.success(draft.id ? "আপডেট হয়েছে" : "নতুন প্রতিষ্ঠান যুক্ত হয়েছে");
      setEditor({ open: false });
      refetch();
    } catch (e: any) {
      toast.error(e.message || "সেভ করতে সমস্যা হয়েছে");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("এই প্রতিষ্ঠান ডিলিট করবেন?")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("ডিলিট হয়েছে");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "ডিলিট করতে সমস্যা হয়েছে");
    }
  };

  const [importing, setImporting] = useState(false);
  const importDefaults = async () => {
    if (!confirm(`ওয়েবসাইটে থাকা ডিফল্ট ${DEFAULT_PARTNERS.length}টি প্রতিষ্ঠান ইমপোর্ট করবেন? (একই slug থাকলে স্কিপ হবে)`)) return;
    setImporting(true);
    try {
      const { compressImageToDataURL } = await import("@/lib/imageCompress");
      const existing = new Set(partners.map((p) => p.slug));
      let ok = 0;
      for (let i = 0; i < DEFAULT_PARTNERS.length; i++) {
        const p = DEFAULT_PARTNERS[i];
        if (existing.has(p.slug)) continue;
        let logo_url = "";
        try {
          const res = await fetch(p.logo);
          const blob = await res.blob();
          const file = new File([blob], `${p.slug}.png`, { type: blob.type || "image/png" });
          logo_url = await compressImageToDataURL(file, { maxWidth: 512, quality: 0.9 });
        } catch { /* skip logo */ }
        await save.mutateAsync({
          data: {
            name: p.name,
            slug: p.slug,
            logo_url,
            tagline: p.tagline || "",
            description: p.description || "",
            website: p.website || "",
            category: "",
            theme: p.theme || "green",
            established: p.established || "",
            address: p.address || "",
            phone: p.phone || "",
            sort_order: i,
            status: "active",
            content: {
              activities: p.activities || [],
              gallery: p.gallery || [],
              programs: p.programs || [],
            },
          } as any,
        });
        ok++;
      }
      toast.success(`${ok}টি প্রতিষ্ঠান ইমপোর্ট হয়েছে`);
      refetch();
    } catch (e: any) {
      toast.error(e?.message || "ইমপোর্ট ব্যর্থ");
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="আমাদের প্রতিষ্ঠান"
        subtitle="সহযোগী প্রতিষ্ঠানসমূহ ব্যবস্থাপনা"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={importDefaults}
              disabled={importing}
              className="inline-flex items-center gap-2 border border-border bg-card text-foreground font-semibold px-4 py-2 rounded-lg text-sm hover:bg-secondary transition disabled:opacity-60"
            >
              <Download className="h-4 w-4" /> {importing ? "ইমপোর্ট হচ্ছে..." : "ডিফল্ট প্রতিষ্ঠান ইমপোর্ট"}
            </button>
            <button
              onClick={() => setEditor({ open: true, draft: emptyDraft() })}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/85 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm shadow-md hover:shadow-lg transition"
            >
              <Plus className="h-4 w-4" /> নতুন প্রতিষ্ঠান
            </button>
          </div>
        }
      />

      <Card pad={false}>
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="নাম বা ক্যাটাগরি দিয়ে খুঁজুন"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            এখনো কোনো প্রতিষ্ঠান যুক্ত হয়নি। "নতুন প্রতিষ্ঠান" বাটনে ক্লিক করুন।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="font-semibold px-5 py-3 w-12"></th>
                  <th className="font-semibold py-3">প্রতিষ্ঠান</th>
                  <th className="font-semibold py-3">ক্যাটাগরি</th>
                  <th className="font-semibold py-3">Order</th>
                  <th className="font-semibold py-3">স্ট্যাটাস</th>
                  <th className="font-semibold py-3 pr-5 text-right">কর্ম</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3">
                      {p.logo_url ? (
                        <img src={p.logo_url} alt="" className="h-10 w-10 object-contain rounded" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {p.name.slice(0, 2)}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-muted-foreground">/{p.slug}</div>
                    </td>
                    <td className="py-3 text-muted-foreground">{p.category || "—"}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <GripVertical className="h-3 w-3" />
                        {p.sort_order ?? 0}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={
                          "text-[11px] font-semibold px-2 py-1 rounded-full " +
                          (p.status === "active"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400")
                        }
                      >
                        {p.status === "active" ? "সক্রিয়" : "ড্রাফট"}
                      </span>
                    </td>
                    <td className="py-3 pr-5 text-right">
                      <div className="inline-flex gap-1">
                        <a
                          href={`/partners/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-primary"
                          title="দেখুন"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => setEditor({ open: true, draft: toDraft(p) })}
                          className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-primary"
                          title="এডিট"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(p.id)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          title="ডিলিট"
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
        )}
      </Card>

      {editor.open && editor.draft && (
        <Editor
          initial={editor.draft}
          onClose={() => setEditor({ open: false })}
          onSave={onSave}
          saving={save.isPending}
        />
      )}
    </>
  );
}

function Editor({
  initial,
  onClose,
  onSave,
  saving,
}: {
  initial: Draft;
  onClose: () => void;
  onSave: (d: Draft) => void;
  saving: boolean;
}) {
  const [d, setD] = useState<Draft>(initial);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((prev) => ({ ...prev, [k]: v }));

  useEffect(() => {
    if (!d.slug && d.name) set("slug", slugify(d.name));
  }, [d.name]); // eslint-disable-line

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <div className="font-bold">{d.id ? "প্রতিষ্ঠান এডিট" : "নতুন প্রতিষ্ঠান"}</div>
            <div className="text-xs text-muted-foreground">সব তথ্য বাংলায় দিতে পারবেন</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid sm:grid-cols-2 gap-4">
            <F label="নাম *">
              <input
                value={d.name || ""}
                onChange={(e) => set("name", e.target.value)}
                className="input"
              />
            </F>
            <F label="Slug (URL) *" hint="যেমন unite-tv (auto-generated হবে)">
              <input
                value={d.slug || ""}
                onChange={(e) => set("slug", e.target.value)}
                className="input"
              />
            </F>
            <F label="ট্যাগলাইন">
              <input
                value={d.tagline || ""}
                onChange={(e) => set("tagline", e.target.value)}
                className="input"
              />
            </F>
            <F label="ক্যাটাগরি">
              <input
                value={d.category || ""}
                onChange={(e) => set("category", e.target.value)}
                className="input"
              />
            </F>
            <F label="Logo (আপলোড বা URL)">
              <ImageUploadField
                value={d.logo_url || ""}
                onChange={(v) => set("logo_url", v)}
                aspect="square"
                maxWidth={512}
              />
            </F>
            <F label="Cover Image (আপলোড বা URL)">
              <ImageUploadField
                value={(d as any).cover_url || ""}
                onChange={(v) => set("cover_url" as any, v)}
                aspect="wide"
                maxWidth={1600}
              />
            </F>
            <F label="Website">
              <input
                value={d.website || ""}
                onChange={(e) => set("website", e.target.value)}
                className="input"
                placeholder="https://..."
              />
            </F>
            <F label="প্রতিষ্ঠাকাল">
              <input
                value={d.established || ""}
                onChange={(e) => set("established", e.target.value)}
                className="input"
                placeholder="২০২১"
              />
            </F>
            <F label="ফোন">
              <input
                value={d.phone || ""}
                onChange={(e) => set("phone", e.target.value)}
                className="input"
              />
            </F>
            <F label="ঠিকানা">
              <input
                value={d.address || ""}
                onChange={(e) => set("address", e.target.value)}
                className="input"
              />
            </F>
            <F label="থিম রঙ">
              <select
                value={d.theme || "green"}
                onChange={(e) => set("theme", e.target.value as any)}
                className="input"
              >
                <option value="green">সবুজ (default)</option>
                <option value="red">লাল</option>
                <option value="black">কালো</option>
              </select>
            </F>
            <F label="Sort order (ছোট আগে)">
              <input
                type="number"
                value={d.sort_order ?? 0}
                onChange={(e) => set("sort_order", Number(e.target.value))}
                className="input"
              />
            </F>
          </div>

          <F label="সংক্ষিপ্ত বিবরণ">
            <textarea
              value={d.description || ""}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              className="input"
            />
          </F>

          <F
            label="কার্যক্রম / Activities"
            hint="প্রতিটি লাইনে: শিরোনাম | বিস্তারিত"
          >
            <textarea
              value={d.activitiesText || ""}
              onChange={(e) => set("activitiesText", e.target.value)}
              rows={4}
              className="input font-mono text-xs"
              placeholder="ডকুমেন্টারি ও রিপোর্ট | ফাউন্ডেশনের কাজের ফিল্ড রিপোর্ট নির্মাণ।"
            />
          </F>

          <F label="Gallery Images (URL, প্রতি লাইনে একটি)">
            <textarea
              value={d.galleryText || ""}
              onChange={(e) => set("galleryText", e.target.value)}
              rows={3}
              className="input font-mono text-xs"
              placeholder={"https://example.com/img1.jpg\nhttps://example.com/img2.jpg"}
            />
          </F>

          <F label="Programs" hint="প্রতিটি লাইনে: ক্যাটাগরি: item1, item2, item3">
            <textarea
              value={d.programsText || ""}
              onChange={(e) => set("programsText", e.target.value)}
              rows={3}
              className="input font-mono text-xs"
              placeholder="দাওয়াহ: মাহফিল, সেমিনার, লাইভ ক্লাস"
            />
          </F>

          <F label="স্ট্যাটাস">
            <select
              value={d.status || "active"}
              onChange={(e) => set("status", e.target.value as any)}
              className="input"
            >
              <option value="active">সক্রিয় (সাইটে দেখা যাবে)</option>
              <option value="draft">ড্রাফট (লুকানো)</option>
            </select>
          </F>
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-secondary"
          >
            বাতিল
          </button>
          <button
            onClick={() => onSave(d)}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            সেভ করুন
          </button>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border-radius: 0.5rem;
          background: hsl(var(--secondary));
          border: 1px solid transparent;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          background: hsl(var(--card));
          border-color: hsl(var(--border));
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15);
        }
      `}</style>
    </div>
  );
}

function F({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-foreground/80 mb-1.5 block">{label}</span>
      {children}
      {hint && <span className="block mt-1 text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function ImageUploadField({
  value,
  onChange,
  aspect = "square",
  maxWidth = 1024,
}: {
  value: string;
  onChange: (v: string) => void;
  aspect?: "square" | "wide";
  maxWidth?: number;
}) {
  const [busy, setBusy] = useState(false);
  const onFile = async (f: File | null) => {
    if (!f) return;
    setBusy(true);
    try {
      const { compressImageToDataURL } = await import("@/lib/imageCompress");
      const url = await compressImageToDataURL(f, { maxWidth, quality: 0.88 });
      onChange(url);
    } catch (e: any) {
      toast.error(e?.message || "ইমেজ প্রসেস করতে সমস্যা");
    } finally {
      setBusy(false);
    }
  };
  const previewBox =
    aspect === "wide"
      ? "w-40 h-20 rounded-lg"
      : "w-20 h-20 rounded-lg";
  return (
    <div className="flex gap-3 items-start">
      <div className={`${previewBox} overflow-hidden bg-secondary border border-border flex items-center justify-center shrink-0`}>
        {value ? (
          <img src={value} alt="preview" className="w-full h-full object-contain" />
        ) : (
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input"
          placeholder="https://... অথবা নিচ থেকে আপলোড"
        />
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold cursor-pointer hover:bg-primary/20 transition">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {busy ? "আপলোড হচ্ছে..." : "ইমেজ আপলোড"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onFile(e.target.files?.[0] || null)}
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-muted-foreground hover:text-destructive font-semibold"
            >
              রিমুভ
            </button>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">প্রস্তাবিত: <b>400×200 px</b>, ট্রান্সপারেন্ট PNG বা SVG (লোগো)</p>
      </div>
    </div>
  );
}
