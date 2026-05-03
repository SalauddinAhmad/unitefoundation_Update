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
  height = "h-[280px] md:h-[360px]",
}: PageHeroProps) => {
  return (
    <div className="p-[35px] bg-background">
      <section
        className={`relative ${height} overflow-hidden rounded-2xl shadow-card`}
      >
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary/85" />
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
          <h1 className="mt-4 text-3xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] max-w-4xl animate-fade-up">
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
    </div>
  );
};
