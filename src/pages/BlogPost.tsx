import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Eye, Heart, Facebook, Linkedin, Twitter, Users, Quote, Info, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { type ContentBlock } from "@/data/blog";
import { toBnNum } from "@/data/projects";
import { usePostPublic, usePostsPublic, useIncrementPostView } from "@/hooks/api/usePublic";
import NotFound from "./NotFound";

const normalize = (b: string | ContentBlock): ContentBlock =>
  typeof b === "string" ? { type: "paragraph", text: b } : b;

const Block = ({ block }: { block: ContentBlock }) => {
  const commonBn = "font-['Bornomala_BN',_sans-serif]";
  switch (block.type) {
    case "paragraph":
      return block.lead ? (
        <p className={`text-xl md:text-2xl font-semibold text-foreground leading-[1.7] tracking-tight ${commonBn}`}>
          {block.text}
        </p>
      ) : (
        <p className={`text-foreground/90 leading-[1.95] text-[17px] ${commonBn}`}>{block.text}</p>
      );
    case "heading": {
      const Tag = (block.level === 3 ? "h3" : "h2") as "h2" | "h3";
      return (
        <Tag className={`${block.level === 3 ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"} font-bold text-foreground mt-4 flex items-center gap-3 ${commonBn}`}>
          <span className="h-7 w-1.5 rounded-full bg-primary shrink-0" />
          {block.text}
        </Tag>
      );
    }
    case "image":
      return (
        <figure className={`my-4 ${block.float === "left" ? "md:float-left md:mr-6 md:mb-3 md:w-1/2" : block.float === "right" ? "md:float-right md:ml-6 md:mb-3 md:w-1/2" : ""}`}>
          <div className="overflow-hidden rounded-card shadow-card ring-1 ring-border">
            <img src={block.src} alt={block.alt || block.caption || ""} loading="lazy" className="w-full h-auto object-cover" />
          </div>
          {block.caption && (
            <figcaption className="mt-3 text-center text-sm text-muted-foreground italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "gallery":
      return (
        <div className="my-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {block.images.map((im, i) => (
            <div key={i} className="overflow-hidden rounded-card ring-1 ring-border">
              <img src={im.src} alt={im.alt || ""} loading="lazy" className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      );
    case "quote":
      return (
        <blockquote className="relative my-4 rounded-card bg-gradient-to-br from-primary/8 via-accent/40 to-transparent border-l-4 border-primary p-7 md:p-8">
          <Quote className="absolute -top-3 left-6 h-8 w-8 text-primary bg-background rounded-full p-1.5 ring-1 ring-border" />
          <p className={`text-lg md:text-xl font-semibold text-foreground leading-relaxed ${commonBn}`}>"{block.text}"</p>
          {block.author && <footer className="mt-3 text-sm text-muted-foreground">— {block.author}</footer>}
        </blockquote>
      );
    case "callout": {
      const map = {
        info: { Icon: Info, cls: "bg-primary/10 border-primary/30 text-primary" },
        success: { Icon: CheckCircle2, cls: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400" },
        warn: { Icon: AlertTriangle, cls: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400" },
      } as const;
      const { Icon, cls } = map[block.variant || "info"];
      return (
        <div className={`my-4 rounded-card border-l-4 p-5 flex gap-4 ${cls}`}>
          <Icon className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            {block.title && <div className="font-bold text-foreground mb-1">{block.title}</div>}
            <p className="text-foreground/90 text-[15px] leading-relaxed">{block.text}</p>
          </div>
        </div>
      );
    }
    case "list": {
      const Tag = (block.ordered ? "ol" : "ul") as "ul" | "ol";
      return (
        <Tag className={`my-2 space-y-2.5 ${block.ordered ? "list-decimal" : ""} pl-1`}>
          {block.items.map((it, i) => (
            <li key={i} className={`flex items-start gap-3 text-foreground/90 leading-relaxed text-[16px] ${commonBn}`}>
              {!block.ordered && <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />}
              <span>{it}</span>
            </li>
          ))}
        </Tag>
      );
    }
    case "stats":
      return (
        <div className="my-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {block.items.map((s, i) => (
            <div key={i} className="rounded-card border border-border bg-card p-5 text-center shadow-sm hover:shadow-card transition-shadow">
              <div className="text-2xl md:text-3xl font-extrabold text-primary">{s.value}</div>
              <div className="mt-1 text-xs md:text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      );
    case "cta":
      return (
        <div className="my-6 rounded-card bg-primary text-primary-foreground p-8 text-center shadow-card-hover">
          <h3 className="text-2xl md:text-3xl font-bold">{block.title}</h3>
          {block.text && <p className="mt-2 text-primary-foreground/85">{block.text}</p>}
          <Link to={block.href} className="mt-5 inline-flex items-center gap-2 rounded-full bg-donate-highlight text-donate-highlight-foreground font-bold px-7 py-3 hover:brightness-105 transition">
            <Heart className="h-4 w-4" /> {block.buttonLabel}
          </Link>
        </div>
      );
    case "divider":
      return <hr className="my-6 border-border" />;
  }
};

const BlogPost = () => {
  const { t } = useTranslation();
  const { slug = "" } = useParams();
  const { data: post, isLoading } = usePostPublic(slug);
  const { data: allPosts = [] } = usePostsPublic();
  const incrementView = useIncrementPostView();
  const [liveViews, setLiveViews] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    incrementView.mutate(slug, {
      onSuccess: (d) => {
        if (d && typeof d.views === "number") setLiveViews(d.views);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (isLoading) return (
    <SiteLayout>
      <div className="py-32 flex justify-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
    </SiteLayout>
  );
  if (!post) return <NotFound />;

  const views = liveViews ?? post.views ?? 0;

  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 3);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareLinks = [
    { Icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, label: "Facebook" },
    { Icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, label: "LinkedIn" },
    { Icon: Twitter, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`, label: "Twitter" },
  ];

  // post may have `html` (rich-text editor output) OR `body` (ContentBlock array)
  const hasHtml = "html" in post && !!(post as any).html;

  return (
    <SiteLayout>
      <Seo title={`${post.title} | ব্লগ`} description={post.excerpt} canonical={`/blog/${post.slug}`} />

      {/* Full-bleed banner */}
      <section className="relative w-full h-[52vh] min-h-[380px] md:min-h-[520px] overflow-hidden">
        <img src={post.banner || post.cover} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="container-page pb-10 md:pb-14">
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-foreground/80 hover:text-primary mb-4">
              <ArrowLeft className="h-4 w-4" /> {t("blogPost.allPosts")}
            </Link>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider">{post.category}</span>
              {(post as any).author && (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground" title="লেখক">
                  ✍️ {(post as any).author}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Calendar className="h-4 w-4" />{post.date}</span>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground" title="পঠিত সংখ্যা"><Eye className="h-4 w-4" />{toBnNum(views)} বার পঠিত</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight max-w-4xl font-['Bornomala_BN',_sans-serif]">{post.title}</h1>
          </div>
        </div>
      </section>

      {/* Content + sidebar */}
      <section className="py-10 md:py-14">
        <div className="container-page grid lg:grid-cols-[1fr_320px] gap-10 md:gap-14">
          <article>
            <p className="text-lg text-muted-foreground leading-relaxed border-l-4 border-primary pl-5 italic font-['Bornomala_BN',_sans-serif]">
              {post.excerpt}
            </p>

            {hasHtml ? (
              <div
                className="prose-bn mt-8 max-w-none [&_img]:rounded-card [&_img]:my-4 [&_h2]:mt-6 [&_h3]:mt-5 [&_p]:leading-[1.9] [&_p]:text-[17px] [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary [&_a]:underline [&_font[face*='Bornomala']]:font-['Bornomala_BN',_sans-serif] [&_font[face='var(--font-heading)']]:font-heading [&_font[face='var(--font-body)']]:font-sans [&_font[face*='SolaimanLipi']]:font-['SolaimanLipi',_sans-serif] [&_font[face*='AdorshoLipi']]:font-['AdorshoLipi',_sans-serif] [&_font[face*='Akaash']]:font-['Akaash',_sans-serif] [&_font[face*='Alinur']]:font-['Alinur',_sans-serif] [&_font[face*='Amiri']]:font-['Amiri',_serif] [&_font[face*='Scheherazade']]:font-['Scheherazade_New',_serif] [&_font[face*='Lateef']]:font-['Lateef',_serif] [&_font[face*='KFGQPC']]:font-['KFGQPC_Uthman_Taha_Naskh',_serif] [&_font[face*='Al-Quran']]:font-['Al-Quran_IndoPak',_serif] [&_font[face*='Noto_Kufi']]:font-['Noto_Kufi_Arabic',_sans-serif] [&_font[face='monospace']]:font-mono font-['Bornomala_BN',_sans-serif] [&_p[style*='Noto_Kufi']]:rtl [&_p[style*='Noto_Kufi']]:text-right"
                dangerouslySetInnerHTML={{ __html: (post as any).html }}
              />
            ) : (
              <div className="prose-bn mt-8 space-y-6">
                {post.body.map((raw, i) => (
                  <Block key={i} block={normalize(raw)} />
                ))}
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-border flex items-center justify-between gap-4 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground font-semibold text-xs">{post.category}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-1">{t("blogPost.share")}:</span>
                {shareLinks.map(({ Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="h-9 w-9 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground flex items-center justify-center transition-colors">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-28 self-start">
            <div className="rounded-card bg-accent/40 border border-border p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-foreground">{t("blogPost.shareCard")}</span>
                <div className="flex gap-2">
                  {shareLinks.map(({ Icon, href, label }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform">
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-card bg-primary text-primary-foreground p-7 text-center shadow-card">
              <h3 className="text-2xl font-bold leading-snug">{t("blogPost.ctaTitle")}</h3>
              <p className="mt-2 text-primary-foreground/80 text-sm">{t("blogPost.ctaSubtitle")}</p>
              <Link to="/donate" className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-donate-highlight text-donate-highlight-foreground font-bold px-5 py-3 hover:brightness-105 transition">
                <Heart className="h-4 w-4" /> {t("blogPost.donate")}
              </Link>
              <Link to="/donate?type=volunteer" className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-foreground font-bold px-5 py-3 hover:bg-white/90 transition">
                <Users className="h-4 w-4" /> {t("blogPost.volunteer")}
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Related */}
      <section className="py-14 md:py-20 bg-secondary/40 border-t border-border">
        <div className="container-page">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">{t("blogPost.related")}</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((p) => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="group bg-card rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-all border border-border block">
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={p.cover} alt="" loading="lazy" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-5">
                  <div className="text-xs text-muted-foreground">{p.date}</div>
                  <h3 className="mt-1.5 font-bold line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default BlogPost;
