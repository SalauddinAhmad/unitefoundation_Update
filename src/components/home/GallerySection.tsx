import { useState } from "react";
import { X, Images } from "lucide-react";

const galleryImages = [
  { src: "https://picsum.photos/seed/gallery1/800/600", alt: "গ্যালারি ছবি ১" },
  { src: "https://picsum.photos/seed/gallery2/800/600", alt: "গ্যালারি ছবি ২" },
  { src: "https://picsum.photos/seed/gallery3/800/600", alt: "গ্যালারি ছবি ৩" },
  { src: "https://picsum.photos/seed/gallery4/800/600", alt: "গ্যালারি ছবি ৪" },
  { src: "https://picsum.photos/seed/gallery5/800/600", alt: "গ্যালারি ছবি ৫" },
  { src: "https://picsum.photos/seed/gallery6/800/600", alt: "গ্যালারি ছবি ৬" },
  { src: "https://picsum.photos/seed/gallery7/800/600", alt: "গ্যালারি ছবি ৭" },
  { src: "https://picsum.photos/seed/gallery8/800/600", alt: "গ্যালারি ছবি ৮" },
  { src: "https://picsum.photos/seed/gallery9/800/600", alt: "গ্যালারি ছবি ৯" },
  { src: "https://picsum.photos/seed/gallery10/800/600", alt: "গ্যালারি ছবি ১০" },
  { src: "https://picsum.photos/seed/gallery11/800/600", alt: "গ্যালারি ছবি ১১" },
  { src: "https://picsum.photos/seed/gallery12/800/600", alt: "গ্যালারি ছবি ১২" },
];

export const GallerySection = () => {
  const [open, setOpen] = useState(false);
  const [activeSrc, setActiveSrc] = useState<string | null>(null);
  const preview = galleryImages.slice(0, 6);

  return (
    <section className="section-y bg-secondary/40">
      <div className="container-page">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <span className="eyebrow">আমাদের কার্যক্রম</span>
            <h2 className="heading-display mt-3 max-w-xl">গ্যালারি</h2>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="hidden md:inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            আরও দেখুন <Images className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {preview.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveSrc(img.src)}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted card-base p-0"
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

        <div className="mt-6 md:hidden text-center">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 text-primary font-semibold"
          >
            আরও দেখুন <Images className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Full gallery modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div className="container-page py-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl md:text-2xl font-bold">সম্পূর্ণ গ্যালারি</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="বন্ধ করুন"
                className="p-2 rounded-lg hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSrc(img.src)}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted p-0"
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
          </div>
        </div>
      )}

      {/* Lightbox */}
      {activeSrc && (
        <div
          className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveSrc(null)}
        >
          <button
            onClick={() => setActiveSrc(null)}
            aria-label="বন্ধ করুন"
            className="absolute top-4 right-4 p-2 rounded-lg bg-card/80 hover:bg-card"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={activeSrc}
            alt="বড় ছবি"
            className="max-h-[90vh] max-w-[95vw] object-contain rounded-lg shadow-card-hover"
          />
        </div>
      )}
    </section>
  );
};
