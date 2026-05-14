import { Link } from "react-router-dom";
import { partners } from "@/data/partners";

export const PartnersSection = () => {
  return (
    <section className="section-y bg-muted/30">
      <div className="container-page">
        <div className="text-center mb-12 md:mb-14">
          <span className="eyebrow text-primary">আমাদের সহযোগী</span>
          <h2 className="heading-display mt-3 text-3xl md:text-4xl font-bold text-foreground">
            আমাদের প্রতিষ্ঠান
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
          <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            বিস্তারিত জানতে যেকোনো প্রতিষ্ঠানের লোগোতে ক্লিক করুন
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {partners.map((p) => (
            <Link
              key={p.slug}
              to={`/partners/${p.slug}`}
              aria-label={`${p.name} সম্পর্কে বিস্তারিত দেখুন`}
              className="group relative bg-card border border-border/60 rounded-card p-8 md:p-12 flex items-center justify-center min-h-[180px] shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
            >
              <img
                src={p.logo}
                alt={p.name}
                className="max-h-24 md:max-h-28 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute bottom-3 right-4 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                বিস্তারিত →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
