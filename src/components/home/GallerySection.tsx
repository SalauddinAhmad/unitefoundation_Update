import { Link } from "react-router-dom";
import { Images } from "lucide-react";
import g1 from "@/assets/gallery/01.jpg";
import g2 from "@/assets/gallery/02.jpg";
import g3 from "@/assets/gallery/03.jpg";
import g4 from "@/assets/gallery/04.jpg";
import g5 from "@/assets/gallery/05.jpg";
import g6 from "@/assets/gallery/06.jpg";

const galleryImages = [
  { src: g1, alt: "বন্যা কবলিত এলাকায় পরিদর্শন" },
  { src: g2, alt: "নৌকায় ত্রাণ বিতরণ" },
  { src: g3, alt: "খাদ্য সামগ্রী বিতরণ কার্যক্রম" },
  { src: g4, alt: "বন্যায় ত্রাণ পৌঁছে দেওয়া" },
  { src: g5, alt: "ত্রাণ প্যাকেজ প্রস্তুতি" },
  { src: g6, alt: "শিশুদের সহায়তা" },
];

export const GallerySection = () => {
  return (
    <section className="section-y">
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
