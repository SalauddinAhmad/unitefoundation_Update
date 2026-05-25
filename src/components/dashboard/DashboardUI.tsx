import { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, type LucideIcon } from "lucide-react";

export const PageHeader = ({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export const Card = ({
  children,
  className = "",
  pad = true,
}: {
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) => (
  <div
    className={
      "rounded-2xl bg-card border border-border shadow-[0_1px_2px_hsl(0_0%_0%_/_0.04)] " +
      (pad ? "p-5 md:p-6 " : "") +
      className
    }
  >
    {children}
  </div>
);

export const KpiCard = ({
  label,
  value,
  delta,
  trend = "up",
  note,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  note?: string;
  icon?: LucideIcon;
  highlight?: boolean;
}) => {
  const TrendIcon = trend === "down" ? ArrowDownRight : ArrowUpRight;
  return (
    <div
      className={
        "rounded-2xl border p-5 md:p-6 relative overflow-hidden transition-colors " +
        (highlight
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card border-border")
      }
    >
      <div className="flex items-start justify-between">
        <div className={"text-sm font-medium " + (highlight ? "text-white/85" : "text-muted-foreground")}>
          {label}
        </div>
        {Icon && (
          <div
            className={
              "h-9 w-9 rounded-xl flex items-center justify-center " +
              (highlight ? "bg-white/15 text-white" : "bg-accent text-primary")
            }
          >
            <Icon className="h-[18px] w-[18px]" />
          </div>
        )}
      </div>
      <div className={"mt-3 text-2xl md:text-[32px] font-extrabold tracking-tight " + (highlight ? "text-white" : "text-foreground")}>
        {value}
      </div>
      {(delta || note) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {delta && (
            <span
              className={
                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-bold " +
                (highlight
                  ? "bg-white/15 text-white"
                  : trend === "down"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary")
              }
            >
              <TrendIcon className="h-3 w-3" />
              {delta}
            </span>
          )}
          {note && (
            <span className={highlight ? "text-white/80" : "text-muted-foreground"}>{note}</span>
          )}
        </div>
      )}
    </div>
  );
};

export const SectionHeader = ({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-bold text-base">{title}</h3>
    {action || (
      <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
        <MoreHorizontal className="h-4 w-4" />
      </button>
    )}
  </div>
);

const statusStyles: Record<string, string> = {
  completed: "bg-primary/10 text-primary",
  approved: "bg-primary/10 text-primary",
  published: "bg-primary/10 text-primary",
  replied: "bg-primary/10 text-primary",
  active: "bg-primary/10 text-primary",
  pending: "bg-amber-100 text-amber-700",
  reviewing: "bg-amber-100 text-amber-700",
  scheduled: "bg-amber-100 text-amber-700",
  read: "bg-secondary text-muted-foreground",
  draft: "bg-secondary text-muted-foreground",
  new: "bg-blue-100 text-blue-700",
  unread: "bg-blue-100 text-blue-700",
  failed: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  completed: "সম্পন্ন",
  pending: "অপেক্ষমাণ",
  failed: "ব্যর্থ",
  new: "নতুন",
  reviewing: "পর্যালোচনা",
  approved: "অনুমোদিত",
  rejected: "প্রত্যাখ্যাত",
  published: "প্রকাশিত",
  draft: "ড্রাফট",
  scheduled: "সময়সূচি",
  unread: "অপঠিত",
  read: "পঠিত",
  replied: "উত্তরিত",
  active: "চলমান",
};

export const StatusBadge = ({ status }: { status: string }) => (
  <span className={"inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold " + (statusStyles[status] || "bg-secondary text-muted-foreground")}>
    {statusLabels[status] || status}
  </span>
);

export const Btn = ({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" }) => {
  const styles =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : variant === "outline"
      ? "border border-border bg-card hover:bg-secondary"
      : "hover:bg-secondary";
  return (
    <button
      {...props}
      className={
        "inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors " +
        styles +
        " " +
        className
      }
    >
      {children}
    </button>
  );
};
