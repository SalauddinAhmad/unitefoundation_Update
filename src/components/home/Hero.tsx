import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings, type HeroSlide } from "@/hooks/api/useDashboardData";

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
  const { data: settings, isLoading, isFetching } = useSettings();
  const raw = settings?.hero_slides || [];
  const slides = raw
    .filter((s) => s.enabled !== false && s.image && s.image.trim())
    .map((s) => ({
      ...s,
      align: s.align || "left",
      overlay: s.overlay || "dark",
    }));

  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [slides.length]);

  // Prevent flash of default/build-time content — show skeleton until API resolves
  if (isLoading || (!settings && isFetching)) {
    return (
      <section className="relative h-[78vh] min-h-[560px] max-h-[780px] w-full overflow-hidden bg-muted animate-pulse" />
    );
  }

  // Never render a blank page: if no slide is configured (or settings were
  // reset), fall back to a branded text-only hero.
  const fallback = {
    eyebrow: "ইউনাইট ফাউন্ডেশন",
    title: "সুন্নাহর অনুসরণে, মানবতার কল্যাণে",
    subtitle:
      "ওহীভিত্তিক জীবন গড়ার দৃঢ় প্রত্যয়ে পরিচালিত একটি অরাজনৈতিক ও অলাভজনক ইসলামিক প্ল্যাটফর্ম।",
    primaryCtaLabel: "দান করুন",
    primaryCtaTo: "/donate",
    secondaryCtaLabel: "আমাদের সম্পর্কে",
    secondaryCtaTo: "/about",
    align: "left" as const,
  };

  const current = slides.length ? slides[Math.min(i, slides.length - 1)] : fallback;
  const align = (current.align || "left") as keyof typeof alignClasses;


  return (
    <section className="relative h-[78vh] min-h-[560px] max-h-[780px] w-full overflow-hidden bg-[#F1F0FB]">
      {!slides.length && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-foreground" />
      )}
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
            className="animate-fade-up mt-5 text-4xl md:text-6xl font-extrabold leading-[1.4] pt-2 text-white"
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

