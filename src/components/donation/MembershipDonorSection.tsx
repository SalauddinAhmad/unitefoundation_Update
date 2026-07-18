import { useMemo, useState } from "react";
import {
  HeartHandshake,
  Repeat,
  CalendarClock,
  Send,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ChevronRight,
  PartyPopper,
  Phone,
  Mail,
  RotateCcw,
} from "lucide-react";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { site } from "@/data/site";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

type TabKey = "regular" | "monthly" | "member";

const tabsBase: { key: TabKey; label: string; icon: typeof HeartHandshake }[] = [
  { key: "regular", label: "নিয়মিত দাতা", icon: Repeat },
  { key: "monthly", label: "মাসিক দাতা", icon: CalendarClock },
  { key: "member", label: "আজীবন দাতা", icon: HeartHandshake },
];

// Save to backend and surface errors so users know when submission actually
// failed (previously .catch(()=>{}) silently swallowed failures — records
// never reached the DB and the dashboard stayed empty).
const saveApplication = async (
  kind: "member" | "donor",
  payload: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    profession?: string;
    message?: string;
    extra?: Record<string, unknown>;
  },
): Promise<boolean> => {
  try {
    await api.post(`/applications/${kind}`, payload, { auth: false });
    return true;
  } catch (err) {
    console.error("[donation] submit failed:", err);
    toast({
      title: "সাবমিট ব্যর্থ",
      description:
        (err as { message?: string })?.message ||
        "সার্ভারে সংরক্ষণ করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
      variant: "destructive",
    });
    return false;
  }
};

// Left panel content is now driven by the dashboard's Form Manager
// (extras). "regular" tab → donor schema, "member" tab → member schema.
import { useFormSchema as useSchemaForLeft } from "@/hooks/api/useForms";
import { FormSideContent } from "@/components/forms/FormSideContent";

const LeftPanel = ({ active }: { active: TabKey }) => {
  const key = active === "regular" ? "donor" : active === "monthly" ? "monthly" : "member";
  const { data: schema } = useSchemaForLeft(key);
  return <FormSideContent extras={schema?.extras} />;
};

type SuccessBlock = {
  title: string;
  subtitle: string;
  message: string;
  bullets: string[];
  nextStep: string;
};

const SuccessCard = ({
  topic,
  onReset,
}: {
  topic: TabKey;
  onReset: () => void;
}) => {
  const { t } = useTranslation();
  const c = t(`volunteerPage.success.${topic}`, { returnObjects: true }) as SuccessBlock;
  return (
    <div className="text-white text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto h-20 w-20 rounded-full bg-white/15 backdrop-blur flex items-center justify-center ring-4 ring-white/20">
        <PartyPopper className="h-10 w-10 text-white" />
      </div>
      <h3 className="mt-6 text-2xl md:text-3xl font-extrabold tracking-tight">{c.title}</h3>
      <p className="mt-2 text-white/90 font-semibold">{c.subtitle}</p>
      <p className="mt-4 text-white/85 leading-relaxed text-sm md:text-base">{c.message}</p>

      <div className="mt-6 rounded-card bg-white/10 backdrop-blur border border-white/20 p-5 text-left">
        <div className="text-xs font-bold uppercase tracking-wider text-white/70 mb-3">
          {t("volunteerPage.success.nextStepHeader")}
        </div>
        <ul className="space-y-2.5">
          {c.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-white/95">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-btn bg-white/10 border border-white/30 text-white font-semibold py-3 px-6 hover:bg-white/20 transition-colors"
        >
          <RotateCcw className="h-4 w-4" /> {t("volunteerPage.success.newApplication")}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/75">
        <a href={`tel:${site.whatsapp}`} className="inline-flex items-center gap-1.5 hover:text-white">
          <Phone className="h-3.5 w-3.5" /> {site.whatsapp}
        </a>
        <a href={`mailto:${site.email || "info@unite.org"}`} className="inline-flex items-center gap-1.5 hover:text-white">
          <Mail className="h-3.5 w-3.5" /> {site.email || "info@unite.org"}
        </a>
      </div>
    </div>
  );
};

const FieldLight = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-xs font-semibold text-white/90 mb-1.5 block">{label}</span>
    {children}
  </label>
);

