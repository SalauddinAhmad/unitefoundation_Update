import { useState, useMemo } from "react";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProjectCard } from "@/components/project/ProjectCard";
import { projects, Category } from "@/data/projects";

const cats: ("সব" | Category)[] = [
  "সব",
  "দাওয়াহ",
  "মাদরাসা",
  "মাসজিদ",
  "ইয়াতিম",
  "শিক্ষা",
  "ফিলিস্তিন",
  "পথশিশু",
  "দুর্যোগ",
  "শীতবস্ত্র",
  "কুরবানী",
  "কর্জ-এ-হাসানাহ",
  "ইউনাইট টিভি",
];

const Projects = () => {
  const [active, setActive] = useState<(typeof cats)[number]>("সব");
  const filtered = useMemo(
    () => (active === "সব" ? projects : projects.filter((p) => p.category === active)),
    [active]
  );

  return (
    <SiteLayout>
      <Seo title="প্রকল্পসমূহ | ইউনাইট ফাউন্ডেশন" description="চলমান প্রকল্পগুলো দেখুন এবং সরাসরি দান করুন।" canonical="/projects" />

      <section className="bg-secondary/40 pt-14 pb-10 md:pt-20 md:pb-14">
        <div className="container-page">
          <span className="eyebrow">আমাদের প্রকল্প</span>
          <h1 className="heading-display mt-3 max-w-2xl">চলমান সকল প্রকল্প — সরাসরি দান করুন</h1>
          <p className="mt-4 text-muted-foreground max-w-xl">
            প্রতিটি প্রকল্পের অগ্রগতি, লক্ষ্য ও বিস্তারিত হিসাব স্বচ্ছভাবে প্রকাশ করা হয়।
          </p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container-page">
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Projects;
