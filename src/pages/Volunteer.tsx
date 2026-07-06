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
import volunteerImg from "@/assets/program-food.jpg";
import { site } from "@/data/site";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

// Best-effort submit to backend so entries appear in the dashboard.
const saveApplication = (
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
) => {
  api.post(`/applications/${kind}`, payload, { auth: false }).catch(() => {});
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
        <div className="absolute inset-0 -z-10">
          <img src={volunteerImg} alt={t("volunteerPage.heroTitle")} className="h-full w-full object-cover" loading="eager" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, hsl(var(--primary) / 0.78) 0%, hsl(var(--primary) / 0.88) 100%)",
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
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-4xl font-bold leading-tight">
              {t("volunteerPage.sectionTitle")}
            </h2>
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
      <div className="mt-8 grid grid-cols-3 gap-3">
        {c.stats.map((s) => (
          <div key={s.l} className="rounded-card bg-secondary/60 p-4 text-center">
            <div className="text-xl md:text-2xl font-extrabold text-primary">{s.v}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </div>
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
  waUrl,
  onReset,
}: {
  topic: TabKey;
  waUrl: string;
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

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-btn bg-white text-primary font-bold py-3 hover:bg-white/90 transition-colors"
        >
          <Send className="h-4 w-4" /> {c.nextStep}
        </a>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-btn bg-white/10 border border-white/30 text-white font-semibold py-3 hover:bg-white/20 transition-colors"
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
// 3) VOLUNTEER FORM
const VolunteerForm = () => {
  const { t } = useTranslation();
  const schemas = useSchemas();
  const showError = useShowError();
  const orgName = t("volunteerPage.orgName");
  const dash = t("volunteerPage.dash");
  const volunteerAreas = t("volunteerPage.volunteerAreas", { returnObjects: true }) as string[];
  const availabilityOptions = t("volunteerPage.availabilityOptions", { returnObjects: true }) as string[];

  const init = { name: "", phone: "", email: "", age: "", city: "", profession: "", area: "", availability: "", motivation: "" };
  const [f, setF] = useState(init);
  const [waUrl, setWaUrl] = useState<string | null>(null);
  const u = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schemas.volunteer.safeParse(f);
    if (!r.success) return showError(r.error.issues[0]?.message);
    saveApplication("volunteer", {
      name: f.name, phone: f.phone, email: f.email,
      profession: f.profession, message: f.motivation,
      extra: { age: f.age, city: f.city, area: f.area, type: f.area, availability: f.availability },
    });
    setWaUrl(buildWhatsAppUrl(
      t("volunteerPage.wa.volunteerTitle"),
      `${t("volunteerPage.wa.lName")}: ${f.name}\n${t("volunteerPage.wa.lPhone")}: ${f.phone}\n${t("volunteerPage.wa.lEmail")}: ${f.email || dash}\n${t("volunteerPage.wa.lAge")}: ${f.age}\n${t("volunteerPage.wa.lCity")}: ${f.city}\n${t("volunteerPage.wa.lProfession")}: ${f.profession || dash}\n\n${t("volunteerPage.wa.lInterest")}: ${f.area}\n${t("volunteerPage.wa.lAvailability")}: ${f.availability}\n\n${t("volunteerPage.wa.lWhy")}:\n${f.motivation}`,
      orgName,
    ));
  };
  if (waUrl) return <SuccessCard topic="volunteer" waUrl={waUrl} onReset={() => { setF(init); setWaUrl(null); }} />;
  return (
    <>
      <FormHeader title={t("volunteerPage.header.volunteerTitle")} sub={t("volunteerPage.header.volunteerSub")} />
      <form onSubmit={submit} className="mt-6 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <FieldLight label={t("volunteerPage.form.fullName")}><input required maxLength={80} value={f.name} onChange={u("name")} className="vol-input" /></FieldLight>
          <FieldLight label={t("volunteerPage.form.phone")}><input required type="tel" inputMode="numeric" maxLength={11} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "") })} placeholder="01XXXXXXXXX" className="vol-input" /></FieldLight>
          <FieldLight label={t("volunteerPage.form.email")}><input type="email" maxLength={255} value={f.email} onChange={u("email")} className="vol-input" /></FieldLight>
          <FieldLight label={t("volunteerPage.form.age")}><input required type="number" min={14} max={80} value={f.age} onChange={u("age")} className="vol-input" /></FieldLight>
          <FieldLight label={t("volunteerPage.form.city")}><input required maxLength={80} value={f.city} onChange={u("city")} className="vol-input" /></FieldLight>
          <FieldLight label={t("volunteerPage.form.professionStudent")}><input maxLength={120} value={f.profession} onChange={u("profession")} className="vol-input" placeholder={t("volunteerPage.form.professionPh2")} /></FieldLight>
        </div>
        <FieldLight label={t("volunteerPage.form.interest")}>
          <select required value={f.area} onChange={u("area")} className="vol-input">
            <option value="">{t("volunteerPage.select")}</option>
            {volunteerAreas.map((a) => <option key={a} value={a}>{a}</option>)}
            <option value={t("volunteerPage.otherOption")}>{t("volunteerPage.otherOption")}</option>
          </select>
        </FieldLight>
        <FieldLight label={t("volunteerPage.form.weeklyTime")}>
          <select required value={f.availability} onChange={u("availability")} className="vol-input">
            <option value="">{t("volunteerPage.select")}</option>
            {availabilityOptions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </FieldLight>
        <FieldLight label={t("volunteerPage.form.whyJoin")}>
          <textarea required rows={4} maxLength={1000} value={f.motivation} onChange={u("motivation")} className="vol-input resize-none" placeholder={t("volunteerPage.form.whyJoinPh")} />
        </FieldLight>
        <SubmitButton>{t("volunteerPage.submit")}</SubmitButton>
      </form>
    </>
  );
};

