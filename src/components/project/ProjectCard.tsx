import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { Project, formatBDT, toBnNum } from "@/data/projects";
import { ProgressBar } from "./ProgressBar";

export const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <article className="card-base flex flex-col h-full group">
      <Link to={`/projects/${project.slug}`} className="block relative aspect-[16/10] overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          width={1024}
          height={640}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-btn bg-card/95 backdrop-blur text-xs font-semibold text-primary">
            {project.category}
          </span>
          {project.urgent && (
            <span className="px-2.5 py-1 rounded-btn gradient-donate-bg text-white text-xs font-semibold">
              জরুরি
            </span>
          )}
        </div>
      </Link>

      <div className="p-5 md:p-6 flex flex-col gap-4 flex-1">
        <div className="flex-1">
          <h3 className="text-lg font-bold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            <Link to={`/projects/${project.slug}`}>{project.title}</Link>
          </h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {project.shortDescription}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{project.location}</span>
            <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{toBnNum(project.donors)} জন</span>
          </div>
        </div>

        {project.target > 0 && <ProgressBar raised={project.raised} target={project.target} size="sm" />}

        <Link
          to={`/projects/${project.slug}`}
          className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-btn border-2 border-primary/80 bg-primary/5 px-4 py-3 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white hover:gap-3"
        >
          বিস্তারিত দেখুন <ArrowRight className="h-4 w-4" />
        </Link>

      </div>
    </article>
  );
};
