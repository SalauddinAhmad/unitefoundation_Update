import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Play } from "lucide-react";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import relief from "@/assets/hero-relief.jpg";
import water from "@/assets/hero-water.jpg";
import mosque from "@/assets/hero-mosque.jpg";
import food from "@/assets/program-food.jpg";
import orphan from "@/assets/program-orphan.jpg";
import winter from "@/assets/program-winter.jpg";
import education from "@/assets/program-education.jpg";
import wellWork from "@/assets/program-water.jpg";
import mosqueBuild from "@/assets/program-mosque.jpg";
import about from "@/assets/about-mission.jpg";
import field from "@/assets/blog-field.jpg";
import ramadan from "@/assets/blog-ramadan.jpg";

type Tab = "ছবি" | "ভিডিও";
type Cat = "সকল" | "ত্রাণ" | "খাদ্য বিতরণ" | "শিক্ষা" | "এতিম" | "মসজিদ" | "শীত" | "পানি";

const items: { src: string; alt: string; cat: Cat }[] = [
  { src: relief, alt: "ত্রাণ বিতরণ — সন্ধ্যাবেলা", cat: "ত্রাণ" },
  { src: water, alt: "নলকূপের পানি সংগ্রহ", cat: "পানি" },
  { src: mosque, alt: "গ্রামীণ মসজিদ — সূর্যোদয়", cat: "মসজিদ" },
  { src: food, alt: "খাদ্য প্যাকেজ প্রস্তুত", cat: "খাদ্য বিতরণ" },
  { src: orphan, alt: "এতিম শিশুদের পাঠদান", cat: "এতিম" },
  { src: winter, alt: "শীতবস্ত্র বিতরণ", cat: "শীত" },
  { src: education, alt: "মেয়েদের শিক্ষা কর্মসূচি", cat: "শিক্ষা" },
  { src: wellWork, alt: "নলকূপ স্থাপন", cat: "পানি" },
  { src: mosqueBuild, alt: "মসজিদ নির্মাণ চলমান", cat: "মসজিদ" },
  { src: about, alt: "বন্যা ত্রাণ অভিযান", cat: "ত্রাণ" },
  { src: field, alt: "মাঠ পর্যায়ে পরিদর্শন", cat: "ত্রাণ" },
  { src: ramadan, alt: "রমজান ইফতার আয়োজন", cat: "খাদ্য বিতরণ" },
];

const cats: Cat[] = ["সকল", "ত্রাণ", "খাদ্য বিতরণ", "শিক্ষা", "এতিম", "মসজিদ", "শীত", "পানি"];

const Gallery = () => {
  const [tab, setTab] = useState<Tab>("ছবি");
  const [active, setActive] = useState<Cat>("সকল");
  const [open, setOpen] = useState<number | null>(null);
  const filtered = active === "সকল" ? items : items.filter((i) => i.cat === active);

  const next = () => setOpen((o) => (o === null ? o : (o + 1) % filtered.length));
  const prev = () => setOpen((o) => (o === null ? o : (o - 1 + filtered.length) % filtered.length));

  return (
    <SiteLayout>
      <Seo title="গ্যালারি | ইউনাইট ফাউন্ডেশন" description="মাঠ পর্যায়ের কাজের ছবি ও মুহূর্তগুলো।" canonical="/gallery" />

      <PageHero
        image={relief}
        eyebrow="গ্যালারি"
        title="আমাদের কাজের মুহূর্তগুলো"
        subtitle="মাঠ পর্যায়ের ছবি ও ভিডিওতে আমাদের সেবার গল্প।"
      />

      {/* Tab switcher */}
      <section className="bg-secondary/40 py-8 md:py-10 border-b border-border">
        <div className="container-page flex justify-center">
          <div className="inline-flex p-1.5 rounded-full bg-card shadow-card border border-border">
            {(["ছবি", "ভিডিও"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-7 md:px-10 py-2.5 rounded-full text-sm md:text-base font-semibold transition-all duration-300 ${
                  tab === t
                    ? "bg-accent text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
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
              {cats.map((c, idx) => {
                const isActive = active === c;
                return (
                  <button
                    key={c}
                    onClick={() => setActive(c)}
                    className={`relative w-full text-left px-5 py-3.5 text-[15px] font-medium transition-colors ${
                      idx !== cats.length - 1 ? "border-b border-border" : ""
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
          {tab === "ছবি" ? (
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
              {filtered.slice(0, 6).map((it, i) => (
                <div key={i} className="group relative rounded-card overflow-hidden aspect-video shadow-card hover:shadow-card-hover transition-all">
                  <img src={it.src} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="h-16 w-16 rounded-full bg-white/95 flex items-center justify-center shadow-donate group-hover:scale-110 transition-transform">
                      <Play className="h-7 w-7 text-donate-red ml-1" fill="currentColor" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {open !== null && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-fade-up" onClick={() => setOpen(null)}>
          <button onClick={(e) => { e.stopPropagation(); setOpen(null); }} className="absolute top-4 right-4 h-11 w-11 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center" aria-label="বন্ধ করুন"><X className="h-5 w-5" /></button>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 md:left-8 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center" aria-label="আগের"><ChevronLeft className="h-6 w-6" /></button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 md:right-8 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center" aria-label="পরের"><ChevronRight className="h-6 w-6" /></button>
          <img src={filtered[open].src} alt={filtered[open].alt} className="max-h-[88vh] max-w-[92vw] rounded-card object-contain shadow-2xl" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 backdrop-blur px-5 py-2.5 rounded-full">{filtered[open].alt}</div>
        </div>
      )}
    </SiteLayout>
  );
};

export default Gallery;
