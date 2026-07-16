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

type TabKey = "volunteer" | "representative";

const tabsBase: { key: TabKey; labelKey: string; icon: typeof HandHeart }[] = [
  { key: "volunteer", labelKey: "volunteerPage.tabVolunteer", icon: HandHeart },
  { key: "representative", labelKey: "volunteerPage.tabRep", icon: UserPlus },
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

  return (
    <SiteLayout>
      <Seo
        title={t("volunteerPage.seoTitle")}
        description={t("volunteerPage.seoDesc")}
        canonical="/volunteer"
      />

      {/* HERO */}
      <section className="relative isolate">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--primary) / 0.92) 0%, hsl(var(--primary)) 100%)",
          }}
        />
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
          <div className="mt-10 mx-auto max-w-2xl rounded-card border border-border bg-card p-2 md:p-3 shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-2 gap-2">
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
                    <span>{t(tb.labelKey)}</span>
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

// ============================================================
// Left panel
type LeftBlock = {
  title: string;
  intro: string;
  list: string[];
  stats: { v: string; l: string }[];
  quoteText?: string;
  quoteSource?: string;
};

const LeftPanel = ({ active }: { active: TabKey }) => {
  const { t } = useTranslation();
  const c = t(`volunteerPage.left.${active}`, { returnObjects: true }) as LeftBlock;
  return (
    <div>
      <p className="text-base md:text-lg leading-relaxed text-foreground/85">{c.intro}</p>
      {c.quoteText && (
        <blockquote className="mt-6 rounded-card border-l-4 border-primary bg-accent/40 p-5 text-foreground/80 italic leading-relaxed">
          {c.quoteText}{" "}
          <span className="not-italic text-sm text-muted-foreground">{c.quoteSource}</span>
        </blockquote>
      )}
      <h3 className="mt-8 text-xl font-bold">{c.title}</h3>
      <ul className="mt-4 space-y-3">
        {c.list.map((s) => (
          <li key={s} className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <span className="text-foreground/80 leading-relaxed">{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
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

export default Volunteer;
