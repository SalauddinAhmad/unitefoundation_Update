import { useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowLeft, ArrowUpRight, BadgeCheck, Globe2, Phone, MapPin,
  Target, BookOpen, CheckCircle2, Sparkles, Mail, Star, Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Seo } from "@/components/Seo";
import { partnerThemeTokens } from "@/data/partners";
import { usePartnerPublic, usePartnersPublic } from "@/hooks/api/usePublic";

const PartnerDetail = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data: partner, isLoading } = usePartnerPublic(slug || "");
  const { data: partners = [] } = usePartnersPublic();

  if (isLoading) return (
    <SiteLayout>
      <div className="py-32 flex justify-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
    </SiteLayout>
  );
  if (!partner) return <Navigate to="/" replace />;

  const others = partners.filter((p) => p.slug !== partner.slug);
  const year = partner.established?.match(/\d{4}|[০-৯]{4}/)?.[0] || "—";
  const tokens = partnerThemeTokens[partner.theme ?? "green"];
  const themeStyle = {
    ["--primary" as any]: tokens.primary,
    ["--primary-foreground" as any]: tokens.primaryForeground,
    ["--donate-highlight" as any]: tokens.highlight,
    ["--donate-highlight-foreground" as any]: tokens.highlightForeground,
    ["--ring" as any]: tokens.primary,
  } as React.CSSProperties;

  return (
    <SiteLayout>
      <Seo
        title={`${partner.name} | ইউনাইট ফাউন্ডেশনের সহযোগী প্রতিষ্ঠান`}
        description={partner.tagline}
        canonical={`/partners/${partner.slug}`}
      />

      <div className="bg-background" style={themeStyle}>
        {/* ===== Branded Hero ===== */}
        <section className="relative overflow-hidden bg-primary text-primary-foreground pt-28 md:pt-32 pb-20 md:pb-28">
          {/* Decorative arabesque pattern */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Gold glow */}
          <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-[hsl(var(--donate-highlight))] opacity-20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-[420px] h-[420px] rounded-full bg-[hsl(var(--donate-highlight))] opacity-10 blur-3xl pointer-events-none" />

          <div className="container-page relative">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-[hsl(var(--donate-highlight))] transition-colors mb-10"
            >
              <ArrowLeft className="h-4 w-4" /> হোমে ফিরে যান
            </Link>

            <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
              {/* Logo with gold ring */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-[hsl(var(--donate-highlight))] blur-2xl opacity-40 scale-110" />
                <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-full p-[3px] bg-gradient-to-br from-[hsl(var(--donate-highlight))] via-[hsl(var(--donate-highlight))]/60 to-[hsl(var(--donate-highlight))]">
                  <div className="w-full h-full rounded-full bg-primary p-3 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-card/95 flex items-center justify-center overflow-hidden shadow-inner">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="w-[78%] h-[78%] object-contain"
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[hsl(var(--donate-highlight))] text-primary p-2 rounded-full shadow-lg ring-4 ring-primary">
                  <BadgeCheck className="w-5 h-5" />
                </div>
              </div>

              {/* Name & tagline */}
              <div className="text-center md:text-left flex-1">
                <span className="inline-flex items-center gap-2 bg-[hsl(var(--donate-highlight))]/15 text-[hsl(var(--donate-highlight))] border border-[hsl(var(--donate-highlight))]/30 px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.18em] uppercase mb-4">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  সহযোগী প্রতিষ্ঠান
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-[1.05] tracking-tight">
                  {partner.name}
                </h1>
                <p className="text-lg md:text-xl text-primary-foreground/85 font-medium max-w-2xl">
                  {partner.tagline}
                </p>

                {partner.website && (
                  <div className="mt-7 flex justify-center md:justify-start gap-3">
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-donate inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
                    >
                      ওয়েবসাইট ভিজিট করুন <ArrowUpRight className="w-4 h-4" />
                    </a>
                    {partner.phone && (
                      <a
                        href={`tel:${partner.phone}`}
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-card/10 hover:bg-card/15 text-primary-foreground border border-white/20 rounded-xl font-semibold backdrop-blur-sm transition-all"
                      >
                        <Phone className="w-4 h-4" /> যোগাযোগ
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom wave separator */}
          <svg className="absolute bottom-0 left-0 w-full h-12 text-background" viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path d="M0,30 C360,60 720,0 1440,40 L1440,60 L0,60 Z" fill="currentColor" />
          </svg>
        </section>

        {/* ===== Main grid ===== */}
        <section className="pt-16 md:pt-20 pb-20 md:pb-28">
          <div className="container-page grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Left content */}
            <div className="lg:col-span-8 space-y-12">
              {/* About */}
              <section>
                <SectionHeading>সংক্ষিপ্ত বর্ণনা</SectionHeading>
                <p className="text-lg text-foreground/80 leading-relaxed">
                  {partner.description}
                </p>
              </section>

              {/* Goal */}
              {partner.goal && (
                <section className="relative overflow-hidden p-7 md:p-9 rounded-2xl bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-xl">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[hsl(var(--donate-highlight))]/15 rounded-full blur-3xl" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 border border-[hsl(var(--donate-highlight))]/20 rounded-full" />
                  <div className="relative flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--donate-highlight))] text-primary flex items-center justify-center shrink-0 shadow-lg">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] font-bold text-[hsl(var(--donate-highlight))] mb-2">
                        আমাদের লক্ষ্য
                      </div>
                      <p className="text-lg md:text-xl font-semibold leading-snug">
                        {partner.goal}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Programs */}
              {partner.programs && partner.programs.length > 0 && (
                <section>
                  <SectionHeading>প্রশিক্ষণ ও প্রোগ্রাম</SectionHeading>
                  <div className="space-y-6">
                    {partner.programs.map((g, i) => (
                      <div
                        key={i}
                        className="group bg-card rounded-2xl border border-border hover:border-[hsl(var(--donate-highlight))]/60 p-6 md:p-7 shadow-sm hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center gap-4 mb-5 pb-4 border-b border-dashed border-border">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center shadow-md">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-[hsl(var(--donate-highlight))]">
                              ক্যাটাগরি {String(i + 1).padStart(2, "0")}
                            </div>
                            <h3 className="text-lg font-bold text-primary">{g.category}</h3>
                          </div>
                        </div>
                        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                          {g.items.map((it, j) => (
                            <li key={j} className="flex items-start gap-3 text-foreground/80 leading-relaxed">
                              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                              <span className="text-[15px]">{it}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Activities */}
              {partner.activities?.length > 0 && (
                <section>
                  <SectionHeading>কার্যক্রম ও সেবা</SectionHeading>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {partner.activities.map((a, i) => (
                      <div
                        key={i}
                        className="group relative p-6 bg-card rounded-2xl border border-border hover:border-primary/40 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[hsl(var(--donate-highlight))]/0 group-hover:bg-[hsl(var(--donate-highlight))]/10 rounded-full blur-2xl transition-all" />
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-[hsl(var(--donate-highlight))]/20 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:from-primary group-hover:to-primary group-hover:text-primary-foreground transition-all">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-bold text-primary mb-2">{a.title}</h3>
                          <p className="text-sm text-foreground/65 leading-relaxed">{a.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                {/* Facts card */}
                <div className="relative bg-gradient-to-br from-primary via-primary to-primary/85 rounded-3xl p-8 text-primary-foreground shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[hsl(var(--donate-highlight))]/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-16 -left-16 w-40 h-40 border-2 border-[hsl(var(--donate-highlight))]/15 rounded-full" />
                  <div className="absolute bottom-8 left-6 w-20 h-20 border border-[hsl(var(--donate-highlight))]/20 rounded-full" />

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="w-8 h-[2px] bg-[hsl(var(--donate-highlight))]" />
                      <span className="text-xs uppercase tracking-[0.2em] font-bold text-[hsl(var(--donate-highlight))]">প্রোফাইল</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-7">এক নজরে</h2>
                    <dl className="space-y-5">
                      <Row label="প্রতিষ্ঠাকাল" value={year} />
                      {partner.license && <Row label="লাইসেন্স" value={partner.license} mono />}
                      {partner.phone && <Row label="যোগাযোগ" value={partner.phone} mono />}
                      {partner.address && <Row label="ঠিকানা" value={partner.address} />}
                      <Row label="অভিভাবক" value="ইউনাইট ফাউন্ডেশন" highlight />
                    </dl>

                    <div className="mt-8 pt-6 border-t border-white/10">
                      <p className="text-sm text-primary-foreground/75 mb-5 italic leading-relaxed">
                        "সুন্নাহর অনুসরণে, মানবতার কল্যাণে — ইউনাইট ফাউন্ডেশনের গর্বিত অঙ্গপ্রতিষ্ঠান।"
                      </p>
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-donate flex items-center justify-center gap-2 py-3.5 font-bold rounded-xl transition-all shadow-lg"
                        >
                          ওয়েবসাইট ভিজিট করুন <ArrowUpRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact card */}
                <div className="p-6 border border-border rounded-3xl bg-card shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="w-6 h-[2px] bg-[hsl(var(--donate-highlight))]" />
                    <h3 className="font-bold text-primary">যোগাযোগ মাধ্যম</h3>
                  </div>
                  <ul className="space-y-3.5 text-sm text-foreground/75">
                    {partner.phone && (
                      <li className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4" />
                        </span>
                        <a href={`tel:${partner.phone}`} dir="ltr" className="hover:text-primary font-medium">{partner.phone}</a>
                      </li>
                    )}
                    {partner.address && (
                      <li className="flex items-start gap-3">
                        <span className="w-9 h-9 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </span>
                        <span className="pt-1.5">{partner.address}</span>
                      </li>
                    )}
                    {partner.website && (
                      <li className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0">
                          <Globe2 className="w-4 h-4" />
                        </span>
                        <a href={partner.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate font-medium">
                          {partner.website.replace(/^https?:\/\//, "")}
                        </a>
                      </li>
                    )}
                    <li className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </span>
                      <a href="mailto:contact@unitefoundation.bd" className="hover:text-primary font-medium">contact@unitefoundation.bd</a>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Related partners */}
        {others.length > 0 && (
          <section className="pb-24 md:pb-32">
            <div className="container-page">
              <div className="flex items-end justify-between mb-8 border-t border-border pt-12">
                <h2 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-3">
                  <span className="w-8 h-[2px] bg-[hsl(var(--donate-highlight))]" />
                  অন্যান্য প্রতিষ্ঠান
                </h2>
                <Link to="/" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
                  সবগুলো দেখুন <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {others.map((p) => (
                  <Link
                    key={p.slug}
                    to={`/partners/${p.slug}`}
                    className="group flex items-center gap-5 p-5 bg-card rounded-2xl border border-border hover:border-[hsl(var(--donate-highlight))] transition-all shadow-sm hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                        <img src={p.logo} alt={p.name} className="w-[78%] h-[78%] object-contain" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-primary truncate group-hover:text-primary/90">{p.name}</div>
                      <p className="mt-1 text-sm text-foreground/65 line-clamp-2">{p.tagline}</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-primary/60 group-hover:text-[hsl(var(--donate-highlight))] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </SiteLayout>
  );
};

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-7">
    <div className="flex items-center gap-3 mb-2">
      <span className="w-10 h-[3px] bg-[hsl(var(--donate-highlight))] rounded-full" />
      <span className="text-[11px] uppercase tracking-[0.22em] font-bold text-[hsl(var(--donate-highlight))]">Unite Foundation</span>
    </div>
    <h2 className="text-2xl md:text-3xl font-bold text-primary">{children}</h2>
  </div>
);

const Row = ({ label, value, highlight, mono }: { label: string; value: string; highlight?: boolean; mono?: boolean }) => (
  <div className="flex justify-between items-start gap-4 border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
    <dt className="text-primary-foreground/60 text-sm">{label}</dt>
    <dd className={
      "font-bold text-right " +
      (highlight ? "text-[hsl(var(--donate-highlight))]" : "") +
      (mono ? " font-mono text-sm" : "")
    } dir={mono ? "ltr" : undefined}>{value}</dd>
  </div>
);

export default PartnerDetail;
