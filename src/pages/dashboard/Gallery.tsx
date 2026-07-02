import { useEffect, useMemo, useRef, useState } from "react";
import { Card, KpiCard, PageHeader, StatusBadge, Btn } from "@/components/dashboard/DashboardUI";
import {
  Plus, Search, Upload, ImageIcon, Video, Trash2, Edit3, Eye, X, Save, Calendar,
  FolderOpen, Play, Grid3x3, Rows3, Star, Copy, Archive, Download, Filter,
  Images, Film, Sparkles, Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";

type MediaType = "image" | "video";
type AlbumStatus = "published" | "draft" | "archived";

type MediaItem = {
  id: string;
  type: MediaType;
  url: string;
  caption?: string;
  youtubeId?: string;
  duration?: string;
};

type Album = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover?: string;
  category: string;
  status: AlbumStatus;
  date: string;
  location?: string;
  tags: string[];
  featured?: boolean;
  items: MediaItem[];
};

import {
  useGalleryAdmin,
  useSaveAlbum,
  useDeleteAlbum,
  useSaveGalleryItem,
  useDeleteGalleryItem,
  type ApiGalleryAlbum,
  type ApiGalleryItem,
} from "@/hooks/api/usePublic";

// Fallback images bundled with the app (same set that renders publicly)
import g1 from "@/assets/gallery/01.jpg";
import g2 from "@/assets/gallery/02.jpg";
import g3 from "@/assets/gallery/03.jpg";
import g4 from "@/assets/gallery/04.jpg";
import g5 from "@/assets/gallery/05.jpg";
import g6 from "@/assets/gallery/06.jpg";
import g7 from "@/assets/gallery/07.jpg";
import g8 from "@/assets/gallery/08.jpg";
import g9 from "@/assets/gallery/09.jpg";
import g10 from "@/assets/gallery/10.jpg";
import g11 from "@/assets/gallery/11.jpg";
import g12 from "@/assets/gallery/12.jpg";
import g13 from "@/assets/gallery/13.jpg";
import g14 from "@/assets/gallery/14.jpg";
import g15 from "@/assets/gallery/15.jpg";
import g16 from "@/assets/gallery/16.jpg";
import g17 from "@/assets/gallery/17.jpg";
import g18 from "@/assets/gallery/18.jpg";
import g19 from "@/assets/gallery/19.jpg";
import g20 from "@/assets/gallery/20.jpg";

const DEFAULT_LIBRARY: { src: string; alt: string; cat: string }[] = [
  { src: g1, alt: "বন্যা কবলিত এলাকায় পরিদর্শন", cat: "ত্রাণ" },
  { src: g2, alt: "নদীর তীরে ত্রাণ বিতরণ", cat: "ত্রাণ" },
  { src: g3, alt: "খাদ্য সামগ্রী বিতরণ কার্যক্রম", cat: "খাদ্য বিতরণ" },
  { src: g4, alt: "বন্যায় ত্রাণ পৌঁছে দেওয়া", cat: "ত্রাণ" },
  { src: g5, alt: "ত্রাণ প্যাকেজ প্রস্তুতি", cat: "খাদ্য বিতরণ" },
  { src: g6, alt: "শিশুদের সহায়তা", cat: "ত্রাণ" },
  { src: g7, alt: "ইফতার প্রোগ্রাম — নেত্রকোণা", cat: "ইফতার" },
  { src: g8, alt: "ইফতার প্রোগ্রাম — খুলনা", cat: "ইফতার" },
  { src: g9, alt: "ইফতার প্রোগ্রাম — দিনাজপুর", cat: "ইফতার" },
  { src: g10, alt: "বন্যায় ত্রাণ বহন", cat: "ত্রাণ" },
  { src: g11, alt: "ত্রাণ সামগ্রী বিতরণ", cat: "ত্রাণ" },
  { src: g12, alt: "স্বেচ্ছাসেবক দল — মাঠে", cat: "ত্রাণ" },
  { src: g13, alt: "নদীপথে ত্রাণ অভিযান", cat: "ত্রাণ" },
  { src: g14, alt: "খাদ্য প্যাকেট হস্তান্তর", cat: "খাদ্য বিতরণ" },
  { src: g15, alt: "বন্যা পেরিয়ে ত্রাণ পৌঁছানো", cat: "ত্রাণ" },
  { src: g16, alt: "জলাবদ্ধ এলাকায় ত্রাণ বিতরণ", cat: "ত্রাণ" },
  { src: g17, alt: "ত্রাণ সামগ্রী প্রস্তুত", cat: "খাদ্য বিতরণ" },
  { src: g18, alt: "ক্ষতিগ্রস্ত পরিবারে ত্রাণ", cat: "ত্রাণ" },
  { src: g19, alt: "ঘরে ঘরে ত্রাণ বিতরণ", cat: "ত্রাণ" },
  { src: g20, alt: "নৌকায় ত্রাণ অভিযান — সূর্যাস্ত", cat: "ত্রাণ" },
];

