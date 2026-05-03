import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { posts } from "@/data/blog";
import { toBnNum } from "@/data/projects";

export const BlogSection = () => {
  const latest = posts.slice(0, 3);
  return (
    <section className="section-y bg-secondary/40">
      <div className="container-page">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <span className="eyebrow">সর্বশেষ আপডেট</span>
            <h2 className="heading-display mt-3 max-w-xl">খবর, প্রতিবেদন ও ক্যাম্পেইন</h2>
          </div>
          <Link to="/blog" className="hidden md:inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
            সব পোস্ট <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {latest.map((p) => (
            <article key={p.slug} className="card-base flex flex-col">
              <Link to={`/blog/${p.slug}`} className="block aspect-[16/10] overflow-hidden">
                <img src={p.cover} alt={p.title} loading="lazy" width={900} height={600} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              </Link>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded bg-accent text-accent-foreground font-semibold">{p.category}</span>
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{p.date}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{toBnNum(p.readMin)} মিনিট</span>
                </div>
                <h3 className="mt-3 text-lg font-bold leading-snug line-clamp-2 hover:text-primary transition-colors">
                  <Link to={`/blog/${p.slug}`}>{p.title}</Link>
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{p.excerpt}</p>
                <Link to={`/blog/${p.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-primary font-semibold text-sm hover:gap-2.5 transition-all">
                  পড়ুন <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
