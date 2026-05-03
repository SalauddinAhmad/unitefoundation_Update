import { Link } from "react-router-dom";
import { Images } from "lucide-react";

const galleryImages = [
  { src: "https://picsum.photos/seed/gallery1/800/600", alt: "গ্যালারি ছবি ১" },
  { src: "https://picsum.photos/seed/gallery2/800/600", alt: "গ্যালারি ছবি ২" },
  { src: "https://picsum.photos/seed/gallery3/800/600", alt: "গ্যালারি ছবি ৩" },
  { src: "https://picsum.photos/seed/gallery4/800/600", alt: "গ্যালারি ছবি ৪" },
  { src: "https://picsum.photos/seed/gallery5/800/600", alt: "গ্যালারি ছবি ৫" },
  { src: "https://picsum.photos/seed/gallery6/800/600", alt: "গ্যালারি ছবি ৬" },
];

export const GallerySection = () => {
  return (
    <section
      className="section-y relative overflow-hidden isolate"
      style={{
        background:
          "radial-gradient(1200px 600px at 50% -10%, hsl(var(--donate-highlight) / 0.18), transparent 60%), radial-gradient(800px 500px at 0% 100%, hsl(var(--donate-orange) / 0.18), transparent 55%), radial-gradient(800px 500px at 100% 100%, hsl(152 100% 14% / 0.55), transparent 55%), linear-gradient(180deg, hsl(152 80% 9%) 0%, hsl(152 100% 12%) 50%, hsl(152 80% 8%) 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:26px_26px]" />
      <div className="container-page relative">
        <div className="text-center mb-10">
          <span className="eyebrow !text-[hsl(var(--donate-highlight))]">আমাদের কার্যক্রম</span>
          <h2 className="heading-display mt-3 mx-auto text-white">গ্যালারি</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {galleryImages.map((img, i) => (
            <Link
              key={i}
              to="/gallery"
              className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted card-base p-0 block"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          ))}
        </div>

        <div className="mt-6 md:mt-8 text-center">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-[hsl(var(--donate-highlight))] font-semibold hover:gap-3 transition-all"
          >
            আরও দেখুন <Images className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
