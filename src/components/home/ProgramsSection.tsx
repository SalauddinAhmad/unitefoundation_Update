import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProjectCard } from "@/components/project/ProjectCard";
import { useProjectsPublic } from "@/hooks/api/usePublic";
import { motion } from "framer-motion";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export const ProgramsSection = () => {
  const { t } = useTranslation();
  const { data: projects = [] } = useProjectsPublic();

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    loop: true,
    skipSnaps: false,
    dragFree: true,
    breakpoints: {
      '(min-width: 1024px)': { dragFree: false }
    }
  }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);

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

  if (!projects.length) return null;

  return (
    <section className="py-12 md:py-16 relative overflow-hidden bg-secondary/40">
      {/* Decorative background elements to match BlogSection */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container-page relative z-10">
        <div className="flex flex-col items-center text-center gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <h2 className="text-xl md:text-2xl font-bold mt-2 leading-tight text-foreground max-w-2xl">
              {t("programs.heading")}
            </h2>
          </motion.div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y -ml-4">
            {projects.map((p, idx) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex-[0_0_85%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4 pb-4"
              >
                <ProjectCard project={p} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Navigation and "View All" Button at the bottom */}
        <div className="mt-8 md:mt-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-9 h-9 border-primary/20 hover:bg-primary hover:text-white transition-all disabled:opacity-30"
              onClick={scrollPrev}
              disabled={prevBtnDisabled}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Link 
              to="/projects" 
              className="inline-flex items-center gap-2 gradient-donate-bg text-white font-semibold px-7 py-2.5 rounded-btn shadow-donate hover:shadow-donate-hover group transition-all text-sm"
            >
              সকল প্রকল্প দেখুন
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-9 h-9 border-primary/20 hover:bg-primary hover:text-white transition-all disabled:opacity-30"
              onClick={scrollNext}
              disabled={nextBtnDisabled}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
