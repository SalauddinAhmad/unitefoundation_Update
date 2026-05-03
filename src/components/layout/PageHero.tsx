import { ReactNode } from "react";

interface PageHeroProps {
  image: string;
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
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/65 to-primary/80" />
      <div
        className={`relative h-full container-page flex flex-col justify-center text-primary-foreground ${
          align === "center" ? "items-center text-center" : "items-start text-left"
        }`}
      >
        {eyebrow && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-bold uppercase tracking-wider text-primary-foreground animate-fade-up">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] max-w-4xl animate-fade-up">
          {title}
        </h1>
        {subtitle && (
          <p
            className={`mt-4 text-primary-foreground/90 max-w-2xl text-base md:text-lg animate-fade-up ${
              align === "center" ? "mx-auto" : ""
            }`}
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
};
