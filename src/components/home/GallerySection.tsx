import { useState } from "react";
import { Link } from "react-router-dom";
import { Images, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useGalleryPublic } from "@/hooks/api/usePublic";
import g1 from "@/assets/gallery/01.jpg";
import g2 from "@/assets/gallery/02.jpg";
import g3 from "@/assets/gallery/03.jpg";
import g4 from "@/assets/gallery/04.jpg";
import g5 from "@/assets/gallery/05.jpg";
import g6 from "@/assets/gallery/06.jpg";

const fallback = [
  { src: g1, alt: "বন্যা কবলিত এলাকায় পরিদর্শন" },
  { src: g2, alt: "নৌকায় ত্রাণ বিতরণ" },
  { src: g3, alt: "খাদ্য সামগ্রী বিতরণ কার্যক্রম" },
  { src: g4, alt: "বন্যায় ত্রাণ পৌঁছে দেওয়া" },
  { src: g5, alt: "ত্রাণ প্যাকেজ প্রস্তুতি" },
  { src: g6, alt: "শিশুদের সহায়তা" },
];

export const GallerySection = () => {
  const { data } = useGalleryPublic();
  const apiImages = (data?.items || [])
    .filter((it) => it.kind === "image")
    .slice(0, 6)
    .map((it) => ({ src: it.url, alt: it.title || "গ্যালারি" }));
  const galleryImages = apiImages.length ? apiImages : fallback;

  const [open, setOpen] = useState<number | null>(null);
  const next = () => setOpen((o) => (o === null ? o : (o + 1) % galleryImages.length));
  const prev = () => setOpen((o) => (o === null ? o : (o - 1 + galleryImages.length) % galleryImages.length));

  return (
    <section className="section-y">
      <div className="container-page">
        <div className="text-center mb-10">
          <span className="eyebrow">আমাদের কার্যক্রম</span>
          <h2 className="heading-display mt-3 mx-auto">গ্যালারি</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {galleryImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setOpen(i)}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted card-base p-0 block"
              aria-label={img.alt}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          ))}
        </div>

        <div className="mt-6 md:mt-8 text-center">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            আরও দেখুন <Images className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-fade-up"
          onClick={() => setOpen(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(null); }}
            className="absolute top-4 right-4 h-11 w-11 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
            aria-label="বন্ধ করুন"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 md:left-8 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
            aria-label="আগের"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 md:right-8 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
            aria-label="পরের"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <img
            src={galleryImages[open].src}
            alt={galleryImages[open].alt}
            className="max-h-[88vh] max-w-[92vw] rounded-card object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 backdrop-blur px-5 py-2.5 rounded-full">
            {galleryImages[open].alt}
          </div>
        </div>
      )}
    </section>
  );
};