const SubmitButton = ({ children }: { children?: React.ReactNode }) => {
  const { t } = useTranslation();
  return (
    <>
      <button
        type="submit"
        className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-btn bg-white text-primary font-bold py-3.5 hover:bg-white/90 transition-colors"
      >
        <Send className="h-4 w-4" /> {children ?? t("volunteerPage.next")}
        <ChevronRight className="h-4 w-4" />
      </button>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/80 pt-2">
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />{t("volunteerPage.secureInfo")}</span>
        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{t("volunteerPage.respondTime")}</span>
      </div>
    </>
  );
};

const FormHeader = ({ title, sub }: { title: string; sub: string }) => (
  <>
    <h3 className="text-xl md:text-2xl font-bold">{title}</h3>
    <p className="text-white/85 text-sm mt-2 leading-relaxed">{sub}</p>
  </>
);

const useSchemas = () => {
  const { t } = useTranslation();
  return useMemo(() => {
    const baseContact = {
      name: z.string().trim().min(2, t("volunteerPage.err.name")).max(80),
      phone: z.string().trim().regex(/^01[3-9]\d{8}$/, t("volunteerPage.err.phone")),
      email: z.string().trim().email(t("volunteerPage.err.email")).max(255).or(z.literal("")),
      city: z.string().trim().min(2, t("volunteerPage.err.city")).max(80),
    };
    return {
      regular: z.object({
        ...baseContact,
        area: z.string().min(1, t("volunteerPage.err.area")),
        amount: z.string().min(1, t("volunteerPage.err.amount")),
        method: z.string().min(1, t("volunteerPage.err.method")),
        note: z.string().trim().max(500).or(z.literal("")),
      }),
      member: z.object({
        ...baseContact,
        profession: z.string().trim().max(120).or(z.literal("")),
        type: z.string().min(1, t("volunteerPage.err.membership")),
        address: z.string().trim().min(5, t("volunteerPage.err.address")).max(300),
        note: z.string().trim().max(500).or(z.literal("")),
      }),
    };
  }, [t]);
};

const useShowError = () => {
  const { t } = useTranslation();
  return (msg?: string) =>
    toast({ title: t("volunteerPage.errValidate"), description: msg, variant: "destructive" });
};

// ============================================================
// Dynamic forms (schemas managed from the dashboard's Form Manager).
import { useFormSchema } from "@/hooks/api/useForms";
import { DynamicForm } from "@/components/forms/DynamicForm";

type SubmittedVals = Record<string, string | number | boolean | string[]>;
const stringVal = (v: unknown) => (Array.isArray(v) ? v.join(", ") : v == null ? "" : String(v));
const buildBody = (schema: { fields: { key: string; label: string; type: string }[] }, vals: SubmittedVals) =>
  schema.fields
    .filter((f) => f.type !== "section" && f.type !== "checkbox")
    .map((f) => `${f.label}: ${stringVal(vals[f.key]) || "-"}`)
    .join("\n");

const RegularForm = () => {
  const { t } = useTranslation();
  const { data: schema } = useFormSchema("donor");
  const [done, setDone] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  if (!schema) return null;
  if (done) return <SuccessCard topic="regular" onReset={() => { setDone(false); setResetKey((k) => k + 1); }} />;
  return (
    <>
      <FormHeader title={schema.title} sub={schema.subtitle} />
      <div className="mt-6">
        <DynamicForm
          key={resetKey}
          schema={schema}
          submitLabel={t("volunteerPage.submit")}
          onSubmit={async (vals) => {
            const ok = await saveApplication("donor", {
              name: stringVal(vals.name),
              phone: stringVal(vals.phone),
              email: stringVal(vals.email),
              profession: stringVal(vals.area),
              message: stringVal(vals.note),
              extra: vals,
            });
            if (ok) setDone(true);
          }}
        />
      </div>
    </>
  );
};

