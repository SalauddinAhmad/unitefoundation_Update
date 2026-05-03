import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ProjectCard } from "@/components/project/ProjectCard";
import { projects } from "@/data/projects";

export const ProgramsSection = () => {
  const featured = projects.slice(0, 6);
  return (
    <section className="section-y bg-secondary/40">
      <div className="container-page">
        <div className="flex items-end justify-between gap-6 mb-10 md:mb-12">
          <div>
            <span className="eyebrow">আমাদের কার্যক্রম</span>
            <h2 className="heading-display mt-3 max-w-2xl">
              চলমান প্রকল্পসমূহ — যেখানে আপনার দান সরাসরি কাজ করছে
            </h2>
          </div>
          <Link to="/projects" className="hidden md:inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
            সব প্রকল্প <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {featured.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link to="/projects" className="inline-flex items-center gap-2 text-primary font-semibold">
            সব প্রকল্প দেখুন <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
