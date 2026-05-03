import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { posts } from "@/data/blog";
import { toBnNum } from "@/data/projects";

const Blog = () => {
  return (
    <SiteLayout>
      <Seo title="ব্লগ ও আপডেট | ইউনাইট ফাউন্ডেশন" description="ফাউন্ডেশনের সর্বশেষ ক্যাম্পেইন, ফিল্ড রিপোর্ট ও স্বচ্ছতা প্রতিবেদন।" canonical="/blog" />

      <section className="bg-secondary/40 pt-14 pb-10 md:pt-20 md:pb-14">
        <div className="container-page">
          <span className="eyebrow">ব্লগ ও আপডেট</span>
          <h1 className="heading-display mt-3 max-w-2xl">খবর, প্রতিবেদন ও মাঠের গল্প</h1>
          <p className="mt-4 text-muted-foreground max-w-xl">
            আমাদের প্রতিটি ক্যাম্পেইনের অগ্রগতি, ফিল্ড রিপোর্ট এবং স্বচ্ছতা প্রতিবেদন।
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-page grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {posts.map((p) => (
            <article key={p.slug} className="card-base flex flex-col">
              <Link to={`/blog/${p.slug}`} className="block aspect-[16/10] overflow-hidden">
                <img src={p.cover} alt={p.title} loading="lazy" width={900} height={600} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              </Link>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="px-2 py-1 rounded bg-accent text-accent-foreground font-semibold">{p.category}</span>
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{p.date}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{toBnNum(p.readMin)} মিনিট</span>
                </div>
                <h2 className="mt-3 text-lg font-bold leading-snug line-clamp-2 hover:text-primary transition-colors">
                  <Link to={`/blog/${p.slug}`}>{p.title}</Link>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{p.excerpt}</p>
                <Link to={`/blog/${p.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-primary font-semibold text-sm hover:gap-2.5 transition-all">
                  পড়ুন <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Blog;
