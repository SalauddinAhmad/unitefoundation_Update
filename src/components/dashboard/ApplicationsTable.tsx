import { Card, PageHeader, StatusBadge, Btn } from "@/components/dashboard/DashboardUI";
import { Application } from "@/data/dashboardMock";
import { CheckCircle2, XCircle, Eye, Download, Phone, MapPin } from "lucide-react";

interface Props {
  title: string;
  subtitle: string;
  data: Application[];
  emptyHint?: string;
}

export const ApplicationsTable = ({ title, subtitle, data }: Props) => {
  const counts = {
    new: data.filter((d) => d.status === "new").length,
    reviewing: data.filter((d) => d.status === "reviewing").length,
    approved: data.filter((d) => d.status === "approved").length,
    rejected: data.filter((d) => d.status === "rejected").length,
  };
  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={<Btn variant="outline"><Download className="h-4 w-4" /> এক্সপোর্ট</Btn>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { l: "নতুন", v: counts.new, c: "text-blue-600" },
          { l: "পর্যালোচনা", v: counts.reviewing, c: "text-amber-600" },
          { l: "অনুমোদিত", v: counts.approved, c: "text-primary" },
          { l: "প্রত্যাখ্যাত", v: counts.rejected, c: "text-destructive" },
        ].map((s) => (
          <Card key={s.l}>
            <div className="text-xs text-muted-foreground font-medium">{s.l}</div>
            <div className={"text-2xl font-extrabold mt-2 " + s.c}>{s.v}</div>
          </Card>
        ))}
      </div>

      <Card pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                <th className="font-semibold px-5 py-3">ID</th>
                <th className="font-semibold py-3">আবেদনকারী</th>
                <th className="font-semibold py-3">ধরন / ক্ষেত্র</th>
                <th className="font-semibold py-3">তারিখ</th>
                <th className="font-semibold py-3">স্ট্যাটাস</th>
                <th className="font-semibold py-3 pr-5 text-right">কর্ম</th>
              </tr>
            </thead>
            <tbody>
              {data.map((v) => (
                <tr key={v.id} className="border-t border-border hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-foreground/70">{v.id}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {v.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{v.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{v.phone}</span>
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{v.city}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-foreground/85">{v.type}</td>
                  <td className="py-3 text-foreground/70 text-xs">{v.date}</td>
                  <td className="py-3"><StatusBadge status={v.status} /></td>
                  <td className="py-3 pr-5">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground" title="দেখুন"><Eye className="h-4 w-4" /></button>
                      <button className="p-1.5 rounded-md hover:bg-primary/10 text-primary" title="অনুমোদন"><CheckCircle2 className="h-4 w-4" /></button>
                      <button className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive" title="প্রত্যাখ্যান"><XCircle className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};
