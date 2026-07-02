import { ShieldCheck, Award, FileText, Users, type LucideIcon } from "lucide-react";
import { useSettings, type TrustItem } from "@/hooks/api/useDashboardData";

const iconMap: Record<TrustItem["icon"], LucideIcon> = {
  shield: ShieldCheck,
  award: Award,
  file: FileText,
  users: Users,
};

export const TrustStrip = () => {
  const { data: settings } = useSettings();
  const items = settings?.trust?.length ? settings.trust : [];
  if (!items.length) return null;

  return (
    <section className="py-12 md:py-16 bg-background border-y border-border">
      <div className="container-page grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
        {items.map((it, idx) => {
          const Icon = iconMap[it.icon] || ShieldCheck;
          return (
            <div key={idx} className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-card bg-accent flex items-center justify-center text-primary shrink-0">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-foreground">{it.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{it.note}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
