import { useState, useMemo } from "react";
import {
  HandHeart,
  Users,
  UserPlus,
  Send,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  PartyPopper,
  Phone,
  Mail,
  RotateCcw,
} from "lucide-react";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";

import { site } from "@/data/site";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useSettings } from "@/hooks/api/useDashboardData";

// Save the submission to the backend so it appears in the dashboard.
// Returns true on success — surfaces server errors so the user sees them
// instead of an always-green "সফল" card that never actually persisted.
const saveApplication = async (
  kind: "volunteer" | "career",
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
    console.error("[volunteer] submit failed:", err);
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

type TabKey = "volunteer" | "representative" | "monthly" | "member";

const tabsBase: { key: TabKey; labelKey?: string; label?: string; icon: typeof HandHeart }[] = [
  { key: "volunteer", labelKey: "volunteerPage.tabVolunteer", icon: HandHeart },
  { key: "representative", labelKey: "volunteerPage.tabRep", icon: UserPlus },
  { key: "monthly", label: "মাসিক দাতা", icon: Clock },
  { key: "member", label: "আজীবন দাতা", icon: ShieldCheck },
];

// ---------- Helpers ----------
const buildWhatsAppUrl = (title: string, body: string, orgName: string) => {
  const text = `*${title} — ${orgName}*\n\n${body}`;
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
};

// ============================================================
const Volunteer = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState<TabKey>("volunteer");
  const { data: settings } = useSettings();
  const heroImage = settings?.page_heroes?.volunteer || "";

  return (
    <SiteLayout>
      <Seo
        title={t("volunteerPage.seoTitle")}
        description={t("volunteerPage.seoDesc")}
        canonical="/member"
      />

      {/* HERO */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10">
          {heroImage && (
            <img
              src={heroImage}
              alt={t("volunteerPage.heroTitle")}
              className="h-full w-full object-cover"
              loading="eager"
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background: heroImage
                ? "linear-gradient(180deg, hsl(var(--primary) / 0.78) 0%, hsl(var(--primary) / 0.88) 100%)"
                : "linear-gradient(180deg, hsl(var(--primary) / 0.92) 0%, hsl(var(--primary)) 100%)",
            }}
          />
        </div>
        <div className="container-page py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            {t("volunteerPage.heroTitle")}
          </h1>
          <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-white/70" />
        </div>
      </section>


      {/* TABS + FORMS */}
      <section className="py-14 md:py-20">
        <div className="container-page">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-bold leading-tight">
              {t("volunteerPage.sectionTitle")}
            </h2>
            <div className="mx-auto mt-4 h-1 w-14 rounded-full bg-primary/70" />
            <p className="text-muted-foreground mt-4 leading-relaxed">
              {t("volunteerPage.sectionSubtitle")}
            </p>
          </div>

          {/* Tabs */}
          <div className="mt-10 mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
                      "group relative flex flex-col items-center justify-center gap-3 md:gap-4 p-6 md:p-8 rounded-2xl md:rounded-3xl border-2 transition-all duration-300 " +
                      (isActive
                        ? "bg-primary border-primary text-white shadow-lg scale-[1.02] z-10"
                        : "bg-card border-border/50 text-foreground/70 hover:border-primary/30 hover:bg-secondary/50 hover:scale-[1.01]")
                    }
                  >
                    <div
                      className={
                        "h-14 w-14 md:h-16 md:w-16 rounded-2xl flex items-center justify-center transition-all duration-300 " +
                        (isActive
                          ? "bg-white/20 text-white rotate-3"
                          : "bg-secondary text-primary group-hover:bg-primary/10 group-hover:-rotate-3")
                      }
                    >
                      <Icon className="h-7 w-7 md:h-8 md:w-8" />
                    </div>
                    <span className="text-base md:text-lg font-bold tracking-tight">
                      {tb.labelKey ? t(tb.labelKey) : tb.label}
                    </span>
                    {isActive && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rotate-45 rounded-sm" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info strip */}
          <div className="mt-5 rounded-card bg-accent/60 border border-accent px-5 md:px-6 py-4 text-sm md:text-base text-foreground/80 text-center">
            {t("volunteerPage.infoStripPre")}
            <a
              href={`https://wa.me/${site.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              WhatsApp
            </a>
            {t("volunteerPage.infoStripPost")}

          </div>

          {/* Two-column content */}
          <div className="mt-14 grid lg:grid-cols-2 gap-10 items-start">
            <LeftPanel active={active} />

            <div
              id="apply"
              className="rounded-card overflow-hidden shadow-[var(--shadow-card-hover)] scroll-mt-28"
              style={{
                background:
                  "linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(142 56% 18%) 100%)",
              }}
            >
              <div className="p-7 md:p-9 text-white">
                {active === "volunteer" && <VolunteerForm />}
                {active === "representative" && <RepresentativeForm />}
                {active === "monthly" && <MonthlyForm />}
                {active === "member" && <MemberForm />}
              </div>
            </div>
          </div>

          {/* Bottom helper row */}
          <div className="mt-14 grid md:grid-cols-3 gap-4">
            <div className="card-base p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-accent text-primary flex items-center justify-center shrink-0">
                <HandHeart className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold">{t("volunteerPage.quickWATitle")}</h4>
                <a
                  href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(t("volunteerPage.quickWAMsg"))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  {t("volunteerPage.quickWAText")}
                </a>
              </div>
            </div>
            <div className="card-base p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-accent text-primary flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold">{t("volunteerPage.officeTitle")}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{site.address}</p>
              </div>
            </div>
            <div className="card-base p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-accent text-primary flex items-center justify-center shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold">{t("volunteerPage.hoursTitle")}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("volunteerPage.hoursValue")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .vol-input{width:100%;padding:0.7rem 0.9rem;border-radius:10px;border:1px solid rgba(255,255,255,0.25);background:rgba(255,255,255,0.12);color:#fff;outline:none;transition:all .2s;font-size:0.95rem}
        .vol-input::placeholder{color:rgba(255,255,255,0.6)}
        .vol-input:focus{border-color:#fff;background:rgba(255,255,255,0.2);box-shadow:0 0 0 3px rgba(255,255,255,0.15)}
        .vol-input option{color:#1a1a1a}
      `}</style>
    </SiteLayout>
  );
};

// Left panel — reads the editorial copy + banner from the dashboard-managed
// form schema (extras). Falls back to translation for the older `intro/list/
// quote` values only when the schema is still loading.
import { useFormSchema as useSchemaForLeft } from "@/hooks/api/useForms";
import { FormSideContent } from "@/components/forms/FormSideContent";

const LeftPanel = ({ active }: { active: TabKey }) => {
  const { data: schema } = useSchemaForLeft(active);
  return <FormSideContent extras={schema?.extras} />;
};

// ============================================================
// Success card
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

      {c.bullets && c.bullets.length > 0 && (
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
      )}

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

// ============================================================
// Shared form chrome
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

// ---------- Schemas via translation ----------
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
      volunteer: z.object({
        ...baseContact,
        age: z.string().trim().min(1, t("volunteerPage.err.age")),
        profession: z.string().trim().max(120).or(z.literal("")),
        area: z.string().min(1, t("volunteerPage.err.interest")),
        availability: z.string().min(1, t("volunteerPage.err.availability")),
        motivation: z.string().trim().min(10, t("volunteerPage.err.motivation")).max(1000),
      }),
      representative: z.object({
        fullName: z.string().trim().min(2, t("volunteerPage.err.fullName")).max(120),
        guardianName: z.string().trim().min(2, t("volunteerPage.err.guardianName")).max(120),
        dob: z.string().trim().min(1, t("volunteerPage.err.dob")),
        nid: z.string().trim().regex(/^\d{10,17}$/, t("volunteerPage.err.nid")),
        currentAddress: z.string().trim().min(5, t("volunteerPage.err.currentAddr")).max(300),
        permanentAddress: z.string().trim().min(5, t("volunteerPage.err.permanentAddr")).max(300),
        profession: z.string().min(1, t("volunteerPage.err.profession")),
        educationMediums: z.array(z.string()).min(1, t("volunteerPage.err.medium")),
        educationDetails: z.string().trim().min(2, t("volunteerPage.err.education")).max(500),
        whatsapp: z.string().trim().regex(/^01[3-9]\d{8}$/, t("volunteerPage.err.whatsapp")),
        email: z.string().trim().email(t("volunteerPage.err.email")).max(255).or(z.literal("")),
        socialLink: z.string().trim().url(t("volunteerPage.err.socialLink")).or(z.literal("")),
        district: z.string().trim().min(2, t("volunteerPage.err.district")).max(80),
        experience: z.string().trim().max(1000).or(z.literal("")),
        whyJoin: z.string().trim().min(10, t("volunteerPage.err.whyJoin")).max(1000),
        emergencyName: z.string().trim().min(2, t("volunteerPage.err.emergencyName")).max(120),
        emergencyPhone: z.string().trim().regex(/^01[3-9]\d{8}$/, t("volunteerPage.err.emergencyPhone")),
        political: z.string().min(1, t("volunteerPage.err.political")),
        politicalDetails: z.string().trim().max(500).or(z.literal("")),
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
import { Link } from "react-router-dom";

type SubmittedVals = Record<string, string | number | boolean | string[]>;

const stringVal = (v: unknown) => (Array.isArray(v) ? v.join(", ") : v == null ? "" : String(v));

const buildWhatsAppBody = (schema: { fields: { key: string; label: string; type: string }[] }, vals: SubmittedVals) =>
  schema.fields
    .filter((f) => f.type !== "section" && f.type !== "checkbox")
    .map((f) => `${f.label}: ${stringVal(vals[f.key]) || "-"}`)
    .join("\n");

const VolunteerForm = () => {
  const { t } = useTranslation();
  const { data: schema } = useFormSchema("volunteer");
  const [done, setDone] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  if (!schema) return null;
  if (done) return <SuccessCard topic="volunteer" onReset={() => { setDone(false); setResetKey((k) => k + 1); }} />;

  return (
    <>
      <FormHeader title={schema.title} sub={schema.subtitle} />
      <div className="mt-6">
        <DynamicForm
          key={resetKey}
          schema={schema}
          submitLabel={t("volunteerPage.submit")}
          onSubmit={async (vals) => {
            const ok = await saveApplication("volunteer", {
              name: stringVal(vals.name),
              phone: stringVal(vals.phone),
              email: stringVal(vals.email),
              profession: stringVal(vals.profession),
              message: stringVal(vals.motivation),
              extra: vals,
            });
            if (ok) setDone(true);
          }}
        />
      </div>
    </>
  );
};

const RepresentativeForm = () => {
  const { t } = useTranslation();
  const { data: schema } = useFormSchema("representative");
  const [done, setDone] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  if (!schema) return null;
  if (done) return <SuccessCard topic="representative" onReset={() => { setDone(false); setResetKey((k) => k + 1); }} />;

  return (
    <>
      <FormHeader title={schema.title} sub={schema.subtitle} />
      <div className="mt-6">
        <DynamicForm
          key={resetKey}
          schema={schema}
          submitLabel={t("volunteerPage.submit")}
          onSubmit={async (vals) => {
            const ok = await saveApplication("career", {
              name: stringVal(vals.fullName || vals.name),
              phone: stringVal(vals.whatsapp || vals.phone),
              email: stringVal(vals.email),
              address: stringVal(vals.currentAddress),
              profession: stringVal(vals.profession),
              message: stringVal(vals.whyJoin),
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
  if (done) return <SuccessCard topic="monthly" onReset={() => { setDone(false); setResetKey((k) => k + 1); }} />;
  return (
    <>
      <FormHeader title={schema.title} sub={schema.subtitle} />
      <div className="mt-6">
        <DynamicForm
          key={resetKey}
          schema={schema}
          submitLabel={t("volunteerPage.submit")}
          onSubmit={async (vals) => {
            const ok = await saveApplication("career", {
              name: stringVal(vals.name),
              phone: stringVal(vals.phone),
              email: stringVal(vals.email),
              profession: stringVal(vals.area),
              message: stringVal(vals.note),
              extra: { ...vals, plan: "monthly", type: "donor" },
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
            const ok = await saveApplication("career", {
              name: stringVal(vals.name),
              phone: stringVal(vals.phone),
              email: stringVal(vals.email),
              address: stringVal(vals.address),
              profession: stringVal(vals.profession),
              message: stringVal(vals.note),
              extra: { ...vals, type: "member" },
            });
            if (ok) setDone(true);
          }}
        />
      </div>
    </>
  );
};

export default Volunteer;
