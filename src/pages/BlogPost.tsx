import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Heart, Facebook, Linkedin, Twitter, Users } from "lucide-react";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { getPost, posts } from "@/data/blog";
import { toBnNum } from "@/data/projects";
import NotFound from "./NotFound";

const BlogPost = () => {
  const { slug = "" } = useParams();
  const post = getPost(slug);
  if (!post) return <NotFound />;

  const related = posts.filter((p) => p.slug !== slug).slice(0, 3);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareLinks = [
    { Icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, label: "Facebook" },
    { Icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, label: "LinkedIn" },
    { Icon: Twitter, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`, label: "Twitter" },
  ];

  return (
    <SiteLayout>
      <Seo title={`${post.title} | ব্লগ`} description={post.excerpt} canonical={`/blog/${post.slug}`} />

      {/* Hero header */}
      <PageHero
        image={post.cover}
        eyebrow={post.category || post.date}
        title={post.title}
        height="h-[340px] md:h-[440px]"
      >
        <Link
          to="/blog"
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-primary-foreground/85 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> সব পোস্ট
        </Link>
        <span className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary-foreground/85">
          <Calendar className="h-4 w-4" /> {post.date}
        </span>
      </PageHero>

      {/* Content + sidebar */}
      <section className="py-12 md:py-16">
        <div className="container-page grid lg:grid-cols-[1fr_320px] gap-10 md:gap-14">
          {/* Article */}
          <article>
            <p className="text-lg text-muted-foreground leading-relaxed border-l-4 border-primary pl-5">{post.excerpt}</p>

            <div className="prose-bn mt-10 space-y-6">
              {post.body.map((para, i) => (
                <p key={i} className="text-foreground leading-[1.95] text-[17px]">{para}</p>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{toBnNum(post.readMin)} মিনিট পড়ুন</span>
              <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground font-semibold text-xs">{post.category}</span>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-28 self-start">
            {/* Share */}
            <div className="rounded-card bg-accent/40 border border-border p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-foreground">শেয়ার করুন</span>
                <div className="flex gap-2">
                  {shareLinks.map(({ Icon, href, label }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform">
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-card bg-primary text-primary-foreground p-7 text-center shadow-card">
              <h3 className="text-2xl font-bold leading-snug">আসুন একসাথে পরিবর্তন আনি</h3>
              <p className="mt-2 text-primary-foreground/80 text-sm">আপনার দান আমাদের কাজের মূল চালিকাশক্তি।</p>
              <Link to="/donate" className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-donate-highlight text-donate-highlight-foreground font-bold px-5 py-3 hover:brightness-105 transition">
                <Heart className="h-4 w-4" /> দান করুন
              </Link>
              <Link to="/donate?type=volunteer" className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-foreground font-bold px-5 py-3 hover:bg-white/90 transition">
                <Users className="h-4 w-4" /> স্বেচ্ছাসেবক হোন
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Related */}
      <section className="py-14 md:py-20 bg-secondary/40 border-t border-border">
        <div className="container-page">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">আরও পড়ুন</h2>
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
