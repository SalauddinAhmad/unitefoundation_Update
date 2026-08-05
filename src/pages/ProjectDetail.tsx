import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Heart, MapPin, Users, Target, TrendingUp, Loader2, HeartHandshake, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { formatBDT, toBnNum } from "@/data/projects";
import { ProgressBar } from "@/components/project/ProgressBar";
import { ProjectCard } from "@/components/project/ProjectCard";
import { useProjectPublic, useProjectsPublic } from "@/hooks/api/usePublic";
import NotFound from "./NotFound";

const ProjectDetail = () => {
  const { t } = useTranslation();
  const { slug = "" } = useParams();
  const { data: project, isLoading } = useProjectPublic(slug);
  const { data: allProjects = [] } = useProjectsPublic();
  if (isLoading) return (
    <SiteLayout>
      <div className="py-32 flex justify-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
    </SiteLayout>
  );
  if (!project) return <NotFound />;

  const related = allProjects.filter((p) => p.id !== project.id && p.category === project.category).slice(0, 3);

  return (
    <SiteLayout>
      <Seo title={`${project.title} | ইউনাইট ফাউন্ডেশন`} description={project.shortDescription} canonical={`/projects/${project.slug}`} />

      <section className="bg-secondary/40 py-8">
        <div className="container-page">
          <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> {t("projectDetail.allProjects")}
          </Link>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container-page grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {project.category && <span className="px-2.5 py-1 rounded-btn bg-accent text-accent-foreground text-xs font-bold">{project.category}</span>}
              {project.urgent && <span className="px-2.5 py-1 rounded-btn gradient-donate-bg text-white text-xs font-bold">{t("projectDetail.urgent")}</span>}
              {project.status && (
                <span className={
                  "px-2.5 py-1 rounded-btn text-xs font-bold " +
                  (project.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : project.status === "completed"
                    ? "bg-violet-100 text-violet-700"
                    : "bg-secondary text-muted-foreground")
                }>
                  {project.status === "active" ? "চলমান" : project.status === "completed" ? "সম্পন্ন" : "ড্রাফট"}
                </span>
              )}
              {project.location && project.location !== "সারা দেশে" && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{project.location}</span>}
              {(project.startDate || project.endDate) && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {project.startDate || "—"}{project.endDate ? ` → ${project.endDate}` : ""}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{project.title}</h1>
            <div className="rounded-card overflow-hidden mt-6 shadow-card">
              <img src={project.image} alt={project.title} width={1280} height={720} className="w-full h-auto" />
            </div>
            <div className="mt-8 prose-bn max-w-none">
              <div
                className="text-lg text-foreground leading-[1.85] [&_p]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-5 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary [&_a]:underline [&_img]:rounded-card [&_img]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic"
                dangerouslySetInnerHTML={{ __html: project.shortDescription || "" }}
              />
              <div
                className="mt-4 [&_p]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-5 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary [&_a]:underline [&_img]:rounded-card [&_img]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic"
                dangerouslySetInnerHTML={{ __html: project.description || "" }}
              />
            </div>
            {project.gallery.length > 1 && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
                {project.gallery.map((g, i) => (
                  <img key={i} src={g} alt={`${project.title} ছবি ${i + 1}`} loading="lazy" className="rounded-card aspect-[4/3] object-cover w-full" />
                ))}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 self-start">
            <div className="card-base p-6">
              {project.target > 0 ? (
                <>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">{t("projectDetail.collected")}</div>
                      <div className="text-3xl font-extrabold gradient-donate-text">৳{toBnNum(formatBDT(project.raised))}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">{t("projectDetail.goal")}</div>
                      <div className="font-bold">৳{toBnNum(formatBDT(project.target))}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <ProgressBar raised={project.raised} target={project.target} />
                  </div>
                   <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <Stat icon={TrendingUp} label={t("projectDetail.raisedPct")} value={`${toBnNum(Math.round((project.raised/project.target)*100))}%`} />
                    <Stat icon={Target} label={t("projectDetail.remaining")} value={`৳${toBnNum(formatBDT(Math.max(0, project.target - project.raised)))}`} />
                    {project.location !== "সারা দেশে" && <Stat icon={MapPin} label={t("projectDetail.area")} value={project.location} />}
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {project.location !== "সারা দেশে" && <Stat icon={MapPin} label={t("projectDetail.area")} value={project.location} />}
                </div>
              )}
              {project.status !== "completed" && (
                <>
                  <Link to={`/donate?project=${project.slug}`} className="btn-donate w-full mt-6 text-base">
                    <Heart className="h-5 w-5" /> {t("projectDetail.donateCta")}
                  </Link>
                  <p className="mt-3 text-xs text-muted-foreground text-center">{t("projectDetail.safeNote")}</p>
                </>
              )}
              {project.status === "completed" && (
                <div className="mt-6 rounded-btn bg-violet-50 text-violet-700 text-center py-4 px-3">
                  <div className="text-lg font-extrabold">আলহামদুলিল্লাহ</div>
                  <div className="text-sm font-semibold mt-1">এই প্রকল্পটি সম্পন্ন হয়েছে</div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-y bg-secondary/40">
          <div className="container-page">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">{t("projectDetail.related")}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="rounded-btn bg-secondary/60 p-3">
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</div>
    <div className="font-bold text-sm mt-1 text-foreground line-clamp-1">{value}</div>
  </div>
);

export default ProjectDetail;
