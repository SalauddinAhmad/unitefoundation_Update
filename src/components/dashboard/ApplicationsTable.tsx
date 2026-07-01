import { useMemo, useState } from "react";
import { Card, PageHeader, StatusBadge, Btn } from "@/components/dashboard/DashboardUI";
import { Application } from "@/data/dashboardMock";
import {
  CheckCircle2, XCircle, Eye, Download, Phone, MapPin, Search, Filter,
  Mail, Calendar, User, Copy, MessageSquare, Printer, X,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { exportRowsAsCsv } from "@/lib/csv";
import { toast } from "sonner";

interface Props {
  title: string;
  subtitle: string;
  data: Application[];
  emptyHint?: string;
}

const STATUS_LABEL: Record<Application["status"], string> = {
  new: "নতুন",
  reviewing: "পর্যালোচনা",
  approved: "অনুমোদিত",
  rejected: "প্রত্যাখ্যাত",
};

export const ApplicationsTable = ({ title, subtitle, data }: Props) => {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | Application["status"]>("all");
  const [active, setActive] = useState<Application | null>(null);

  const counts = {
    new: data.filter((d) => d.status === "new").length,
    reviewing: data.filter((d) => d.status === "reviewing").length,
    approved: data.filter((d) => d.status === "approved").length,
    rejected: data.filter((d) => d.status === "rejected").length,
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return data.filter((d) => {
      if (status !== "all" && d.status !== status) return false;
      if (!query) return true;
      return (
        d.name.toLowerCase().includes(query) ||
        d.id.toLowerCase().includes(query) ||
        d.phone.includes(query) ||
        (d.email || "").toLowerCase().includes(query) ||
        d.city.toLowerCase().includes(query) ||
        d.type.toLowerCase().includes(query)
      );
    });
  }, [data, q, status]);

  const handleExport = () => {
    if (!filtered.length) {
      toast.error("এক্সপোর্টের জন্য কোনো রেকর্ড নেই");
      return;
    }
    exportRowsAsCsv(
      `${title}-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered,
      [
        { header: "ID", accessor: (r) => r.id },
        { header: "নাম", accessor: (r) => r.name },
        { header: "ফোন", accessor: (r) => r.phone },
        { header: "ইমেইল", accessor: (r) => r.email || "" },
        { header: "শহর/জেলা", accessor: (r) => r.city },
        { header: "ধরন/ক্ষেত্র", accessor: (r) => r.type },
        { header: "তারিখ", accessor: (r) => r.date },
        { header: "স্ট্যাটাস", accessor: (r) => STATUS_LABEL[r.status] },
        {
          header: "বিস্তারিত",
          accessor: (r) =>
            (r.details || [])
              .flatMap((s) => s.fields.map((f) => `${f.label}: ${f.value}`))
              .join(" | "),
        },
      ],
    );
    toast.success(`${filtered.length}টি রেকর্ড এক্সপোর্ট করা হয়েছে`);
  };

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <Btn variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" /> CSV এক্সপোর্ট
          </Btn>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { l: "নতুন", v: counts.new, c: "text-blue-600", key: "new" as const },
          { l: "পর্যালোচনা", v: counts.reviewing, c: "text-amber-600", key: "reviewing" as const },
          { l: "অনুমোদিত", v: counts.approved, c: "text-primary", key: "approved" as const },
          { l: "প্রত্যাখ্যাত", v: counts.rejected, c: "text-destructive", key: "rejected" as const },
        ].map((s) => (
          <button key={s.l} onClick={() => setStatus(s.key)} className="text-left">
            <Card>
              <div className="text-xs text-muted-foreground font-medium">{s.l}</div>
              <div className={"text-2xl font-extrabold mt-2 " + s.c}>{s.v}</div>
            </Card>
          </button>
        ))}
      </div>

      <Card pad={false}>
        <div className="p-4 md:p-5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between border-b border-border">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="নাম, ID, ফোন, ইমেইল বা ক্ষেত্র দিয়ে খুঁজুন"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-secondary text-sm focus:bg-card focus:ring-2 focus:ring-primary/20 focus:outline-none transition"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {(["all", "new", "reviewing", "approved", "rejected"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors " +
                  (status === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground/70 hover:bg-accent")
                }
              >
                {s === "all" ? "সব" : STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    কোনো আবেদন পাওয়া যায়নি
                  </td>
                </tr>
              )}
              {filtered.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => setActive(v)}
                  className="border-t border-border hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3 font-mono text-xs text-foreground/70">{v.id}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {v.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{v.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{v.phone}</span>
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{v.city}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-foreground/85">{v.type}</td>
                  <td className="py-3 text-foreground/70 text-xs">{v.date}</td>
                  <td className="py-3"><StatusBadge status={v.status} /></td>
                  <td className="py-3 pr-5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setActive(v)}
                        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toast.success(`${v.name} অনুমোদিত`)}
                        className="p-1.5 rounded-md hover:bg-primary/10 text-primary"
                        title="অনুমোদন"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toast.error(`${v.name} প্রত্যাখ্যাত`)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"
                        title="প্রত্যাখ্যান"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ApplicationDetailSheet
        app={active}
        onClose={() => setActive(null)}
      />
    </>
  );
};

// ============================================================
// Premium detail sheet
// ============================================================
const ApplicationDetailSheet = ({
  app,
  onClose,
}: {
  app: Application | null;
  onClose: () => void;
}) => {
  const copyAll = () => {
    if (!app) return;
    const lines = [
      `${app.id} — ${app.name}`,
      `ফোন: ${app.phone}`,
      app.email ? `ইমেইল: ${app.email}` : "",
      `শহর: ${app.city}`,
      `ধরন: ${app.type}`,
      `তারিখ: ${app.date}`,
      "",
      ...(app.details || []).flatMap((s) => [
        `— ${s.title} —`,
        ...s.fields.map((f) => `${f.label}: ${f.value}`),
        "",
      ]),
    ].filter(Boolean);
    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("বিস্তারিত ক্লিপবোর্ডে কপি হয়েছে");
  };

  return (
    <Sheet open={!!app} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl p-0 overflow-hidden flex flex-col"
      >
        {app && (
          <>
            {/* Premium header */}
            <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground p-6 pb-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition"
              >
                <X className="h-5 w-5" />
              </button>
              <SheetHeader className="text-left space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center text-2xl font-extrabold">
                    {app.name.charAt(0)}
                  </div>
                  <div>
                    <SheetTitle className="text-primary-foreground text-2xl font-extrabold leading-tight">
                      {app.name}
                    </SheetTitle>
                    <div className="text-xs opacity-90 font-mono mt-0.5">{app.id}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 text-xs bg-white/15 backdrop-blur px-2.5 py-1 rounded-md">
                    <User className="h-3.5 w-3.5" />
                    {app.type}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs bg-white/15 backdrop-blur px-2.5 py-1 rounded-md">
                    <MapPin className="h-3.5 w-3.5" />
                    {app.city}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs bg-white/15 backdrop-blur px-2.5 py-1 rounded-md">
                    <Calendar className="h-3.5 w-3.5" />
                    {app.submittedAt || app.date}
                  </span>
                </div>
              </SheetHeader>
            </div>

            {/* Quick actions bar */}
            <div className="px-6 py-3 border-b border-border bg-muted/30 flex items-center gap-2 flex-wrap">
              <StatusBadge status={app.status} />
              <div className="flex-1" />
              <a
                href={`tel:${app.phone}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-secondary hover:bg-accent transition"
              >
                <Phone className="h-3.5 w-3.5" /> কল
              </a>
              <a
                href={`https://wa.me/${app.phone.replace(/^0/, "88")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-secondary hover:bg-accent transition"
              >
                <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
              </a>
              {app.email && (
                <a
                  href={`mailto:${app.email}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-secondary hover:bg-accent transition"
                >
                  <Mail className="h-3.5 w-3.5" /> ইমেইল
                </a>
              )}
              <button
                onClick={copyAll}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-secondary hover:bg-accent transition"
              >
                <Copy className="h-3.5 w-3.5" /> কপি
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-secondary hover:bg-accent transition"
              >
                <Printer className="h-3.5 w-3.5" /> প্রিন্ট
              </button>
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {!app.details?.length && (
                <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground text-center">
                  এই আবেদনের জন্য অতিরিক্ত বিস্তারিত এখনও যুক্ত হয়নি।
                  <div className="mt-3 grid grid-cols-2 gap-3 text-left">
                    <Field label="ফোন" value={app.phone} />
                    <Field label="শহর" value={app.city} />
                    <Field label="ধরন" value={app.type} />
                    <Field label="তারিখ" value={app.date} />
                  </div>
                </div>
              )}

              {app.details?.map((section) => (
                <section key={section.title}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-1 w-6 rounded-full bg-primary" />
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                      {section.title}
                    </h3>
                  </div>
                  <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                    {section.fields.map((f) => (
                      <div
                        key={f.label}
                        className={
                          "px-4 py-3 " +
                          (f.long ? "flex flex-col gap-1" : "flex items-start justify-between gap-4")
                        }
                      >
                        <div className="text-xs font-semibold text-muted-foreground shrink-0">
                          {f.label}
                        </div>
                        <div className={"text-sm font-medium text-foreground " + (f.long ? "" : "text-right")}>
                          {f.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Sticky footer actions */}
            <div className="border-t border-border p-4 bg-card flex items-center gap-2">
              <button
                onClick={() => {
                  toast.error(`${app.name} প্রত্যাখ্যাত`);
                  onClose();
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-destructive/10 text-destructive font-bold text-sm hover:bg-destructive/15 transition"
              >
                <XCircle className="h-4 w-4" /> প্রত্যাখ্যান
              </button>
              <button
                onClick={() => {
                  toast.success(`${app.name} অনুমোদিত`);
                  onClose();
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition"
              >
                <CheckCircle2 className="h-4 w-4" /> অনুমোদন
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-muted/40 px-3 py-2">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
      {label}
    </div>
    <div className="text-sm font-semibold mt-0.5">{value}</div>
  </div>
);
