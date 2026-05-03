import { useState } from "react";
import { X } from "lucide-react";
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

type Cat = "সব" | "ত্রাণ" | "পানি" | "শিক্ষা" | "এতিম" | "মসজিদ" | "শীত";

const items: { src: string; alt: string; cat: Cat }[] = [
  { src: relief, alt: "ত্রাণ বিতরণ — সন্ধ্যাবেলা", cat: "ত্রাণ" },
  { src: water, alt: "নলকূপের পানি সংগ্রহ", cat: "পানি" },
  { src: mosque, alt: "গ্রামীণ মসজিদ — সূর্যোদয়", cat: "মসজিদ" },
  { src: food, alt: "খাদ্য প্যাকেজ প্রস্তুত", cat: "ত্রাণ" },
  { src: orphan, alt: "এতিম শিশুদের পাঠদান", cat: "এতিম" },
  { src: winter, alt: "শীতবস্ত্র বিতরণ", cat: "শীত" },
  { src: education, alt: "মেয়েদের শিক্ষা কর্মসূচি", cat: "শিক্ষা" },
  { src: wellWork, alt: "নলকূপ স্থাপন", cat: "পানি" },
  { src: mosqueBuild, alt: "মসজিদ নির্মাণ চলমান", cat: "মসজিদ" },
  { src: about, alt: "বন্যা ত্রাণ অভিযান", cat: "ত্রাণ" },
  { src: field, alt: "মাঠ পর্যায়ে পরিদর্শন", cat: "ত্রাণ" },
  { src: ramadan, alt: "রমজান ইফতার আয়োজন", cat: "ত্রাণ" },
];

const cats: Cat[] = ["সব", "ত্রাণ", "পানি", "শিক্ষা", "এতিম", "মসজিদ", "শীত"];

const Gallery = () => {
  const [active, setActive] = useState<Cat>("সব");
  const [open, setOpen] = useState<number | null>(null);
  const filtered = active === "সব" ? items : items.filter((i) => i.cat === active);

  return (
    <SiteLayout>
      <Seo title="গ্যালারি | ইউনাইট ফাউন্ডেশন" description="মাঠ পর্যায়ের কাজের ছবি ও মুহূর্তগুলো।" canonical="/gallery" />

      <section className="bg-secondary/40 pt-14 pb-10 md:pt-20 md:pb-14">
        <div className="container-page">
          <span className="eyebrow">গ্যালারি</span>
          <h1 className="heading-display mt-3 max-w-2xl">আমাদের কাজের মুহূর্তগুলো</h1>
          <p className="mt-4 text-muted-foreground max-w-xl">মাঠ পর্যায়ের প্রতিটি কাজের গল্প — ছবিতে।</p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container-page">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-btn text-sm font-semibold transition-all ${
                  active === c ? "gradient-donate-bg text-white shadow-donate" : "bg-card border border-border hover:border-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((it, i) => (
              <button
                key={i}
                onClick={() => setOpen(i)}
                className="group relative rounded-card overflow-hidden aspect-square shadow-card hover:shadow-card-hover transition-all"
              >
                <img src={it.src} alt={it.alt} loading="lazy" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-sm font-semibold">{it.alt}</span>
                </div>
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-card/90 text-primary">{it.cat}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {open !== null && (
        <div className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4 animate-fade-up" onClick={() => setOpen(null)}>
          <button onClick={() => setOpen(null)} className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="বন্ধ করুন"><X className="h-5 w-5" /></button>
          <img src={filtered[open].src} alt={filtered[open].alt} className="max-h-[88vh] max-w-[92vw] rounded-card object-contain" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 px-4 py-2 rounded-btn">{filtered[open].alt}</div>
        </div>
      )}
    </SiteLayout>
  );
};

export default Gallery;
