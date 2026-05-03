import uniteTv from "@/assets/partner-unite-tv.png";
import attayeba from "@/assets/partner-attayeba.png";

const partners = [
  { name: "Unite TV", logo: uniteTv },
  { name: "আত-ত্বাইয়েবা প্রকাশনী", logo: attayeba },
  { name: "Unite TV", logo: uniteTv },
  { name: "আত-ত্বাইয়েবা প্রকাশনী", logo: attayeba },
  { name: "Unite TV", logo: uniteTv },
  { name: "আত-ত্বাইয়েবা প্রকাশনী", logo: attayeba },
];

export const PartnersSection = () => {
  // Duplicate list for seamless infinite marquee
  const loop = [...partners, ...partners];

  return (
    <section className="section-y bg-muted/30">
      <div className="container-page">
        <div className="text-center mb-12 md:mb-14">
          <span className="eyebrow text-primary">আমাদের সহযোগী</span>
          <h2 className="heading-display mt-3 text-3xl md:text-4xl font-bold text-foreground">
            আমাদের প্রতিষ্ঠান
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
        </div>

        <div className="relative max-w-6xl mx-auto overflow-hidden">
          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 z-10 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 z-10 bg-gradient-to-l from-background to-transparent" />

          <div className="flex gap-6 md:gap-8 animate-marquee hover:[animation-play-state:paused]">
            {loop.map((p, i) => (
              <div
                key={i}
                className="shrink-0 w-[80vw] sm:w-[40vw] md:w-[calc((min(72rem,100vw)-6rem)/3)] group relative bg-card border border-border/60 rounded-card p-8 md:p-10 flex items-center justify-center min-h-[160px] shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <img
                  src={p.logo}
                  alt={p.name}
                  className="relative max-h-20 md:max-h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
