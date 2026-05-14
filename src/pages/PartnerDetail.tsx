import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, CheckCircle2 } from "lucide-react";
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
      <section className="relative pt-32 md:pt-36 pb-12 md:pb-16 bg-gradient-to-b from-primary/10 via-background to-background border-b border-border/40">
        <div className="container-page">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> হোম পেজে ফিরে যান
          </Link>
          <div className="grid md:grid-cols-[auto,1fr] gap-8 md:gap-10 items-center">
            <div className="bg-card border border-border/60 rounded-card p-8 md:p-10 shadow-card flex items-center justify-center w-full md:w-64 h-48 md:h-56">
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-h-28 md:max-h-32 w-auto object-contain"
              />
            </div>
            <div>
              <span className="eyebrow text-primary">সহযোগী প্রতিষ্ঠান</span>
              <h1 className="heading-display mt-3 text-3xl md:text-5xl font-bold text-foreground">
                {partner.name}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                {partner.tagline}
              </p>
              {partner.established && (
                <p className="mt-2 text-sm text-muted-foreground">{partner.established}</p>
              )}
              {partner.website && (
                <Button asChild className="mt-6">
                  <a href={partner.website} target="_blank" rel="noopener noreferrer">
                    ওয়েবসাইট ভিজিট করুন <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section-y">
        <div className="container-page max-w-4xl">
          <span className="eyebrow text-primary">পরিচিতি</span>
          <h2 className="heading-display mt-3 text-2xl md:text-3xl font-bold text-foreground">
            প্রতিষ্ঠান সম্পর্কে
          </h2>
          <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
          <p className="mt-6 text-base md:text-lg leading-relaxed text-foreground/85">
            {partner.description}
          </p>
        </div>
      </section>

      {/* Activities */}
      <section className="section-y bg-muted/30">
        <div className="container-page">
          <div className="text-center mb-10 md:mb-12">
            <span className="eyebrow text-primary">কার্যাবলী</span>
            <h2 className="heading-display mt-3 text-2xl md:text-3xl font-bold text-foreground">
              সংক্ষিপ্ত কার্যক্রম
            </h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
          </div>
          <div className="grid sm:grid-cols-2 gap-5 md:gap-6 max-w-4xl mx-auto">
            {partner.activities.map((a, i) => (
              <div
                key={i}
                className="bg-card border border-border/60 rounded-card p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{a.title}</h3>
                    <p className="mt-1.5 text-sm md:text-base text-muted-foreground leading-relaxed">
                      {a.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other partners */}
      {others.length > 0 && (
        <section className="section-y">
          <div className="container-page">
            <div className="text-center mb-10">
              <span className="eyebrow text-primary">আরও দেখুন</span>
              <h2 className="heading-display mt-3 text-2xl md:text-3xl font-bold text-foreground">
                অন্যান্য সহযোগী
              </h2>
            </div>
            <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6">
              {others.map((p) => (
                <Link
                  key={p.slug}
                  to={`/partners/${p.slug}`}
                  className="group bg-card border border-border/60 rounded-card p-8 flex items-center justify-center min-h-[160px] shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                >
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="max-h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
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