// ============================================================
// 4) DISTRICT REPRESENTATIVE FORM
const RepresentativeForm = () => {
  const { t } = useTranslation();
  const schemas = useSchemas();
  const showError = useShowError();
  const orgName = t("volunteerPage.orgName");
  const dash = t("volunteerPage.dash");
  const educationMediums = t("volunteerPage.educationMediums", { returnObjects: true }) as string[];
  const professionOptions = t("volunteerPage.professionOptions", { returnObjects: true }) as string[];
  const politicalOptions = t("volunteerPage.politicalOptions", { returnObjects: true }) as string[];
  const terms = t("volunteerPage.form.terms", { returnObjects: true }) as string[];
  const yesOpt = politicalOptions[1];

  const init = {
    fullName: "", guardianName: "", dob: "", nid: "",
    currentAddress: "", permanentAddress: "", profession: "",
    educationMediums: [] as string[], educationDetails: "",
    whatsapp: "", email: "", socialLink: "", district: "",
    experience: "", whyJoin: "",
    emergencyName: "", emergencyPhone: "",
    political: politicalOptions[0], politicalDetails: "",
    agree: false,
  };
  const [f, setF] = useState(init);
  const [waUrl, setWaUrl] = useState<string | null>(null);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));
  const onIn = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    set(k, e.target.value as never);
  const toggleMedium = (m: string) => {
    const has = f.educationMediums.includes(m);
    set("educationMediums", (has ? f.educationMediums.filter((x) => x !== m) : [...f.educationMediums, m]) as never);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.agree) return showError(t("volunteerPage.err.agree"));
    const r = schemas.representative.safeParse(f);
    if (!r.success) return showError(r.error.issues[0]?.message);
    saveApplication("career", {
      name: f.fullName, phone: f.whatsapp, email: f.email,
      address: f.currentAddress, profession: f.profession, message: f.whyJoin,
      extra: {
        type: f.district, district: f.district, city: f.district,
        guardianName: f.guardianName, dob: f.dob, nid: f.nid,
        permanentAddress: f.permanentAddress,
        educationMediums: f.educationMediums, educationDetails: f.educationDetails,
        socialLink: f.socialLink, experience: f.experience,
        emergencyName: f.emergencyName, emergencyPhone: f.emergencyPhone,
        political: f.political, politicalDetails: f.politicalDetails,
      },
    });
    setWaUrl(buildWhatsAppUrl(
      t("volunteerPage.wa.repTitle"),
      `${t("volunteerPage.wa.lPersonal")}\n${t("volunteerPage.wa.lFullName")}: ${f.fullName}\n${t("volunteerPage.wa.lGuardian")}: ${f.guardianName}\n${t("volunteerPage.wa.lDob")}: ${f.dob}\n${t("volunteerPage.wa.lNid")}: ${f.nid}\n${t("volunteerPage.wa.lCurAddr")}: ${f.currentAddress}\n${t("volunteerPage.wa.lPermAddr")}: ${f.permanentAddress}\n${t("volunteerPage.wa.lDistrict")}: ${f.district}\n${t("volunteerPage.wa.lProfession")}: ${f.profession}\n\n${t("volunteerPage.wa.lEdu")}\n${t("volunteerPage.wa.lMedium")}: ${f.educationMediums.join(", ")}\n${t("volunteerPage.wa.lEduDetails")}: ${f.educationDetails}\n\n${t("volunteerPage.wa.lContact")}\n${t("volunteerPage.wa.lWhatsapp")}: ${f.whatsapp}\n${t("volunteerPage.wa.lEmail")}: ${f.email || dash}\n${t("volunteerPage.wa.lSocial")}: ${f.socialLink || dash}\n\n${t("volunteerPage.wa.lExpAndInt")}\n${t("volunteerPage.wa.lExperience")}: ${f.experience || dash}\n${t("volunteerPage.wa.lWhy")}:\n${f.whyJoin}\n\n${t("volunteerPage.wa.lEmergency")}\n${f.emergencyName} — ${f.emergencyPhone}\n\n${t("volunteerPage.wa.lPolDecl")}\n${t("volunteerPage.wa.lPolInvolved")}: ${f.political}${f.political === yesOpt ? `\n${t("volunteerPage.wa.lPolDetails")}: ${f.politicalDetails}` : ""}`,
      orgName,
    ));
  };
  if (waUrl) return <SuccessCard topic="representative" waUrl={waUrl} onReset={() => { setF(init); setWaUrl(null); }} />;
  return (
    <>
      <FormHeader title={t("volunteerPage.header.repTitle")} sub={t("volunteerPage.header.repSub")} />
      <form onSubmit={submit} className="mt-6 space-y-5">
        {/* 1. Personal */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2 border-b border-white/20 pb-1.5">{t("volunteerPage.form.secPersonal")}</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <FieldLight label={t("volunteerPage.form.fullName")}><input required maxLength={120} value={f.fullName} onChange={onIn("fullName")} className="vol-input" /></FieldLight>
            <FieldLight label={t("volunteerPage.form.guardianName")}><input required maxLength={120} value={f.guardianName} onChange={onIn("guardianName")} className="vol-input" /></FieldLight>
            <FieldLight label={t("volunteerPage.form.dob")}><input required type="date" value={f.dob} onChange={onIn("dob")} className="vol-input" /></FieldLight>
            <FieldLight label={t("volunteerPage.form.nid")}><input required inputMode="numeric" maxLength={17} value={f.nid} onChange={(e) => set("nid", e.target.value.replace(/\D/g, "") as never)} className="vol-input" /></FieldLight>
            <FieldLight label={t("volunteerPage.form.district")}><input required maxLength={80} value={f.district} onChange={onIn("district")} className="vol-input" placeholder={t("volunteerPage.form.districtPh")} /></FieldLight>
            <FieldLight label={t("volunteerPage.form.professionReq")}>
              <select required value={f.profession} onChange={onIn("profession")} className="vol-input">
                <option value="">{t("volunteerPage.select")}</option>
                {professionOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </FieldLight>
          </div>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <FieldLight label={t("volunteerPage.form.currentAddr")}><textarea required rows={2} maxLength={300} value={f.currentAddress} onChange={onIn("currentAddress")} className="vol-input resize-none" /></FieldLight>
            <FieldLight label={t("volunteerPage.form.permanentAddr")}><textarea required rows={2} maxLength={300} value={f.permanentAddress} onChange={onIn("permanentAddress")} className="vol-input resize-none" /></FieldLight>
          </div>
        </div>

        {/* 2. Education */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2 border-b border-white/20 pb-1.5">{t("volunteerPage.form.secEdu")}</div>
          <div className="text-xs text-white/80 mb-2">{t("volunteerPage.form.eduMediumHint")}</div>
          <div className="grid sm:grid-cols-3 gap-2">
            {educationMediums.map((m) => {
              const checked = f.educationMediums.includes(m);
              return (
                <label key={m} className={`cursor-pointer flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${checked ? "bg-white/25 border-white text-white" : "bg-white/10 border-white/25 text-white/85 hover:bg-white/15"}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggleMedium(m)} className="accent-white" />
                  <span>{m}</span>
                </label>
              );
            })}
          </div>
          <div className="mt-3">
            <FieldLight label={t("volunteerPage.form.eduDetails")}>
              <textarea required rows={2} maxLength={500} value={f.educationDetails} onChange={onIn("educationDetails")} className="vol-input resize-none" placeholder={t("volunteerPage.form.eduDetailsPh")} />
            </FieldLight>
          </div>
        </div>

        {/* 3. Contact */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2 border-b border-white/20 pb-1.5">{t("volunteerPage.form.secContact")}</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <FieldLight label={t("volunteerPage.form.whatsapp")}><input required type="tel" inputMode="numeric" maxLength={11} value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, "") as never)} placeholder="01XXXXXXXXX" className="vol-input" /></FieldLight>
            <FieldLight label={t("volunteerPage.form.emailAddr")}><input type="email" maxLength={255} value={f.email} onChange={onIn("email")} className="vol-input" /></FieldLight>
          </div>
          <div className="mt-3">
            <FieldLight label={t("volunteerPage.form.socialLink")}>
              <input type="url" value={f.socialLink} onChange={onIn("socialLink")} className="vol-input" placeholder={t("volunteerPage.form.socialLinkPh")} />
            </FieldLight>
          </div>
        </div>

        {/* 4. Experience */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2 border-b border-white/20 pb-1.5">{t("volunteerPage.form.secExp")}</div>
          <FieldLight label={t("volunteerPage.form.experience")}>
            <textarea rows={3} maxLength={1000} value={f.experience} onChange={onIn("experience")} className="vol-input resize-none" placeholder={t("volunteerPage.form.experiencePh")} />
          </FieldLight>
          <div className="mt-3">
            <FieldLight label={t("volunteerPage.form.whyRepJoin")}>
              <textarea required rows={4} maxLength={1000} value={f.whyJoin} onChange={onIn("whyJoin")} className="vol-input resize-none" />
            </FieldLight>
          </div>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <FieldLight label={t("volunteerPage.form.emergencyName")}><input required maxLength={120} value={f.emergencyName} onChange={onIn("emergencyName")} className="vol-input" /></FieldLight>
            <FieldLight label={t("volunteerPage.form.emergencyPhone")}><input required type="tel" inputMode="numeric" maxLength={11} value={f.emergencyPhone} onChange={(e) => set("emergencyPhone", e.target.value.replace(/\D/g, "") as never)} placeholder="01XXXXXXXXX" className="vol-input" /></FieldLight>
          </div>
        </div>

        {/* 5. Political */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2 border-b border-white/20 pb-1.5">{t("volunteerPage.form.secPolitical")}</div>
          <div className="text-xs text-white/80 mb-2">{t("volunteerPage.form.politicalQ")}</div>
          <div className="grid grid-cols-2 gap-2">
            {politicalOptions.map((v) => (
              <label key={v} className={`cursor-pointer flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${f.political === v ? "bg-white/25 border-white text-white" : "bg-white/10 border-white/25 text-white/85 hover:bg-white/15"}`}>
                <input type="radio" name="political" checked={f.political === v} onChange={() => set("political", v)} className="accent-white" />
                <span>{v}</span>
              </label>
            ))}
          </div>
          {f.political === yesOpt && (
            <div className="mt-3">
              <FieldLight label={t("volunteerPage.form.politicalDetails")}>
                <textarea required rows={2} maxLength={500} value={f.politicalDetails} onChange={onIn("politicalDetails")} className="vol-input resize-none" placeholder={t("volunteerPage.form.politicalDetailsPh")} />
              </FieldLight>
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="rounded-lg bg-white/10 border border-white/20 p-4 text-xs text-white/85 leading-relaxed">
          <div className="font-bold text-white mb-1.5">{t("volunteerPage.form.termsTitle")}</div>
          <ol className="list-decimal pl-4 space-y-1">
            {terms.map((tm) => <li key={tm}>{tm}</li>)}
          </ol>
          <div className="mt-3 font-semibold text-white">{t("volunteerPage.form.privacyTitle")}</div>
          <p className="mt-1">{t("volunteerPage.form.privacyText")}</p>
        </div>

        <label className="flex items-start gap-2.5 text-sm text-white/90 cursor-pointer">
          <input type="checkbox" checked={f.agree} onChange={(e) => set("agree", e.target.checked as never)} className="mt-1 accent-white" />
          <span>{t("volunteerPage.form.agreeTerms")}</span>
        </label>

        <SubmitButton>{t("volunteerPage.submit")}</SubmitButton>
      </form>
    </>
  );
};

export default Volunteer;
