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
    <section className="section-y bg-secondary/40">
      <div className="container-page">
        <div className="text-center mb-10">
          <span className="eyebrow">আমাদের কার্যক্রম</span>
          <h2 className="heading-display mt-3 mx-auto">গ্যালারি</h2>
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
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            আরও দেখুন <Images className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
