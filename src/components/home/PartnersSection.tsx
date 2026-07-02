import { Link } from "react-router-dom";
import { usePartnersPublic } from "@/hooks/api/usePublic";

export const PartnersSection = () => {
  const { data: partners = [] } = usePartnersPublic();

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

        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {partners.map((p) => (
            <Link
              key={p.slug}
              to={`/partners/${p.slug}`}
              aria-label={`${p.name} সম্পর্কে বিস্তারিত দেখুন`}
              className="group relative bg-card border border-border/60 rounded-2xl p-4 md:p-5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
            >
              <div className="h-16 md:h-20 w-full flex items-center justify-center">
                {p.logo ? (
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="max-h-full w-auto object-contain transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-2xl font-extrabold text-primary/60">{p.name.slice(0, 2)}</div>
                )}
              </div>
              <span className="mt-3 text-xs md:text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {p.name}
              </span>
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
