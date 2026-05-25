import { Card, PageHeader, StatusBadge, Btn } from "@/components/dashboard/DashboardUI";
import { projects } from "@/data/dashboardMock";
import { Plus, Edit3, Eye, Users, Download } from "lucide-react";

const Projects = () => {
  return (
    <>
      <PageHeader
        title="প্রকল্পসমূহ"
        subtitle="চলমান ও সমাপ্ত সকল প্রকল্প ম্যানেজ করুন"
        actions={
          <>
            <Btn variant="outline"><Download className="h-4 w-4" /> রিপোর্ট</Btn>
            <Btn><Plus className="h-4 w-4" /> নতুন প্রকল্প</Btn>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((p) => {
          const pct = Math.round((p.raised / p.budget) * 100);
          return (
            <Card key={p.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-primary">{p.category}</div>
                  <h3 className="font-bold text-base mt-1.5 leading-snug">{p.title}</h3>
                </div>
                <StatusBadge status={p.status} />
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">সংগৃহীত</span>
                  <span className="font-bold tabular-nums">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="font-bold tabular-nums text-primary">৳ {(p.raised / 100000).toFixed(1)}L</span>
                  <span className="text-muted-foreground tabular-nums">/ ৳ {(p.budget / 100000).toFixed(1)}L</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span><b className="text-foreground">{p.beneficiaries.toLocaleString()}</b> উপকারভোগী</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground" title="দেখুন"><Eye className="h-4 w-4" /></button>
                  <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground" title="সম্পাদনা"><Edit3 className="h-4 w-4" /></button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default Projects;
