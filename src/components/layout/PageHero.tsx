import { ReactNode } from "react";

interface PageHeroProps {
  image?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  children?: ReactNode;
  height?: string;
}

export const PageHero = ({
  image,
  eyebrow,
  title,
  subtitle,
  align = "center",
  children,
  height = "h-[360px] md:h-[460px]",
}: PageHeroProps) => {
  return (
    <section
      className={`relative ${height} w-full overflow-hidden -mt-28 md:-mt-32 pt-28 md:pt-32`}
    >
      {image && (
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/80 to-primary/95" />

      {/* Soft radial spotlight to make the headline pop without losing the image */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(0 0% 0% / 0.25) 0%, transparent 60%)",
        }}
      />
      <div
        className={`relative h-full container-page flex flex-col justify-center ${
          align === "center" ? "items-center text-center" : "items-start text-left"
        }`}
      >
        {eyebrow && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-white ring-1 ring-white/30 animate-fade-up">
            {eyebrow}
          </span>
        )}
        <h1
          className="mt-4 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] max-w-4xl animate-fade-up text-white"
          style={{ textShadow: "0 2px 16px hsl(0 0% 0% / 0.35)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={`mt-4 text-white/95 max-w-2xl text-base md:text-lg leading-relaxed animate-fade-up ${
              align === "center" ? "mx-auto" : ""
            }`}
            style={{ textShadow: "0 1px 8px hsl(0 0% 0% / 0.3)" }}
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
};
