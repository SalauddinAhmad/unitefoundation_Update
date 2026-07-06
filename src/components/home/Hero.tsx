import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import hero1 from "@/assets/hero-relief.jpg";
import hero2 from "@/assets/hero-water.jpg";
import hero3 from "@/assets/hero-mosque.jpg";
import { useSettings, type HeroSlide } from "@/hooks/api/useDashboardData";

// Fallback slides use translation keys so the hero switches with language.
// Backend-provided hero_slides remain as-authored (Bangla) unless the
// admin also stores English versions.
const buildFallbackSlides = (t: (k: string) => string): HeroSlide[] => [
  {
    image: hero1,
    eyebrow: t("hero.slide1.eyebrow"),
    title: t("hero.slide1.title"),
    subtitle: t("hero.slide1.subtitle"),
    primaryCtaLabel: t("hero.slide1.primaryCta"),
    primaryCtaTo: "/donate",
    secondaryCtaLabel: t("hero.slide1.secondaryCta"),
    secondaryCtaTo: "/projects",
  },
  {
    image: hero2,
    eyebrow: t("hero.slide2.eyebrow"),
    title: t("hero.slide2.title"),
    subtitle: t("hero.slide2.subtitle"),
    primaryCtaLabel: t("hero.slide2.primaryCta"),
    primaryCtaTo: "/donate?project=palestine-food",
    secondaryCtaLabel: t("hero.slide2.secondaryCta"),
    secondaryCtaTo: "/projects/palestine-food",
  },
  {
    image: hero3,
    eyebrow: t("hero.slide3.eyebrow"),
    title: t("hero.slide3.title"),
    subtitle: t("hero.slide3.subtitle"),
    primaryCtaLabel: t("hero.slide3.primaryCta"),
    primaryCtaTo: "/donate?project=masjid-project",
    secondaryCtaLabel: t("hero.slide3.secondaryCta"),
    secondaryCtaTo: "/projects",
  },
];

const overlayClasses: Record<NonNullable<HeroSlide["overlay"]>, string> = {
  dark: "bg-gradient-to-r from-black/75 via-black/50 to-black/20",
  medium: "bg-gradient-to-r from-black/55 via-black/30 to-transparent",
  light: "bg-gradient-to-t from-black/60 via-black/15 to-transparent",
};
const alignClasses = {
  left: "items-start text-left mr-auto",
  center: "items-center text-center mx-auto",
  right: "items-end text-right ml-auto",
} as const;

export const Hero = () => {
  const { t } = useTranslation();
  const { data: settings } = useSettings();
  const fallbackSlides = buildFallbackSlides(t);
  const raw = settings?.hero_slides?.length ? settings.hero_slides : fallbackSlides;
  const slides = raw
    .filter((s) => s.enabled !== false)
    .map((s, i) => ({
      ...s,
      image: s.image && s.image.trim() ? s.image : fallbackImages[i % fallbackImages.length],
      align: s.align || "left",
      overlay: s.overlay || "dark",
    }));

  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return null;
  const current = slides[Math.min(i, slides.length - 1)];
  const align = current.align as keyof typeof alignClasses;

  return (
    <section className="relative h-[78vh] min-h-[560px] max-h-[780px] w-full overflow-hidden bg-foreground">
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`}
          aria-hidden={idx !== i}
        >
          <img
            src={s.image}
            alt=""
            width={1920}
            height={1080}
            className={`h-full w-full object-cover ${idx === i ? "animate-hero-zoom" : ""}`}
            fetchPriority={idx === 0 ? "high" : "low"}
          />
          <div className={`absolute inset-0 ${overlayClasses[s.overlay as keyof typeof overlayClasses]}`} />
        </div>
      ))}

      <div className="relative h-full container-page flex items-center">
        <div className={`flex flex-col max-w-2xl text-white ${alignClasses[align]}`}>
          <div key={`eb-${i}`} className="animate-fade-up">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-donate-highlight text-donate-highlight-foreground text-xs font-bold uppercase tracking-wider">
              <Heart className="h-3.5 w-3.5" />
              {current.eyebrow}
            </span>
          </div>
          <h1
            key={`t-${i}`}
            className="animate-fade-up mt-5 text-4xl md:text-6xl font-extrabold leading-[1.1] text-white"
          >
            {current.title}
          </h1>
          <p
            key={`s-${i}`}
            className="animate-fade-up mt-5 text-base md:text-lg text-white/85 leading-relaxed max-w-xl"
          >
            {current.subtitle}
          </p>
          <div key={`c-${i}`} className="animate-fade-up mt-8 flex flex-wrap gap-3">
            <Link to={current.primaryCtaTo} className="btn-donate text-base">
              <Heart className="h-5 w-5" /> {current.primaryCtaLabel}
            </Link>
            <Link
              to={current.secondaryCtaTo}
              className="inline-flex items-center gap-2 rounded-btn px-6 py-3 bg-white/10 backdrop-blur border border-white/30 text-white font-semibold hover:bg-white/20 transition-colors"
            >
              {current.secondaryCtaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-2">
            <button
              onClick={() => setI((v) => (v - 1 + slides.length) % slides.length)}
              aria-label={t("common.prev")}
              className="p-2.5 rounded-full bg-white/10 backdrop-blur text-white border border-white/20 hover:bg-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setI((v) => (v + 1) % slides.length)}
              aria-label={t("common.next")}
              className="p-2.5 rounded-full bg-white/10 backdrop-blur text-white border border-white/20 hover:bg-white/20"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:bottom-8 md:right-32 flex gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`${t("common.slide")} ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-donate-highlight" : "w-4 bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

