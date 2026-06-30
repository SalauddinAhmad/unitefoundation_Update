import { useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowLeft, ArrowUpRight, BadgeCheck, Calendar, Globe2, Phone, MapPin,
  Target, BookOpen, CheckCircle2, Sparkles, Mail,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Seo } from "@/components/Seo";
import { getPartner, partners } from "@/data/partners";

const PartnerDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const partner = slug ? getPartner(slug) : undefined;

  if (!partner) return <Navigate to="/" replace />;

  const others = partners.filter((p) => p.slug !== partner.slug);
  const year = partner.established?.match(/\d{4}|[০-৯]{4}/)?.[0] || "—";

  return (
    <SiteLayout>
      <Seo
        title={`${partner.name} | ইউনাইট ফাউন্ডেশনের সহযোগী প্রতিষ্ঠান`}
        description={partner.tagline}
        canonical={`/partners/${partner.slug}`}
      />

      <div className="bg-[#fcfaf2]">
        {/* Hero */}
        <section className="relative pt-28 md:pt-32 pb-12 md:pb-16">
          <div className="container-page">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10"
            >
              <ArrowLeft className="h-4 w-4" /> হোমে ফিরে যান
            </Link>

            <div className="flex flex-col md:flex-row items-center md:items-end gap-8 border-b border-[#e2dfd5] pb-12">
              {/* Logo */}
              <div className="relative shrink-0">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-2 border-[hsl(var(--donate-highlight))] p-2 bg-white flex items-center justify-center shadow-xl">
                  <div className="w-full h-full rounded-full bg-primary flex items-center justify-center overflow-hidden">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-[78%] h-[78%] object-contain"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[hsl(var(--donate-highlight))] text-white p-2 rounded-full shadow-md">
                  <BadgeCheck className="w-5 h-5" />
                </div>
              </div>

              {/* Name & tagline */}
              <div className="text-center md:text-left flex-1">
                <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-semibold tracking-wide mb-3">
                  সহযোগী প্রতিষ্ঠান
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary mb-3 leading-tight">
                  {partner.name}
                </h1>
                <p className="text-lg md:text-xl text-[hsl(var(--donate-highlight))] font-medium">
                  {partner.tagline}
                </p>
              </div>

              {/* CTA */}
              {partner.website && (
                <div className="flex gap-3">
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-7 py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg hover:bg-primary/90 transition-all hover:-translate-y-0.5"
                  >
                    ভিজিট করুন <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main grid */}
        <section className="pb-20 md:pb-28">
          <div className="container-page grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Left content */}
            <div className="lg:col-span-8 space-y-12">
              {/* About */}
              <section>
                <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
                  <span className="w-8 h-[2px] bg-[hsl(var(--donate-highlight))]" />
                  সংক্ষিপ্ত বর্ণনা
                </h2>
                <p className="text-lg text-foreground/80 leading-relaxed">
                  {partner.description}
                </p>
              </section>

              {/* Goal */}
              {partner.goal && (
                <section className="relative p-7 md:p-8 rounded-2xl border-l-4 border-[hsl(var(--donate-highlight))] bg-white shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] font-bold text-[hsl(var(--donate-highlight))] mb-1.5">
                        আমাদের লক্ষ্য
                      </div>
                      <p className="text-lg font-semibold text-primary leading-snug">
                        {partner.goal}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Programs (categorized) */}
              {partner.programs && partner.programs.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-[hsl(var(--donate-highlight))]" />
                    প্রশিক্ষণ ও প্রোগ্রাম
                  </h2>
                  <div className="space-y-6">
                    {partner.programs.map((g, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-[#e2dfd5] p-6 md:p-7 shadow-sm">
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#e2dfd5]">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-bold text-primary">{g.category}</h3>
                        </div>
                        <ul className="grid sm:grid-cols-2 gap-3">
                          {g.items.map((it, j) => (
                            <li key={j} className="flex items-start gap-3 text-foreground/80 leading-relaxed">
                              <CheckCircle2 className="w-5 h-5 text-[hsl(var(--donate-highlight))] mt-0.5 shrink-0" />
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
                  <h2 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-[hsl(var(--donate-highlight))]" />
                    কার্যক্রম ও সেবা
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {partner.activities.map((a, i) => (
                      <div
                        key={i}
                        className="group p-6 bg-white rounded-2xl border border-[#e2dfd5] hover:border-[hsl(var(--donate-highlight))] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                      >
                        <div className="w-12 h-12 bg-[#fcfaf2] text-[hsl(var(--donate-highlight))] rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-primary mb-2">{a.title}</h3>
                        <p className="text-sm text-foreground/65 leading-relaxed">{a.detail}</p>
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
                <div className="bg-primary rounded-3xl p-8 text-primary-foreground shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                    <svg width="220" height="220" viewBox="0 0 100 100">
                      <circle cx="100" cy="0" r="80" fill="currentColor" />
                    </svg>
                  </div>

                  <h2 className="text-2xl font-bold mb-7 relative z-10">এক নজরে</h2>
                  <dl className="space-y-5 relative z-10">
                    <Row label="প্রতিষ্ঠাকাল" value={year} />
                    {partner.license && <Row label="লাইসেন্স" value={partner.license} mono />}
                    {partner.phone && (
                      <Row label="যোগাযোগ" value={partner.phone} mono />
                    )}
                    {partner.address && <Row label="ঠিকানা" value={partner.address} />}
                    <Row
                      label="অভিভাবক"
                      value="ইউনাইট ফাউন্ডেশন"
                      highlight
                    />
                  </dl>

                  <div className="mt-9 relative z-10">
                    <p className="text-sm text-primary-foreground/70 mb-4 italic">
                      "সুন্নাহর অনুসরণে, মানবতার কল্যাণে — ইউনাইট ফাউন্ডেশনের গর্বিত অঙ্গপ্রতিষ্ঠান।"
                    </p>
                    {partner.website && (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center py-3 bg-[hsl(var(--donate-highlight))] hover:opacity-90 text-primary font-bold rounded-xl transition-colors"
                      >
                        ওয়েবসাইট ভিজিট করুন
                      </a>
                    )}
                  </div>
                </div>

                {/* Contact card */}
                <div className="p-6 border border-[#e2dfd5] rounded-3xl bg-white shadow-sm">
                  <h3 className="font-bold text-primary mb-4">যোগাযোগ</h3>
                  <ul className="space-y-3 text-sm text-foreground/70">
                    {partner.phone && (
                      <li className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-[hsl(var(--donate-highlight))]" />
                        <a href={`tel:${partner.phone}`} dir="ltr" className="hover:text-primary">{partner.phone}</a>
                      </li>
                    )}
                    {partner.address && (
                      <li className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[hsl(var(--donate-highlight))] mt-0.5" />
                        <span>{partner.address}</span>
                      </li>
                    )}
                    {partner.website && (
                      <li className="flex items-center gap-2.5">
                        <Globe2 className="w-4 h-4 text-[hsl(var(--donate-highlight))]" />
                        <a href={partner.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">
                          {partner.website.replace(/^https?:\/\//, "")}
                        </a>
                      </li>
                    )}
                    <li className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-[hsl(var(--donate-highlight))]" />
                      <a href="mailto:contact@unitefoundation.bd" className="hover:text-primary">contact@unitefoundation.bd</a>
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
              <div className="flex items-end justify-between mb-8 border-t border-[#e2dfd5] pt-12">
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
                    className="group flex items-center gap-5 p-5 bg-white rounded-2xl border border-[#e2dfd5] hover:border-[hsl(var(--donate-highlight))] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/5 border border-[#e2dfd5] flex items-center justify-center shrink-0 overflow-hidden">
                      <img src={p.logo} alt={p.name} className="w-[78%] h-[78%] object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-primary truncate">{p.name}</div>
                      <p className="mt-1 text-sm text-foreground/65 line-clamp-2">{p.tagline}</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-primary/60 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
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
