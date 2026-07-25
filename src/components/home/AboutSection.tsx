import { CheckCircle2, ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/hooks/api/useDashboardData";

export const AboutSection = () => {
  const { t } = useTranslation();
  const { data: settings, isLoading } = useSettings();
  const a = settings?.about;
  const heading = a?.heading || t("about.headingFallback");
  const highlight = a?.highlight || t("about.highlightFallback");
  const body = a?.body || t("about.bodyFallback");
  const quoteText = a?.quoteText || "";
  const quoteSource = a?.quoteSource || "";
  const points = a?.points?.length ? a.points : [];
  const sideImage = a?.sideImage && a.sideImage.trim() ? a.sideImage : "";
  const expNumber = a?.expNumber || t("about.expNumber");
  const expLabel = a?.expLabel || t("about.expLabel");

  return (
    <section className="section-y bg-background">
      <div className="container-page grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="relative order-2 lg:order-1">
          <div className="rounded-card overflow-hidden shadow-card bg-muted">
            {sideImage ? (
              <img src={sideImage} alt={highlight} loading="lazy" width={1200} height={900} className="w-full h-auto" />
            ) : (
              <div className={`w-full aspect-[4/3] flex items-center justify-center ${isLoading ? "animate-pulse" : ""}`}>
                {!isLoading && <ImageIcon className="h-12 w-12 text-muted-foreground/40" />}
              </div>
            )}
          </div>

          <div className="absolute -bottom-6 -right-2 md:-right-6 hidden sm:block bg-card rounded-card p-5 shadow-card-hover max-w-[240px]">
            <div className="text-3xl font-bold text-primary">{expNumber}</div>
            <div className="text-sm text-muted-foreground mt-1">{expLabel}</div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-base md:text-lg text-muted-foreground leading-[1.85] mb-2">
            সুন্নাহর অনুসরণে, মানবতার কল্যাণে
          </p>
          <h2 className="text-4xl md:text-6xl font-bold leading-[1.2] text-left">
            <span className="gradient-donate-text">{highlight}</span>
          </h2>
          <p className="mt-5 text-base md:text-lg text-muted-foreground leading-[1.85] whitespace-pre-line">
            {body}
          </p>

          {quoteText && (
            <blockquote className="mt-6 border-l-4 border-donate-highlight pl-5 py-2 bg-accent/40 rounded-r-card">
              <p className="text-foreground italic leading-relaxed">"{quoteText}"</p>
              {quoteSource && (
                <footer className="text-sm text-muted-foreground mt-2 font-en">{quoteSource}</footer>
              )}
            </blockquote>
          )}

          {points.length > 0 && (
            <ul className="mt-6 grid sm:grid-cols-2 gap-3">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground">{p}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};
