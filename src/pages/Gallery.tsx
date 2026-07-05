import { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { useGalleryPublic } from "@/hooks/api/usePublic";
import g1Asset from "@/assets/gallery/01.jpg.asset.json"; const g1 = g1Asset.url;
import g2Asset from "@/assets/gallery/02.jpg.asset.json"; const g2 = g2Asset.url;
import g3Asset from "@/assets/gallery/03.jpg.asset.json"; const g3 = g3Asset.url;
import g4Asset from "@/assets/gallery/04.jpg.asset.json"; const g4 = g4Asset.url;
import g5Asset from "@/assets/gallery/05.jpg.asset.json"; const g5 = g5Asset.url;
import g6Asset from "@/assets/gallery/06.jpg.asset.json"; const g6 = g6Asset.url;
import g7Asset from "@/assets/gallery/07.jpg.asset.json"; const g7 = g7Asset.url;
import g8Asset from "@/assets/gallery/08.jpg.asset.json"; const g8 = g8Asset.url;
import g9Asset from "@/assets/gallery/09.jpg.asset.json"; const g9 = g9Asset.url;
import g10Asset from "@/assets/gallery/10.jpg.asset.json"; const g10 = g10Asset.url;
import g11Asset from "@/assets/gallery/11.jpg.asset.json"; const g11 = g11Asset.url;
import g12Asset from "@/assets/gallery/12.jpg.asset.json"; const g12 = g12Asset.url;
import g13Asset from "@/assets/gallery/13.jpg.asset.json"; const g13 = g13Asset.url;
import g14Asset from "@/assets/gallery/14.jpg.asset.json"; const g14 = g14Asset.url;
import g15Asset from "@/assets/gallery/15.jpg.asset.json"; const g15 = g15Asset.url;
import g16Asset from "@/assets/gallery/16.jpg.asset.json"; const g16 = g16Asset.url;
import g17Asset from "@/assets/gallery/17.jpg.asset.json"; const g17 = g17Asset.url;
import g18Asset from "@/assets/gallery/18.jpg.asset.json"; const g18 = g18Asset.url;
import g19Asset from "@/assets/gallery/19.jpg.asset.json"; const g19 = g19Asset.url;
import g20Asset from "@/assets/gallery/20.jpg.asset.json"; const g20 = g20Asset.url;

type Tab = "photos" | "videos";

type ImageItem = { src: string; alt: string; cat: string };
type VideoItem = { thumb: string; title: string; cat: string; youtubeId: string; duration?: string };

// Static fallback (used only if DB is empty)
const fallbackImages: ImageItem[] = [
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

const fallbackVideos: VideoItem[] = [
  { thumb: g4, title: "বন্যা কবলিত এলাকায় ত্রাণ অভিযান", cat: "ত্রাণ", youtubeId: "dQw4w9WgXcQ" },
];

// Extract YouTube ID from any common URL format
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
    /^([\w-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

const Gallery = () => {
  const { t } = useTranslation();
  const { data } = useGalleryPublic();
  const ALL = t("galleryPage.all");

  // Build a map: album_id -> album for category lookup
  const albumMap = useMemo(() => {
    const m = new Map<string, { category: string; title: string }>();
    (data?.albums || []).forEach((a) => m.set(a.id, { category: a.category || "অন্যান্য", title: a.title }));
    return m;
  }, [data]);

  // Merge API items with static fallback (API takes priority)
  const items: ImageItem[] = useMemo(() => {
    const apiImgs = (data?.items || [])
      .filter((it) => it.kind === "image")
      .map((it) => ({
        src: it.url,
        alt: it.caption || it.title || albumMap.get(it.album_id || "")?.title || "গ্যালারি",
        cat: albumMap.get(it.album_id || "")?.category || "অন্যান্য",
      }));
    return apiImgs.length ? apiImgs : fallbackImages;
  }, [data, albumMap]);

  const videos: VideoItem[] = useMemo(() => {
    const apiVids = (data?.items || [])
      .filter((it) => it.kind === "video")
      .map((it) => {
        const id = it.youtube_id || extractYouTubeId(it.url) || "";
        return {
          thumb: it.thumb_url || `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
          title: it.caption || it.title || "ভিডিও",
          cat: albumMap.get(it.album_id || "")?.category || "অন্যান্য",
          youtubeId: id,
          duration: it.duration || undefined,
        };
      })
      .filter((v) => v.youtubeId);
    return apiVids.length ? apiVids : fallbackVideos;
  }, [data, albumMap]);


  const cats = useMemo(() => [ALL, ...Array.from(new Set(items.map((i) => i.cat)))], [items, ALL]);
  const videoCats = useMemo(() => [ALL, ...Array.from(new Set(videos.map((v) => v.cat)))], [videos, ALL]);

  const [tab, setTab] = useState<Tab>("photos");
  const [active, setActive] = useState<string>(ALL);
  const [activeVideoCat, setActiveVideoCat] = useState<string>(ALL);
  const [open, setOpen] = useState<number | null>(null);
  const [openVideo, setOpenVideo] = useState<number | null>(null);

  const filtered = active === ALL ? items : items.filter((i) => i.cat === active);
  const filteredVideos = activeVideoCat === ALL ? videos : videos.filter((v) => v.cat === activeVideoCat);

  const next = () => setOpen((o) => (o === null ? o : (o + 1) % filtered.length));
  const prev = () => setOpen((o) => (o === null ? o : (o - 1 + filtered.length) % filtered.length));

  const nextVideo = () => setOpenVideo((o) => (o === null ? o : (o + 1) % filteredVideos.length));
  const prevVideo = () => setOpenVideo((o) => (o === null ? o : (o - 1 + filteredVideos.length) % filteredVideos.length));

  const sidebarCats: string[] = tab === "photos" ? cats : videoCats;
  const activeCat: string = tab === "photos" ? active : activeVideoCat;
  const setActiveCat = (c: string) => {
    if (tab === "photos") setActive(c);
    else setActiveVideoCat(c);
  };

  const tabLabels: Record<Tab, string> = { photos: t("galleryPage.photos"), videos: t("galleryPage.videos") };

  return (
    <SiteLayout>
      <Seo title={t("galleryPage.seoTitle")} description={t("galleryPage.seoDesc")} canonical="/gallery" />

      <PageHero
        image={g1}
        eyebrow={t("galleryPage.eyebrow")}
        title={t("galleryPage.title")}
        subtitle={t("galleryPage.subtitle")}
      />


      {/* Tab switcher */}
      <section className="bg-secondary/40 py-8 md:py-10 border-b border-border">
        <div className="container-page flex justify-center">
          <div className="inline-flex p-1.5 rounded-full bg-card shadow-card border border-border">
            {(["photos", "videos"] as Tab[]).map((tk) => (
              <button
                key={tk}
                onClick={() => setTab(tk)}
                className={`px-7 md:px-10 py-2.5 rounded-full text-sm md:text-base font-semibold transition-all duration-300 ${
                  tab === tk
                    ? "bg-accent text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tabLabels[tk]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-10 md:py-16">
        <div className="container-page grid lg:grid-cols-[260px_1fr] gap-6 md:gap-8">
          {/* Sidebar categories */}
          <aside className="lg:sticky lg:top-28 self-start">
            <div className="bg-card rounded-card shadow-card border border-border overflow-hidden">
              {sidebarCats.map((c, idx) => {
                const isActive = activeCat === c;
                return (
                  <button
                    key={c}
                    onClick={() => setActiveCat(c)}
                    className={`relative w-full text-left px-5 py-3.5 text-[15px] font-medium transition-colors ${
                      idx !== sidebarCats.length - 1 ? "border-b border-border" : ""
                    } ${isActive ? "text-primary" : "text-foreground/80 hover:bg-accent/50"}`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-primary" />
                    )}
                    {c}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Grid */}
          {tab === "photos" ? (
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {filtered.map((it, i) => (
                <button
                  key={i}
                  onClick={() => setOpen(i)}
                  className="group relative rounded-card overflow-hidden aspect-[4/3] shadow-card hover:shadow-card-hover transition-all"
                >
                  <img src={it.src} alt={it.alt} loading="lazy" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div>
                      <span className="inline-block text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-donate-highlight text-donate-highlight-foreground font-bold">{it.cat}</span>
                      <p className="mt-1.5 text-white text-sm font-semibold leading-snug">{it.alt}</p>
                    </div>
                  </div>
                  <span className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImageIcon className="h-4 w-4 text-primary" />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {filteredVideos.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-16">
                  এই ক্যাটাগরিতে কোনো ভিডিও পাওয়া যায়নি।
                </div>
              )}
              {filteredVideos.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setOpenVideo(i)}
                  className="group relative rounded-card overflow-hidden aspect-video shadow-card hover:shadow-card-hover transition-all text-left"
                >
                  <img src={v.thumb} alt={v.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="h-16 w-16 rounded-full bg-white/95 flex items-center justify-center shadow-donate group-hover:scale-110 transition-transform">
                      <Play className="h-7 w-7 text-donate-red ml-1" fill="currentColor" />
                    </span>
                  </div>
                  {v.duration && (
                    <span className="absolute top-3 right-3 text-[11px] font-semibold text-white bg-black/70 backdrop-blur px-2 py-1 rounded">
                      {v.duration}
                    </span>
                  )}
                  <div className="absolute left-0 right-0 bottom-0 p-4">
                    <span className="inline-block text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-donate-highlight text-donate-highlight-foreground font-bold">{v.cat}</span>
                    <p className="mt-1.5 text-white text-sm font-semibold leading-snug">{v.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Image Lightbox */}
      {open !== null && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-fade-up" onClick={() => setOpen(null)}>
          <button onClick={(e) => { e.stopPropagation(); setOpen(null); }} className="absolute top-4 right-4 h-11 w-11 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center" aria-label="বন্ধ করুন"><X className="h-5 w-5" /></button>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 md:left-8 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center" aria-label="আগের"><ChevronLeft className="h-6 w-6" /></button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 md:right-8 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center" aria-label="পরের"><ChevronRight className="h-6 w-6" /></button>
          <img src={filtered[open].src} alt={filtered[open].alt} className="max-h-[88vh] max-w-[92vw] rounded-card object-contain shadow-2xl" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 backdrop-blur px-5 py-2.5 rounded-full">{filtered[open].alt}</div>
        </div>
      )}

      {/* Video Lightbox */}
      {openVideo !== null && filteredVideos[openVideo] && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fade-up" onClick={() => setOpenVideo(null)}>
          <button onClick={(e) => { e.stopPropagation(); setOpenVideo(null); }} className="absolute top-4 right-4 h-11 w-11 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center z-10" aria-label="বন্ধ করুন"><X className="h-5 w-5" /></button>
          <button onClick={(e) => { e.stopPropagation(); prevVideo(); }} className="absolute left-4 md:left-8 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center z-10" aria-label="আগের"><ChevronLeft className="h-6 w-6" /></button>
          <button onClick={(e) => { e.stopPropagation(); nextVideo(); }} className="absolute right-4 md:right-8 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center z-10" aria-label="পরের"><ChevronRight className="h-6 w-6" /></button>
          <div className="w-full max-w-5xl aspect-video rounded-card overflow-hidden shadow-2xl bg-black" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube.com/embed/${filteredVideos[openVideo].youtubeId}?autoplay=1&rel=0`}
              title={filteredVideos[openVideo].title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 backdrop-blur px-5 py-2.5 rounded-full max-w-[90vw] truncate">
            {filteredVideos[openVideo].title}
          </div>
        </div>
      )}
    </SiteLayout>
  );
};

export default Gallery;
