import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/layout/PageHero";
import { ProjectCard } from "@/components/project/ProjectCard";
import { useProjectsPublic } from "@/hooks/api/usePublic";
import { useSettings } from "@/hooks/api/useDashboardData";


const Projects = () => {
  const { t } = useTranslation();
  const { data: settings } = useSettings();
  const { data: projectsRaw = [], isLoading } = useProjectsPublic();
  const ALL = t("projectsPage.all");

  // Active/ongoing projects always appear first; completed/draft after.
  const projects = useMemo(() => {
    const rank = (s?: string) => (s === "completed" ? 2 : s === "draft" ? 1 : 0);
    return [...projectsRaw].sort((a, b) => rank(a.status) - rank(b.status));
  }, [projectsRaw]);

  const cats = useMemo(() => {
    const s = new Set<string>();
    projects.forEach((p) => p.category && s.add(p.category));
    return [ALL, ...Array.from(s)];
  }, [projects, ALL]);

  const [active, setActive] = useState<string>(ALL);
  const filtered = useMemo(
    () => (active === ALL || !cats.includes(active) ? projects : projects.filter((p) => p.category === active)),
    [projects, active, ALL, cats]
  );

  return (
    <SiteLayout>
      <Seo title={t("projectsPage.seoTitle")} description={t("projectsPage.seoDesc")} canonical="/projects" />

      <PageHero
        image={settings?.page_heroes?.projects || undefined}
        eyebrow={t("projectsPage.eyebrow")}
        title={t("projectsPage.title")}
        subtitle={t("projectsPage.subtitle")}
      />

      <section className="py-10 md:py-14">
        <div className="container-page">
          {cats.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setActive(c)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-btn text-sm font-semibold transition-all ${
                    active === c
                      ? "gradient-donate-bg text-white shadow-donate"
                      : "bg-card border border-border text-foreground hover:border-primary"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
          {isLoading ? (
            <div className="py-24 flex justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center text-muted-foreground">{t("projectsPage.noProjects")}</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
              {filtered.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Projects;