const MonthlyForm = () => {
  const { t } = useTranslation();
  const { data: schema } = useFormSchema("monthly");
  const [done, setDone] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  if (!schema) return null;
  if (done) return <SuccessCard topic="regular" onReset={() => { setDone(false); setResetKey((k) => k + 1); }} />;
  return (
    <>
      <FormHeader title={schema.title} sub={schema.subtitle} />
      <div className="mt-6">
        <DynamicForm
          key={resetKey}
          schema={schema}
          submitLabel={t("volunteerPage.submit")}
          onSubmit={async (vals) => {
            const ok = await saveApplication("donor", {
              name: stringVal(vals.name),
              phone: stringVal(vals.phone),
              email: stringVal(vals.email),
              profession: stringVal(vals.area),
              message: stringVal(vals.note),
              extra: { ...vals, plan: "monthly" },
            });
            if (ok) setDone(true);
          }}
        />
      </div>
    </>
  );
};

const MemberForm = () => {
  const { t } = useTranslation();
  const { data: schema } = useFormSchema("member");
  const [done, setDone] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  if (!schema) return null;
  if (done) return <SuccessCard topic="member" onReset={() => { setDone(false); setResetKey((k) => k + 1); }} />;
  return (
    <>
      <FormHeader title={schema.title} sub={schema.subtitle} />
      <div className="mt-6">
        <DynamicForm
          key={resetKey}
          schema={schema}
          submitLabel={t("volunteerPage.submit")}
          onSubmit={async (vals) => {
            const ok = await saveApplication("member", {
              name: stringVal(vals.name),
              phone: stringVal(vals.phone),
              email: stringVal(vals.email),
              address: stringVal(vals.address),
              profession: stringVal(vals.profession),
              message: stringVal(vals.note),
              extra: vals,
            });
            if (ok) setDone(true);
          }}
        />
      </div>
    </>
  );
};

export const MembershipDonorSection = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState<TabKey>("member");

  return (
    <section id="join-us" className="py-14 md:py-20 border-t border-border bg-secondary/20">
      <div className="container-page">
        <div className="max-w-3xl">
          <h2 className="text-2xl md:text-4xl font-bold leading-tight">
            {t("volunteerPage.sectionTitle")}
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            {t("volunteerPage.sectionSubtitle")}
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-10 rounded-card border border-border bg-card p-2 md:p-3 shadow-[var(--shadow-card)]">
          <div className="grid grid-cols-3 gap-2">
            {tabsBase.map((tb) => {
              const isActive = tb.key === active;
              const Icon = tb.icon;
              return (
                <button
                  key={tb.key}
                  type="button"
                  onClick={() => setActive(tb.key)}
                  aria-pressed={isActive}
                  className={
                    "group flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 py-5 md:py-6 px-3 rounded-xl text-sm md:text-base font-semibold text-center transition-colors " +
                    (isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/70 hover:bg-secondary hover:text-foreground")
                  }
                >
                  <span
                    className={
                      "h-10 w-10 rounded-full flex items-center justify-center transition-colors " +
                      (isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-primary group-hover:bg-accent")
                    }
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>{tb.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info strip */}
        <div className="mt-5 rounded-card bg-accent/60 border border-accent px-5 md:px-6 py-4 text-sm md:text-base text-foreground/80 text-center">
          {t("volunteerPage.infoStripPre")}
          <a
            href={`mailto:${site.email || "info@unite.org"}`}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {site.email || "info@unite.org"}
          </a>
          {t("volunteerPage.infoStripPost")}
        </div>

        {/* Two-column content */}
        <div className="mt-14 grid lg:grid-cols-2 gap-10 items-start">
          <LeftPanel active={active} />

          <div
            className="rounded-card overflow-hidden shadow-[var(--shadow-card-hover)] scroll-mt-28"
            style={{
              background:
                "linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(142 56% 18%) 100%)",
            }}
          >
            <div className="p-7 md:p-9 text-white">
              {active === "regular" && <RegularForm />}
              {active === "member" && <MemberForm />}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .vol-input{width:100%;padding:0.7rem 0.9rem;border-radius:10px;border:1px solid rgba(255,255,255,0.25);background:rgba(255,255,255,0.12);color:#fff;outline:none;transition:all .2s;font-size:0.95rem}
        .vol-input::placeholder{color:rgba(255,255,255,0.6)}
        .vol-input:focus{border-color:#fff;background:rgba(255,255,255,0.2);box-shadow:0 0 0 3px rgba(255,255,255,0.15)}
        .vol-input option{color:#1a1a1a}
      `}</style>
    </section>
  );
};

export default MembershipDonorSection;
