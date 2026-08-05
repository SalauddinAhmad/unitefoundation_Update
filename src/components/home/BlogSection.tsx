import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePostsPublic } from "@/hooks/api/usePublic";
import { useLocaleNum } from "@/hooks/useLocaleNum";
import { motion } from "framer-motion";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export const BlogSection = () => {
  const { t } = useTranslation();
  const { fmt } = useLocaleNum();
  const { data: posts = [] } = usePostsPublic();
  const latest = posts.slice(0, 6);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    loop: true,
    skipSnaps: false,
    dragFree: true,
    breakpoints: {
      '(min-width: 1024px)': { dragFree: false }
    }
  }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback((emblaApi: any) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="py-12 md:py-16 relative overflow-hidden bg-secondary/30">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container-page relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center md:items-start text-center md:text-left"
          >
            <span className="eyebrow bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block">
              {t("blogHome.eyebrow")}
            </span>
            {t("blogHome.heading") && (
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mt-2 leading-tight text-foreground max-w-2xl">
                {t("blogHome.heading")}
              </h2>
            )}
          </motion.div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 border-primary/20 hover:bg-primary hover:text-white transition-all disabled:opacity-30"
              onClick={scrollPrev}
              disabled={prevBtnDisabled}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 border-primary/20 hover:bg-primary hover:text-white transition-all disabled:opacity-30"
              onClick={scrollNext}
              disabled={nextBtnDisabled}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y -ml-4">
            {latest.map((p, idx) => (
              <motion.div 
                key={p.slug}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex-[0_0_85%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4 pb-4"
              >
                <article className="group h-full flex flex-col bg-background rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50">
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

                  <div className="p-5 md:p-6 flex-1 flex flex-col">
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

                    <div className="mt-4 pt-4 border-t border-border/50">
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
                </article>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Styled "View All" Button at the bottom */}
        <div className="mt-8 md:mt-10 flex justify-center">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 gradient-donate-bg text-white font-semibold px-7 py-3 rounded-btn shadow-donate hover:shadow-donate-hover group transition-all"
          >
            {t("blogHome.allPosts")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};
