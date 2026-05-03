import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ProjectCard } from "@/components/project/ProjectCard";
import { projects } from "@/data/projects";

export const ProgramsSection = () => {
  // Duplicate the list for a seamless infinite marquee
  const loop = [...projects, ...projects];

  return (
    <section className="section-y bg-secondary/40">
      <div className="container-page">
        <div className="text-center mb-10 md:mb-12">
          <span className="eyebrow">আমাদের কার্যক্রম</span>
          <h2 className="heading-display mt-3 max-w-2xl mx-auto">
            চলমান প্রকল্পসমূহ — যেখানে আপনার দান সরাসরি কাজ করছে
          </h2>
          <Link
            to="/projects"
            className="hidden md:inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all mt-4"
          >
            সব প্রকল্প <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative overflow-hidden">
          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-20 z-10 bg-gradient-to-r from-secondary/40 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-20 z-10 bg-gradient-to-l from-secondary/40 to-transparent" />

          <div
            className="flex gap-6 md:gap-7 animate-marquee hover:[animation-play-state:paused] py-2"
            style={{ animationDuration: "60s" }}
          >
            {loop.map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                className="shrink-0 w-[85vw] sm:w-[46vw] lg:w-[calc((100%-3.5rem)/3)]"
              >
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            সব প্রকল্প দেখুন <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
