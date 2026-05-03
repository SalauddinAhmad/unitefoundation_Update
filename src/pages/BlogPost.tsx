import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Heart } from "lucide-react";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { getPost, posts } from "@/data/blog";
import { toBnNum } from "@/data/projects";
import NotFound from "./NotFound";

const BlogPost = () => {
  const { slug = "" } = useParams();
  const post = getPost(slug);
  if (!post) return <NotFound />;

  const related = posts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <SiteLayout>
      <Seo title={`${post.title} | ব্লগ`} description={post.excerpt} canonical={`/blog/${post.slug}`} />

      <section className="bg-secondary/40 py-8">
        <div className="container-page">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> সব পোস্ট
          </Link>
        </div>
      </section>

      <article className="py-10 md:py-14">
        <div className="container-page max-w-3xl">
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span className="px-2 py-1 rounded bg-accent text-accent-foreground font-semibold">{post.category}</span>
            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{post.date}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{toBnNum(post.readMin)} মিনিট</span>
          </div>
          <h1 className="mt-4 text-3xl md:text-5xl font-extrabold leading-[1.15]">{post.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
          <div className="mt-8 rounded-card overflow-hidden shadow-card">
            <img src={post.cover} alt={post.title} width={1200} height={800} className="w-full h-auto" />
          </div>
          <div className="prose-bn mt-10 space-y-5">
            {post.body.map((para, i) => (
              <p key={i} className="text-foreground leading-[1.95] text-[17px]">{para}</p>
            ))}
          </div>

          <div className="mt-12 rounded-card gradient-donate-bg p-6 md:p-8 text-white text-center">
            <h3 className="text-2xl font-bold">এই কাজগুলো চালিয়ে যেতে আপনার দান প্রয়োজন</h3>
            <p className="mt-2 text-white/90">আপনার সমর্থনই আমাদের পরিবর্তনের মূল চালিকাশক্তি।</p>
            <Link to="/donate" className="mt-5 inline-flex items-center gap-2 rounded-btn bg-white text-foreground font-bold px-6 py-3 hover:bg-white/90 transition-colors">
              <Heart className="h-5 w-5 text-donate-red" /> এখনই দান করুন
            </Link>
          </div>
        </div>
      </article>

      <section className="section-y bg-secondary/40">
        <div className="container-page max-w-5xl">
          <h2 className="text-2xl font-bold mb-8">আরও পড়ুন</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((p) => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="card-base block">
                <img src={p.cover} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
                <div className="p-5">
                  <div className="text-xs text-muted-foreground">{p.date}</div>
                  <h3 className="mt-1.5 font-bold line-clamp-2 hover:text-primary transition-colors">{p.title}</h3>
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