const CATEGORIES = ["ত্রাণ", "খাদ্য বিতরণ", "ইফতার", "শিক্ষা", "চিকিৎসা", "প্রতিবেদন", "অন্যান্য"];

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\u0980-\u09FF]+/g, "-").replace(/^-|-$/g, "") || `album-${Date.now()}`;

const empty = (): Album => ({
  id: `new-${crypto.randomUUID()}`,
  title: "",
  slug: "",
  description: "",
  cover: "",
  category: CATEGORIES[0],
  status: "draft",
  date: new Date().toISOString().slice(0, 10),
  location: "",
  tags: [],
  items: [],
});

const extractYT = (url: string) => {
  const m = url.match(/(?:youtube\.com\/(?:.*v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : url && url.length === 11 ? url : "";
};

// ---- API ↔ UI mappers ----
function albumFromApi(row: ApiGalleryAlbum, items: ApiGalleryItem[]): Album {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug || "",
    description: row.description || "",
    cover: row.cover_url || "",
    category: row.category || CATEGORIES[0],
    status: (row.status as AlbumStatus) || "published",
    date: (row.date || "").slice(0, 10) || new Date().toISOString().slice(0, 10),
    location: row.location || "",
    tags: Array.isArray(row.tags) ? row.tags : [],
    featured: Boolean(row.featured),
    items: items
      .filter((it) => it.album_id === row.id)
      .map((it) => ({
        id: it.id,
        type: it.kind,
        url: it.url || "",
        caption: it.caption || it.title || "",
        youtubeId: it.youtube_id || undefined,
        duration: it.duration || undefined,
      })),
  };
}
function albumToApi(a: Album): Partial<ApiGalleryAlbum> {
  return {
    title: a.title,
    slug: a.slug || slugify(a.title),
    description: a.description || null,
    cover_url: a.cover || null,
    category: a.category || null,
    status: a.status,
    date: a.date || null,
    location: a.location || null,
    tags: a.tags || [],
    featured: a.featured ? 1 : 0,
  };
}
function itemToApi(albumId: string, it: MediaItem): Partial<ApiGalleryItem> {
  return {
    album_id: albumId,
    kind: it.type,
    url: it.type === "video" ? (it.url || `https://youtube.com/watch?v=${it.youtubeId || ""}`) : it.url,
    caption: it.caption || null,
    youtube_id: it.youtubeId || null,
    duration: it.duration || null,
  };
}

export default function Gallery() {
  const { data } = useGalleryAdmin();
  const saveAlbumMut = useSaveAlbum();
  const deleteAlbumMut = useDeleteAlbum();
  const saveItemMut = useSaveGalleryItem();
  const deleteItemMut = useDeleteGalleryItem();

  const list = useMemo<Album[]>(() => {
    const albums = data?.albums || [];
    const items = data?.items || [];
    return albums.map((a) => albumFromApi(a, items));
  }, [data]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | AlbumStatus>("all");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [editor, setEditor] = useState<{ open: boolean; a?: Album }>({ open: false });
  const [viewer, setViewer] = useState<Album | null>(null);
  const [lightbox, setLightbox] = useState<{ album: Album; idx: number } | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((a) => {
      if (filter !== "all" && a.status !== filter) return false;
      if (category !== "all" && a.category !== category) return false;
      if (q && !a.title.toLowerCase().includes(q) && !a.tags.join(" ").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [list, search, filter, category]);

  const stats = useMemo(() => {
    const images = list.reduce((s, a) => s + a.items.filter((i) => i.type === "image").length, 0);
    const videos = list.reduce((s, a) => s + a.items.filter((i) => i.type === "video").length, 0);
    return {
      albums: list.length,
      published: list.filter((a) => a.status === "published").length,
      images, videos, featured: list.filter((a) => a.featured).length,
    };
  }, [list]);

  const save = async (a: Album) => {
    try {
      const isNew = a.id.startsWith("new-");
      const original = isNew ? null : list.find((x) => x.id === a.id);
      const meta = albumToApi(a);

      let albumId = a.id;
      if (isNew) {
        const res: any = await saveAlbumMut.mutateAsync({ data: meta });
        albumId = res?.id || albumId;
      } else {
        await saveAlbumMut.mutateAsync({ id: a.id, data: meta });
      }

      // Sync items — add new, delete removed
      const originalItemIds = new Set((original?.items || []).map((it) => it.id));
      const currentItemIds = new Set(a.items.map((it) => it.id));

      // Deletions
      const toDelete = (original?.items || []).filter((it) => !currentItemIds.has(it.id));
      // New (temp id or not in original)
      const toAdd = a.items.filter((it) => !originalItemIds.has(it.id));

      await Promise.all([
        ...toDelete.map((it) => deleteItemMut.mutateAsync(it.id)),
        ...toAdd.map((it) => saveItemMut.mutateAsync({ data: itemToApi(albumId, it) })),
      ]);

      toast.success(isNew ? "নতুন অ্যালবাম তৈরি হয়েছে" : "অ্যালবাম আপডেট হয়েছে");
      setEditor({ open: false });
    } catch (e: any) {
      toast.error(e?.message || "সেভ করা যায়নি");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("এই অ্যালবাম মুছে ফেলতে চান?")) return;
    try {
      await deleteAlbumMut.mutateAsync(id);
      toast.success("মুছে ফেলা হয়েছে");
    } catch (e: any) {
      toast.error(e?.message || "ডিলিট ব্যর্থ");
    }
  };

  const duplicate = async (a: Album) => {
    try {
      const meta = albumToApi({ ...a, title: `${a.title} (কপি)`, slug: `${a.slug || slugify(a.title)}-copy`, status: "draft", featured: false });
      const res: any = await saveAlbumMut.mutateAsync({ data: meta });
      const newId = res?.id;
      if (newId) {
        await Promise.all(a.items.map((it) => saveItemMut.mutateAsync({ data: itemToApi(newId, it) })));
      }
      toast.success("ডুপ্লিকেট তৈরি হয়েছে");
    } catch (e: any) {
      toast.error(e?.message || "কপি ব্যর্থ");
    }
  };

  const toggleStatus = async (a: Album) => {
    const next: AlbumStatus = a.status === "published" ? "draft" : "published";
    try {
      await saveAlbumMut.mutateAsync({ id: a.id, data: { status: next } });
      toast.success(next === "published" ? "প্রকাশিত হয়েছে" : "ড্রাফটে নেয়া হয়েছে");
    } catch (e: any) {
      toast.error(e?.message || "আপডেট ব্যর্থ");
    }
  };

  const toggleFeatured = async (a: Album) => {
    try {
      await saveAlbumMut.mutateAsync({ id: a.id, data: { featured: a.featured ? 0 : 1 } });
    } catch (e: any) {
      toast.error(e?.message || "আপডেট ব্যর্থ");
    }
  };

  const archive = async (a: Album) => {
    try {
      await saveAlbumMut.mutateAsync({ id: a.id, data: { status: "archived" } });
      toast.success("আর্কাইভ হয়েছে");
    } catch (e: any) {
      toast.error(e?.message || "আপডেট ব্যর্থ");
    }
  };

  const [importing, setImporting] = useState(false);
  const importDefaults = async () => {
    if (!confirm("ওয়েবসাইটে থাকা ডিফল্ট গ্যালারি ছবিগুলো (২০টি) ক্যাটাগরি-অনুযায়ী অ্যালবাম বানিয়ে ইমপোর্ট করবেন?")) return;
    setImporting(true);
    try {
      const { compressImageToDataURL } = await import("@/lib/imageCompress");
      // Group by category
      const groups = new Map<string, typeof DEFAULT_LIBRARY>();
      for (const it of DEFAULT_LIBRARY) {
        if (!groups.has(it.cat)) groups.set(it.cat, []);
        groups.get(it.cat)!.push(it);
      }
      let ok = 0;
      for (const [cat, imgs] of groups) {
        // Fetch → compress → dataURL
        const dataUrls: { url: string; caption: string }[] = [];
        for (const img of imgs) {
          try {
            const res = await fetch(img.src);
            const blob = await res.blob();
            const file = new File([blob], `${cat}-${ok}.jpg`, { type: blob.type || "image/jpeg" });
            const url = await compressImageToDataURL(file, { maxWidth: 1400, quality: 0.8 });
            dataUrls.push({ url, caption: img.alt });
            ok++;
          } catch { /* skip */ }
        }
        if (!dataUrls.length) continue;
        // Create album
        const meta = {
          title: cat,
          slug: slugify(cat),
          description: `${cat} সংক্রান্ত কার্যক্রমের ছবি`,
          category: cat,
          status: "published" as const,
          date: new Date().toISOString().slice(0, 10),
          cover_url: dataUrls[0].url,
          tags: [cat],
          featured: 0,
        };
        const res: any = await saveAlbumMut.mutateAsync({ data: meta });
        const albumId = res?.id;
        if (!albumId) continue;
        // Save items sequentially to avoid overwhelming server
        for (const it of dataUrls) {
          await saveItemMut.mutateAsync({
            data: {
              album_id: albumId,
              kind: "image",
              url: it.url,
              caption: it.caption,
            } as any,
          });
        }
      }
      toast.success(`ইমপোর্ট সম্পন্ন — ${ok}টি ছবি যুক্ত হয়েছে`);
    } catch (e: any) {
      toast.error(e?.message || "ইমপোর্ট ব্যর্থ");
    } finally {
      setImporting(false);
    }
  };


  return (
    <>
      <PageHeader
        title="গ্যালারি ম্যানেজমেন্ট"
        subtitle="অ্যালবাম, ছবি ও ভিডিও তৈরি, এডিট ও প্রকাশ করুন"
        actions={
          <>
            <Btn variant="outline" onClick={importDefaults} disabled={importing}>
              <Download className="h-4 w-4" /> {importing ? "ইমপোর্ট হচ্ছে..." : "ডিফল্ট গ্যালারি ইমপোর্ট"}
            </Btn>
            <Btn onClick={() => setEditor({ open: true, a: empty() })}><Plus className="h-4 w-4" /> নতুন অ্যালবাম</Btn>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
        <KpiCard label="মোট অ্যালবাম" value={String(stats.albums)} icon={FolderOpen} />
        <KpiCard label="প্রকাশিত" value={String(stats.published)} icon={Sparkles} highlight />
        <KpiCard label="মোট ছবি" value={String(stats.images)} icon={Images} />
        <KpiCard label="মোট ভিডিও" value={String(stats.videos)} icon={Film} />
        <KpiCard label="ফিচার্ড" value={String(stats.featured)} icon={Star} />
      </div>

      {/* Filters */}
      <Card className="mb-5">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="অ্যালবাম খুঁজুন..." className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "published", "draft", "archived"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={"px-3 py-2 rounded-lg text-sm font-semibold transition-colors " + (filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80")}>
                {f === "all" ? "সকল" : f === "published" ? "প্রকাশিত" : f === "draft" ? "ড্রাফট" : "আর্কাইভ"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium">
              <option value="all">সকল ক্যাটাগরি</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
              <button onClick={() => setView("grid")} className={"p-2 rounded-md " + (view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground")} aria-label="grid"><Grid3x3 className="h-4 w-4" /></button>
              <button onClick={() => setView("table")} className={"p-2 rounded-md " + (view === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground")} aria-label="table"><Rows3 className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="text-center py-16">
          <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">কোনো অ্যালবাম পাওয়া যায়নি।</p>
          <div className="mt-4"><Btn onClick={() => setEditor({ open: true, a: empty() })}><Plus className="h-4 w-4" /> নতুন অ্যালবাম তৈরি করুন</Btn></div>
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((a) => {
            const images = a.items.filter((i) => i.type === "image").length;
            const videos = a.items.filter((i) => i.type === "video").length;
            return (
              <Card key={a.id} pad={false} className="overflow-hidden group hover:shadow-md transition-shadow">
                <div className="relative aspect-video bg-gradient-to-br from-primary/15 via-accent to-primary/5">
                  {a.cover ? (
                    <img src={a.cover} alt={a.title} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="h-12 w-12 text-primary/40" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <StatusBadge status={a.status} />
                    {a.featured && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-400/90 text-amber-950"><Star className="h-3 w-3 fill-current" /> ফিচার্ড</span>}
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/65 text-white backdrop-blur"><ImageIcon className="h-3 w-3" /> {images}</span>
                    {videos > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/65 text-white backdrop-blur"><Play className="h-3 w-3 fill-current" /> {videos}</span>}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/95 text-primary">{a.category}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold leading-snug line-clamp-2">{a.title}</h3>
                  {a.description && <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{a.description}</p>}
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{a.date}</span>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => setViewer(a)} className="p-1.5 rounded-md hover:bg-secondary" title="দেখুন"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => setEditor({ open: true, a })} className="p-1.5 rounded-md hover:bg-secondary" title="এডিট"><Edit3 className="h-4 w-4" /></button>
                      <button onClick={() => toggleFeatured(a)} className={"p-1.5 rounded-md hover:bg-secondary " + (a.featured ? "text-amber-500" : "")} title="ফিচার্ড"><Star className={"h-4 w-4 " + (a.featured ? "fill-current" : "")} /></button>
                      <button onClick={() => duplicate(a)} className="p-1.5 rounded-md hover:bg-secondary" title="ডুপ্লিকেট"><Copy className="h-4 w-4" /></button>
                      <button onClick={() => archive(a)} className="p-1.5 rounded-md hover:bg-secondary" title="আর্কাইভ"><Archive className="h-4 w-4" /></button>
                      <button onClick={() => remove(a.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive" title="ডিলিট"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card pad={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left">
                <tr>
                  <th className="px-5 py-3 font-semibold">অ্যালবাম</th>
                  <th className="px-5 py-3 font-semibold">ক্যাটাগরি</th>
                  <th className="px-5 py-3 font-semibold">মিডিয়া</th>
                  <th className="px-5 py-3 font-semibold">স্ট্যাটাস</th>
                  <th className="px-5 py-3 font-semibold">তারিখ</th>
                  <th className="px-5 py-3 font-semibold text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 rounded-md overflow-hidden bg-secondary flex items-center justify-center shrink-0">
                          {a.cover ? <img src={a.cover} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div>
                          <div className="font-semibold leading-tight">{a.title}</div>
                          <div className="text-xs text-muted-foreground">{a.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">{a.category}</td>
                    <td className="px-5 py-3 text-xs">
                      <span className="inline-flex items-center gap-1 mr-2"><ImageIcon className="h-3.5 w-3.5" />{a.items.filter((i) => i.type === "image").length}</span>
                      <span className="inline-flex items-center gap-1"><Play className="h-3.5 w-3.5" />{a.items.filter((i) => i.type === "video").length}</span>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-5 py-3 text-muted-foreground">{a.date}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => setViewer(a)} className="p-1.5 rounded-md hover:bg-secondary"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => setEditor({ open: true, a })} className="p-1.5 rounded-md hover:bg-secondary"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => remove(a.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Editor */}
      {editor.open && editor.a && (
        <AlbumEditor
          album={editor.a}
          onClose={() => setEditor({ open: false })}
          onSave={save}
          onPublishToggle={() => editor.a && toggleStatus(editor.a)}
        />
      )}

      {/* Viewer */}
      {viewer && (
        <AlbumViewer
          album={viewer}
          onClose={() => setViewer(null)}
          onEdit={() => { setEditor({ open: true, a: viewer }); setViewer(null); }}
          onOpenItem={(idx) => setLightbox({ album: viewer, idx })}
        />
      )}

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          album={lightbox.album}
          idx={lightbox.idx}
          onClose={() => setLightbox(null)}
          onNav={(i) => setLightbox({ album: lightbox.album, idx: i })}
        />
      )}
    </>
  );
}

/* ------------- Editor ------------- */
function AlbumEditor({ album, onClose, onSave }: { album: Album; onClose: () => void; onSave: (a: Album) => void; onPublishToggle: () => void }) {
  const [a, setA] = useState<Album>(album);
  const [tagInput, setTagInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const videoUrlRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setA(album); }, [album]);

  const addImageUrl = (url: string) => {
    if (!url) return;
    setA((p) => ({ ...p, items: [...p.items, { id: crypto.randomUUID(), type: "image", url }], cover: p.cover || url }));
  };

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const { compressImageToDataURL } = await import("@/lib/imageCompress");
    for (const f of Array.from(files)) {
      try {
        const url = await compressImageToDataURL(f, { maxWidth: 1920, maxHeight: 1920, quality: 0.82 });
        addImageUrl(url);
      } catch {
        /* skip */
      }
    }
  };

  const extractYT = (url: string) => {
    const m = url.match(/(?:youtube\.com\/(?:.*v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : url.length === 11 ? url : "";
  };

  const addVideo = () => {
    const url = videoUrlRef.current?.value.trim() || "";
    const id = extractYT(url);
    if (!id) { toast.error("সঠিক YouTube লিংক/আইডি দিন"); return; }
    const caption = captionRef.current?.value.trim() || "";
    setA((p) => ({ ...p, items: [...p.items, { id: crypto.randomUUID(), type: "video", url: "", youtubeId: id, caption }] }));
    if (videoUrlRef.current) videoUrlRef.current.value = "";
    if (captionRef.current) captionRef.current.value = "";
  };

  const removeItem = (id: string) => setA((p) => ({ ...p, items: p.items.filter((x) => x.id !== id) }));
  const setCover = (url: string) => setA((p) => ({ ...p, cover: url }));

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || a.tags.includes(t)) return;
    setA((p) => ({ ...p, tags: [...p.tags, t] }));
    setTagInput("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-stretch lg:items-center justify-center p-0 lg:p-4">
      <div className="bg-card w-full lg:max-w-6xl lg:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full lg:h-[92vh]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 rounded-md hover:bg-secondary"><X className="h-4 w-4" /></button>
            <div>
              <div className="font-bold">{album.title ? "অ্যালবাম এডিট করুন" : "নতুন অ্যালবাম"}</div>
              <div className="text-xs text-muted-foreground">{a.items.length} মিডিয়া · স্ট্যাটাস: {a.status}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <select value={a.status} onChange={(e) => setA({ ...a, status: e.target.value as AlbumStatus })} className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium">
              <option value="draft">ড্রাফট</option>
              <option value="published">প্রকাশিত</option>
              <option value="archived">আর্কাইভ</option>
            </select>
            <Btn onClick={() => onSave(a)} disabled={!a.title.trim()}><Save className="h-4 w-4" /> সংরক্ষণ</Btn>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-[1fr_340px] gap-0">
            {/* Main */}
            <div className="p-5 md:p-6 space-y-5 border-r border-border">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">শিরোনাম</label>
                <input value={a.title} onChange={(e) => setA({ ...a, title: e.target.value })} placeholder="অ্যালবামের শিরোনাম..." className="mt-1.5 w-full px-3 py-3 rounded-lg border border-border bg-background text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">বিবরণ</label>
                <textarea value={a.description || ""} onChange={(e) => setA({ ...a, description: e.target.value })} rows={3} placeholder="অ্যালবাম সম্পর্কে সংক্ষিপ্ত বিবরণ..." className="mt-1.5 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              {/* Upload zone */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">মিডিয়া যুক্ত করুন</label>
                <div className="mt-1.5 grid sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
                    className="border-2 border-dashed border-border rounded-xl p-5 text-center cursor-pointer hover:border-primary hover:bg-accent/30 transition-colors"
                  >
                    <Upload className="h-7 w-7 mx-auto text-primary" />
                    <div className="mt-2 text-sm font-semibold">ছবি আপলোড / ড্র্যাগ ড্রপ</div>
                    <div className="text-xs text-muted-foreground">PNG, JPG, WebP — একাধিক নির্বাচন</div>
                    <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
                  </div>
                  <div className="border border-border rounded-xl p-4 space-y-2">
                    <div className="text-sm font-semibold inline-flex items-center gap-1.5"><Video className="h-4 w-4 text-primary" /> ভিডিও (YouTube)</div>
                    <input ref={videoUrlRef} placeholder="https://youtube.com/watch?v=..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                    <input ref={captionRef} placeholder="ক্যাপশন (ঐচ্ছিক)" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                    <Btn onClick={addVideo} className="w-full"><Plus className="h-4 w-4" /> ভিডিও যুক্ত করুন</Btn>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <input placeholder="অথবা ইমেজ URL পেস্ট করুন..." className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" onKeyDown={(e) => { if (e.key === "Enter") { addImageUrl((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ""; } }} />
                  <Btn variant="outline"><LinkIcon className="h-4 w-4" /> যুক্ত</Btn>
                </div>
              </div>

              {/* Media list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">মিডিয়া ({a.items.length})</label>
                  {a.items.length > 0 && <button onClick={() => setA({ ...a, items: [] })} className="text-xs text-destructive font-semibold hover:underline">সকল মুছুন</button>}
                </div>
                {a.items.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-border rounded-xl text-muted-foreground text-sm">কোনো মিডিয়া যুক্ত হয়নি।</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {a.items.map((it) => (
                      <div key={it.id} className="relative group aspect-square rounded-lg overflow-hidden bg-secondary border border-border">
                        {it.type === "image" ? (
                          <img src={it.url} alt={it.caption || ""} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full relative">
                            <img src={`https://img.youtube.com/vi/${it.youtubeId}/hqdefault.jpg`} alt={it.caption || "video"} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Play className="h-7 w-7 text-white fill-current" /></div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 gap-1">
                          {it.type === "image" && (
                            <button onClick={() => setCover(it.url)} className={"text-[10px] font-bold px-2 py-1 rounded " + (a.cover === it.url ? "bg-amber-400 text-amber-950" : "bg-white/95 text-primary")}>
                              {a.cover === it.url ? "★ কভার" : "কভার করুন"}
                            </button>
                          )}
                          <button onClick={() => removeItem(it.id)} className="text-[10px] font-bold px-2 py-1 rounded bg-destructive text-destructive-foreground">মুছুন</button>
                        </div>
                        <span className="absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/65 text-white">
                          {it.type === "image" ? "IMG" : "VID"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="p-5 md:p-6 space-y-5 bg-secondary/30">
              <Field label="স্লাগ"><input value={a.slug} onChange={(e) => setA({ ...a, slug: e.target.value })} placeholder="auto" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></Field>
              <Field label="ক্যাটাগরি">
                <select value={a.category} onChange={(e) => setA({ ...a, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="তারিখ"><input type="date" value={a.date} onChange={(e) => setA({ ...a, date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></Field>
              <Field label="অবস্থান"><input value={a.location || ""} onChange={(e) => setA({ ...a, location: e.target.value })} placeholder="যেমন: নেত্রকোণা" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></Field>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ট্যাগ</label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {a.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent text-primary text-xs font-semibold">
                      {t}
                      <button onClick={() => setA({ ...a, tags: a.tags.filter((x) => x !== t) })}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="ট্যাগ যোগ করুন..." className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                  <Btn variant="outline" onClick={addTag}>যুক্ত</Btn>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                <div>
                  <div className="text-sm font-semibold inline-flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-500" /> ফিচার্ড</div>
                  <div className="text-xs text-muted-foreground">হোম পেজে দেখাবে</div>
                </div>
                <button onClick={() => setA({ ...a, featured: !a.featured })} className={"w-11 h-6 rounded-full transition-colors relative " + (a.featured ? "bg-primary" : "bg-secondary")}>
                  <span className={"absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all " + (a.featured ? "left-[22px]" : "left-0.5")} />
                </button>
              </div>

              <Field label="কভার URL"><input value={a.cover || ""} onChange={(e) => setA({ ...a, cover: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></Field>
              {a.cover && (
                <div className="rounded-lg overflow-hidden border border-border aspect-video"><img src={a.cover} alt="cover" className="w-full h-full object-cover" /></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
    <div className="mt-1.5">{children}</div>
  </div>
);

/* ------------- Viewer ------------- */
function AlbumViewer({ album, onClose, onEdit, onOpenItem }: { album: Album; onClose: () => void; onEdit: () => void; onOpenItem: (i: number) => void }) {
  return (
    <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm flex items-stretch lg:items-center justify-center p-0 lg:p-4">
      <div className="bg-card w-full lg:max-w-5xl lg:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full lg:h-[92vh]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 rounded-md hover:bg-secondary"><X className="h-4 w-4" /></button>
            <div className="font-bold">অ্যালবাম প্রিভিউ</div>
          </div>
          <Btn variant="outline" onClick={onEdit}><Edit3 className="h-4 w-4" /> এডিট</Btn>
        </div>
        <div className="flex-1 overflow-y-auto">
          {album.cover && (
            <div className="relative aspect-[21/9] bg-secondary">
              <img src={album.cover} alt={album.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/95 text-primary">{album.category}</span>
                  <StatusBadge status={album.status} />
                  {album.featured && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-400 text-amber-950"><Star className="h-3 w-3 fill-current" /> ফিচার্ড</span>}
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold">{album.title}</h2>
                <div className="mt-1 text-sm text-white/85 flex flex-wrap gap-x-4">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{album.date}</span>
                  {album.location && <span>· {album.location}</span>}
                </div>
              </div>
            </div>
          )}
          <div className="p-5 md:p-6 space-y-5">
            {album.description && <p className="text-muted-foreground">{album.description}</p>}
            {album.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {album.tags.map((t) => <span key={t} className="px-2 py-1 rounded-md bg-accent text-primary text-xs font-semibold">#{t}</span>)}
              </div>
            )}
            {album.items.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-xl text-muted-foreground text-sm">কোনো মিডিয়া যুক্ত হয়নি।</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {album.items.map((it, i) => (
                  <button key={it.id} onClick={() => onOpenItem(i)} className="relative aspect-square rounded-lg overflow-hidden bg-secondary group">
                    {it.type === "image" ? (
                      <img src={it.url} alt={it.caption || ""} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <>
                        <img src={`https://img.youtube.com/vi/${it.youtubeId}/hqdefault.jpg`} alt={it.caption || "video"} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Play className="h-8 w-8 text-white fill-current" /></div>
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------- Lightbox ------------- */
function Lightbox({ album, idx, onClose, onNav }: { album: Album; idx: number; onClose: () => void; onNav: (i: number) => void }) {
  const it = album.items[idx];
  if (!it) return null;
  const prev = () => onNav((idx - 1 + album.items.length) % album.items.length);
  const next = () => onNav((idx + 1) % album.items.length);
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-4 right-4 h-11 w-11 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"><X className="h-5 w-5" /></button>
      <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 md:left-8 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center">‹</button>
      <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 md:right-8 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center">›</button>
      <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        {it.type === "image" ? (
          <img src={it.url} alt={it.caption || ""} className="max-h-[85vh] mx-auto rounded-xl object-contain shadow-2xl" />
        ) : (
          <div className="aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
            <iframe src={`https://www.youtube.com/embed/${it.youtubeId}?autoplay=1&rel=0`} title={it.caption || "video"} allow="autoplay; encrypted-media" allowFullScreen className="w-full h-full" />
          </div>
        )}
        {it.caption && <div className="mt-4 text-center text-white text-sm">{it.caption}</div>}
      </div>
    </div>
  );
}
