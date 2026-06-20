import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Quote, ArrowUpRight, Award, Calendar, Globe2, Phone, MapPin, Target, BookOpen, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { getPartner, partners } from "@/data/partners";

const PartnerDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const partner = slug ? getPartner(slug) : undefined;

  if (!partner) return <Navigate to="/" replace />;

  const others = partners.filter((p) => p.slug !== partner.slug);

  return (
    <SiteLayout>
      <Seo
        title={`${partner.name} | ইউনাইট ফাউন্ডেশনের সহযোগী প্রতিষ্ঠান`}
        description={partner.tagline}
        canonical={`/partners/${partner.slug}`}
      />

      {/* Hero */}
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-28 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/15 via-background to-background" />
        <div
          className="absolute inset-0 -z-10 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-primary/20 blur-3xl -z-10" />
        <div className="absolute -bottom-32 -left-24 w-[380px] h-[380px] rounded-full bg-primary/10 blur-3xl -z-10" />

        <div className="container-page">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10 group"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card/60 backdrop-blur group-hover:border-primary/60 group-hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </span>
            হোম পেজে ফিরে যান
          </Link>

          <div className="grid lg:grid-cols-[1fr,420px] gap-10 lg:gap-14 items-center">
            {/* Heading */}
            <div className="order-2 lg:order-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-primary uppercase">
                <Sparkles className="h-3.5 w-3.5" /> সহযোগী প্রতিষ্ঠান
              </span>
              <h1 className="heading-display mt-5 text-4xl md:text-6xl font-bold text-foreground leading-tight">
                {partner.name}
              </h1>
              <div className="mt-5 h-1 w-24 rounded-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                {partner.tagline}
              </p>

              {/* Meta row */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {partner.established && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur px-4 py-2 text-sm text-foreground/80">
                    <Calendar className="h-4 w-4 text-primary" />
                    {partner.established}
                  </div>
                )}
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur px-4 py-2 text-sm text-foreground/80">
                  <Award className="h-4 w-4 text-primary" />
                  ইউনাইট ফাউন্ডেশন পরিবার
                </div>
              </div>

              {partner.website && (
                <Button asChild size="lg" className="mt-8 group/btn shadow-lg shadow-primary/20">
                  <a href={partner.website} target="_blank" rel="noopener noreferrer">
                    <Globe2 className="mr-2 h-4 w-4" />
                    ওয়েবসাইট ভিজিট করুন
                    <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </a>
                </Button>
              )}
            </div>

            {/* Logo card */}
            <div className="relative group order-1 lg:order-2">
              <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-tr from-primary/40 via-primary/10 to-primary/40 opacity-70 blur-xl group-hover:opacity-100 transition-opacity" />
              <div className="relative rounded-[2rem] border border-border/60 bg-card/80 backdrop-blur-xl p-10 md:p-14 shadow-card overflow-hidden">
                {/* Corner accents */}
                <span className="absolute top-4 left-4 h-3 w-3 border-t-2 border-l-2 border-primary/60" />
                <span className="absolute top-4 right-4 h-3 w-3 border-t-2 border-r-2 border-primary/60" />
                <span className="absolute bottom-4 left-4 h-3 w-3 border-b-2 border-l-2 border-primary/60" />
                <span className="absolute bottom-4 right-4 h-3 w-3 border-b-2 border-r-2 border-primary/60" />
                <div className="flex items-center justify-center min-h-[200px]">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-40 md:max-h-48 w-auto object-contain drop-shadow-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About — editorial style */}
      <section className="section-y relative overflow-hidden">
        <div className="container-page">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <span className="eyebrow text-primary">পরিচিতি</span>
                <h2 className="heading-display mt-3 text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  প্রতিষ্ঠান<br />সম্পর্কে
                </h2>
                <div className="mt-5 h-1 w-16 rounded-full bg-gradient-to-r from-primary to-primary/30" />
                <p className="mt-5 text-sm text-muted-foreground">
                  আমাদের যাত্রা, লক্ষ্য ও কর্মপরিধি সম্পর্কে এক নজরে জানুন।
                </p>
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="relative rounded-card border border-border/60 bg-gradient-to-br from-card to-card/40 backdrop-blur p-8 md:p-12 shadow-card">
                <Quote className="absolute -top-4 -left-2 h-12 w-12 text-primary/20" strokeWidth={1.5} />
                <p className="text-lg md:text-xl leading-[1.9] text-foreground/90 first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 first-letter:float-left first-letter:leading-[1]">
                  {partner.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activities — premium numbered cards */}
      <section className="section-y relative overflow-hidden border-t border-border/40">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/30 via-background to-muted/20" />
        <div
          className="absolute inset-0 -z-10 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container-page">
          <div className="text-center mb-14 md:mb-16">
            <span className="eyebrow text-primary">কার্যাবলী</span>
            <h2 className="heading-display mt-3 text-3xl md:text-4xl font-bold text-foreground">
              আমাদের সংক্ষিপ্ত কার্যক্রম
            </h2>
            <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
            <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
              যে সকল ক্ষেত্রে আমরা নিরবিচ্ছিন্নভাবে কাজ করে যাচ্ছি
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 md:gap-7 max-w-5xl mx-auto">
            {partner.activities.map((a, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-card border border-border/60 bg-card/80 backdrop-blur p-7 md:p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/40 transition-all duration-500"
              >
                {/* Hover gradient sweep */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Big number watermark */}
                <span className="absolute -top-2 -right-2 text-[7rem] font-black leading-none text-primary/5 select-none group-hover:text-primary/10 transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-lg shadow-lg shadow-primary/30">
                    {i + 1}
                  </div>
                  <h3 className="mt-5 font-bold text-foreground text-xl">{a.title}</h3>
                  <div className="mt-3 h-px w-10 bg-primary/40 group-hover:w-16 transition-all duration-500" />
                  <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                    {a.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other partners */}
      {others.length > 0 && (
        <section className="section-y border-t border-border/40">
          <div className="container-page">
            <div className="text-center mb-12">
              <span className="eyebrow text-primary">আরও দেখুন</span>
              <h2 className="heading-display mt-3 text-2xl md:text-3xl font-bold text-foreground">
                অন্যান্য সহযোগী প্রতিষ্ঠান
              </h2>
              <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
            </div>
            <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6">
              {others.map((p) => (
                <Link
                  key={p.slug}
                  to={`/partners/${p.slug}`}
                  className="group relative overflow-hidden rounded-card border border-border/60 bg-card/80 backdrop-blur p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/40 transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-center gap-6">
                    <div className="shrink-0 h-20 w-20 rounded-xl border border-border/60 bg-background flex items-center justify-center">
                      <img
                        src={p.logo}
                        alt={p.name}
                        className="max-h-14 w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-lg truncate">{p.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.tagline}</p>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                        বিস্তারিত দেখুন
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
};

export default PartnerDetail;
