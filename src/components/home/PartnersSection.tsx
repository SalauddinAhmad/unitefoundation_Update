import uniteTv from "@/assets/partner-unite-tv.png";
import attayeba from "@/assets/partner-attayeba.png";

const partners = [
  { name: "Unite TV", logo: uniteTv },
  { name: "আত-ত্বাইয়েবা প্রকাশনী", logo: attayeba },
];

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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {partners.map((p) => (
            <div
              key={p.name}
              className="group relative bg-card border border-border/60 rounded-card p-8 md:p-10 flex items-center justify-center min-h-[160px] shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 rounded-card bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
    </section>
  );
};
