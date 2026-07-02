import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Heart, MapPin, Users, Target, TrendingUp, Loader2 } from "lucide-react";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { formatBDT, toBnNum } from "@/data/projects";
import { ProgressBar } from "@/components/project/ProgressBar";
import { ProjectCard } from "@/components/project/ProjectCard";
import { useProjectPublic, useProjectsPublic } from "@/hooks/api/usePublic";
import NotFound from "./NotFound";

const ProjectDetail = () => {
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
            <ArrowLeft className="h-4 w-4" /> সব প্রকল্প
          </Link>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container-page grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-btn bg-accent text-accent-foreground text-xs font-bold">{project.category}</span>
              {project.urgent && <span className="px-2.5 py-1 rounded-btn gradient-donate-bg text-white text-xs font-bold">জরুরি</span>}
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{project.location}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{project.title}</h1>
            <div className="rounded-card overflow-hidden mt-6 shadow-card">
              <img src={project.image} alt={project.title} width={1280} height={720} className="w-full h-auto" />
            </div>
            <div className="mt-8 prose-bn max-w-none">
              <p className="text-lg text-foreground leading-[1.85]">{project.shortDescription}</p>
              <p className="mt-4">{project.description}</p>
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
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">এ পর্যন্ত সংগৃহীত</div>
                  <div className="text-3xl font-extrabold gradient-donate-text">৳{toBnNum(formatBDT(project.raised))}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">লক্ষ্য</div>
                  <div className="font-bold">৳{toBnNum(formatBDT(project.target))}</div>
                </div>
              </div>
              <div className="mt-4">
                <ProgressBar raised={project.raised} target={project.target} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Stat icon={Users} label="দাতা" value={`${toBnNum(project.donors)} জন`} />
                <Stat icon={TrendingUp} label="সংগৃহীত" value={`${toBnNum(Math.round((project.raised/project.target)*100))}%`} />
                <Stat icon={Target} label="বাকি" value={`৳${toBnNum(formatBDT(Math.max(0, project.target - project.raised)))}`} />
                <Stat icon={MapPin} label="এলাকা" value={project.location} />
              </div>
              <Link to={`/donate?project=${project.slug}`} className="btn-donate w-full mt-6 text-base">
                <Heart className="h-5 w-5" /> এই প্রকল্পে দান করুন
              </Link>
              <p className="mt-3 text-xs text-muted-foreground text-center">১০০% নিরাপদ · শরীয়াহ-অনুমোদিত</p>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-y bg-secondary/40">
          <div className="container-page">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">সংশ্লিষ্ট প্রকল্প</h2>
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
