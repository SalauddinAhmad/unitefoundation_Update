import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePostsPublic } from "@/hooks/api/usePublic";
import { useLocaleNum } from "@/hooks/useLocaleNum";
import { motion } from "framer-motion";

export const BlogSection = () => {
  const { t } = useTranslation();
  const { fmt } = useLocaleNum();
  const { data: posts = [] } = usePostsPublic();
  const latest = posts.slice(0, 3);

  return (
    <section className="section-y relative overflow-hidden bg-secondary/30">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container-page relative z-10">
        <div className="flex flex-col items-center text-center gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <span className="eyebrow bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block">
              {t("blogHome.eyebrow")}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4 leading-tight text-foreground max-w-2xl">
              {t("blogHome.heading")}
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link 
              to="/blog" 
              className="group hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-background border border-primary/20 text-primary font-bold hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
            >
              {t("blogHome.allPosts")} 
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {latest.map((p, idx) => (
            <motion.article 
              key={p.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group flex flex-col bg-background rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50"
            >
              <Link to={`/blog/${p.slug}`} className="relative block aspect-[16/10] overflow-hidden">
                <img 
                  src={p.cover} 
                  alt={p.title} 
                  loading="lazy" 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-sm text-primary text-xs font-bold shadow-sm">
                    {p.category}
                  </span>
                </div>
              </Link>

              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-[11px] md:text-xs text-muted-foreground font-medium mb-4">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary/70" />
                    {p.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-primary/70" />
                    {fmt(p.views ?? 0)}
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-bold leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2">
                  <Link to={`/blog/${p.slug}`}>{p.title}</Link>
                </h3>
                
                <p className="mt-4 text-sm text-muted-foreground/80 line-clamp-2 flex-1 leading-relaxed">
                  {p.excerpt}
                </p>

                <div className="mt-6 pt-6 border-t border-border/50">
                  <Link 
                    to={`/blog/${p.slug}`} 
                    className="inline-flex items-center gap-2 text-primary font-bold text-sm group/btn"
                  >
                    <span className="relative overflow-hidden inline-block">
                      <span className="inline-block transition-transform duration-300 group-hover/btn:-translate-y-full">
                        {t("common.read")}
                      </span>
                      <span className="absolute top-full left-0 inline-block transition-transform duration-300 group-hover/btn:-translate-y-full">
                        {t("common.read")}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-10 md:hidden flex justify-center">
          <Link 
            to="/blog" 
            className="w-full text-center py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform"
          >
            {t("blogHome.allPosts")}
          </Link>
        </div>
      </div>
    </section>
  );
};
