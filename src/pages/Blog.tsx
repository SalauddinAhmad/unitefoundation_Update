import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Eye, Search, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { usePostsPublic } from "@/hooks/api/usePublic";
import { useSettings } from "@/hooks/api/useDashboardData";
import { toBnNum } from "@/data/projects";


const Blog = () => {
  const { t } = useTranslation();
  const { data: settings } = useSettings();
  const ALL = t("blogPage.all");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>(ALL);
  const { data: posts = [], isLoading } = usePostsPublic();

  const cats = useMemo(
    () => [ALL, ...Array.from(new Set(posts.map((p) => p.category)))],
    [posts, ALL]
  );
  const filtered = posts.filter(
    (p) =>
      (cat === ALL || p.category === cat) &&
      (q.trim() === "" || p.title.toLowerCase().includes(q.toLowerCase()) || p.excerpt.toLowerCase().includes(q.toLowerCase()))
  );

  const [featured, ...rest] = filtered;

  return (
    <SiteLayout>
      <Seo title={t("blogPage.seoTitle")} description={t("blogPage.seoDesc")} canonical="/blog" />

      <PageHero
        image={settings?.page_heroes?.blog || undefined}
        eyebrow={t("blogPage.eyebrow")}
        title={t("blogPage.title")}
        subtitle={t("blogPage.subtitle")}
      />

      {/* Search + filter bar */}
      <section className="py-8 md:py-10 border-b border-border bg-secondary/30">
        <div className="container-page flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("blogPage.searchPlaceholder")}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-card shadow-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  cat === c
                    ? "bg-accent text-primary border border-primary/20"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {isLoading && (
        <div className="py-16 flex justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {/* Featured */}
      {featured && (
        <section className="py-10 md:py-14">
          <div className="container-page">
            <Link
              to={`/blog/${featured.slug}`}
              className="group grid lg:grid-cols-2 gap-6 md:gap-10 items-stretch bg-card rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-all border border-border"
            >
              <div className="aspect-[16/11] lg:aspect-auto overflow-hidden">
                <img src={featured.cover} alt={featured.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6 md:p-10 flex flex-col justify-center">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary"><Calendar className="h-3.5 w-3.5" />{featured.date}</span>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground ml-3"><Eye className="h-3.5 w-3.5" />{toBnNum(featured.views ?? 0)} বার পঠিত</span>
                <h2 className="mt-3 text-2xl md:text-4xl font-extrabold leading-[1.2] group-hover:text-primary transition-colors">{featured.title}</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed line-clamp-3">{featured.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                  {t("blogPage.readMore")} <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="pb-16">
        <div className="container-page grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {rest.map((p) => (
            <Link
              key={p.slug}
              to={`/blog/${p.slug}`}
              className="group bg-card rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-all border border-border flex flex-col"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img src={p.cover} alt={p.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{p.date}</span>
                  <span className="inline-flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{toBnNum(p.views ?? 0)}</span>
                </div>
                <h3 className="mt-2 text-lg font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{p.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-primary font-semibold text-sm group-hover:gap-2.5 transition-all">
                  {t("blogPage.read")} <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Blog;
