import { useState } from "react";
import {
  HandHeart,
  HeartHandshake,
  Users,
  UserPlus,
  Repeat,
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
import { Seo } from "@/components/Seo";
import { SiteLayout } from "@/components/layout/SiteLayout";
import volunteerImg from "@/assets/program-food.jpg";
import { site } from "@/data/site";
import { toast } from "@/hooks/use-toast";

type TabKey = "regular" | "member" | "volunteer" | "representative";

const tabs: { key: TabKey; label: string; icon: typeof HandHeart }[] = [
  { key: "regular", label: "নিয়মিত দাতা", icon: Repeat },
  { key: "member", label: "আজীবন ও দাতা সদস্য", icon: HeartHandshake },
  { key: "volunteer", label: "স্বেচ্ছাসেবক", icon: HandHeart },
  { key: "representative", label: "জেলা প্রতিনিধি", icon: UserPlus },
];


// ---------- Topic-specific options ----------
const regularAreas = [
  "এতিম ও সুবিধাবঞ্চিত শিশু",
  "শিক্ষা সহায়তা",
  "মাসিক খাদ্য সহায়তা",
  "চিকিৎসা সহায়তা",
  "মসজিদ ও দাওয়াহ",
  "যেখানে প্রয়োজন সেখানে",
];
const regularAmounts = ["৫০০", "১০০০", "২০০০", "৫০০০", "১০০০০", "অন্যান্য"];

const membershipTypes = [
  { value: "lifetime", label: "আজীবন সদস্য — এককালীন ৳৫০,০০০" },
  { value: "donor", label: "দাতা সদস্য — এককালীন ৳২৫,০০০" },
  { value: "honorary", label: "সম্মানিত সদস্য — এককালীন ৳১,০০,০০০+" },
];

const volunteerAreas = [
  "ত্রাণ বিতরণ",
  "শিক্ষা ও মেন্টরশিপ",
  "স্বাস্থ্যসেবা ক্যাম্প",
  "ক্যাম্পেইন ও ফান্ডরাইজিং",
  "মিডিয়া ও কনটেন্ট",
  "মসজিদ ও দাওয়াহ",
];

const educationMediums = [
  "কওমী মাদরাসা",
  "আলিয়া মাদরাসা",
  "জেনারেল (কলেজ/বিশ্ববিদ্যালয়)",
];

const professionOptions = ["চাকরিজীবী", "ব্যবসায়ী", "ছাত্র", "অন্যান্য"];


// ---------- Schemas ----------
const baseContact = {
  name: z.string().trim().min(2, "নাম লিখুন").max(80),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন"),
  email: z.string().trim().email("সঠিক ই-মেইল দিন").max(255).or(z.literal("")),
  city: z.string().trim().min(2, "শহর/জেলা লিখুন").max(80),
};

const regularSchema = z.object({
  ...baseContact,
  area: z.string().min(1, "ক্ষেত্র নির্বাচন করুন"),
  amount: z.string().min(1, "পরিমাণ নির্বাচন করুন"),
  method: z.string().min(1, "পেমেন্ট মাধ্যম নির্বাচন করুন"),
  note: z.string().trim().max(500).or(z.literal("")),
});

const memberSchema = z.object({
  ...baseContact,
  profession: z.string().trim().max(120).or(z.literal("")),
  type: z.string().min(1, "সদস্যপদ নির্বাচন করুন"),
  address: z.string().trim().min(5, "পূর্ণ ঠিকানা দিন").max(300),
  note: z.string().trim().max(500).or(z.literal("")),
});

const volunteerSchema = z.object({
  ...baseContact,
  age: z.string().trim().min(1, "বয়স দিন"),
  profession: z.string().trim().max(120).or(z.literal("")),
  area: z.string().min(1, "আগ্রহের ক্ষেত্র নির্বাচন করুন"),
  availability: z.string().min(1, "সময় নির্বাচন করুন"),
  motivation: z.string().trim().min(10, "অন্তত ১০ অক্ষর লিখুন").max(1000),
});

const representativeSchema = z.object({
  fullName: z.string().trim().min(2, "পুরো নাম লিখুন").max(120),
  guardianName: z.string().trim().min(2, "পিতা/অভিভাবকের নাম লিখুন").max(120),
  dob: z.string().trim().min(1, "জন্ম তারিখ দিন"),
  nid: z.string().trim().regex(/^\d{10,17}$/, "সঠিক NID নম্বর দিন"),
  currentAddress: z.string().trim().min(5, "বর্তমান ঠিকানা দিন").max(300),
  permanentAddress: z.string().trim().min(5, "স্থায়ী ঠিকানা দিন").max(300),
  profession: z.string().min(1, "পেশা নির্বাচন করুন"),
  educationMediums: z.array(z.string()).min(1, "অন্তত একটি শিক্ষামাধ্যম নির্বাচন করুন"),
  educationDetails: z.string().trim().min(2, "শিক্ষাগত যোগ্যতার বিস্তারিত দিন").max(500),
  whatsapp: z.string().trim().regex(/^01[3-9]\d{8}$/, "সঠিক WhatsApp নম্বর দিন"),
  email: z.string().trim().email("সঠিক ই-মেইল দিন").max(255).or(z.literal("")),
  socialLink: z.string().trim().url("সঠিক সোশ্যাল মিডিয়া লিংক দিন").or(z.literal("")),
  district: z.string().trim().min(2, "জেলা লিখুন").max(80),
  experience: z.string().trim().max(1000).or(z.literal("")),
  whyJoin: z.string().trim().min(10, "অন্তত ১০ অক্ষর লিখুন").max(1000),
  emergencyName: z.string().trim().min(2, "নাম লিখুন").max(120),
  emergencyPhone: z.string().trim().regex(/^01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন"),
  political: z.enum(["না", "হ্যাঁ"], { message: "নির্বাচন করুন" }),
  politicalDetails: z.string().trim().max(500).or(z.literal("")),
});


// ---------- Helpers ----------
const buildWhatsAppUrl = (title: string, body: string) => {
  const text = `*${title} — ইউনাইট ফাউন্ডেশন*\n\n${body}`;
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
};

const showError = (msg?: string) =>
  toast({ title: "তথ্য যাচাই করুন", description: msg, variant: "destructive" });

// ---------- Per-topic success content ----------
const successContent: Record<TabKey, {
  title: string;
  subtitle: string;
  message: string;
  bullets: string[];
  nextStep: string;
}> = {
  regular: {
    title: "জাযাকাল্লাহু খাইরান!",
    subtitle: "নিয়মিত দাতা হিসেবে আপনার আবেদন গৃহীত হয়েছে",
    message:
      "আপনার নিয়মিত অবদান একটি এতিম শিশুর হাসি, একটি পরিবারের খাদ্য এবং একজন রোগীর চিকিৎসার ধারাবাহিকতা নিশ্চিত করবে — ইন শা আল্লাহ।",
    bullets: [
      "আমাদের টিম ২৪ ঘণ্টার মধ্যে যোগাযোগ করে মাসিক সেটআপ সম্পন্ন করবে",
      "প্রতি মাসে অটো-রিমাইন্ডার ও রসিদ পাবেন",
      "মাসিক ইমপ্যাক্ট রিপোর্ট সরাসরি আপনার ই-মেইলে",
    ],
    nextStep: "WhatsApp-এ বিস্তারিত পাঠান",
  },
  member: {
    title: "আলহামদুলিল্লাহ!",
    subtitle: "সদস্যপদের আবেদন গৃহীত হয়েছে",
    message:
      "আপনি এখন ইউনাইট ফাউন্ডেশনের স্থায়ী অংশীদার হওয়ার পথে। আপনার সদস্যপদ প্রতিটি দীর্ঘমেয়াদি প্রকল্পে চিরস্থায়ী অবদান রাখবে — ইন শা আল্লাহ।",
    bullets: [
      "৪৮ ঘণ্টার মধ্যে আমাদের প্রতিনিধি ফোনে যোগাযোগ করবেন",
      "পেমেন্ট নিশ্চিত হওয়ার পর সদস্যপদ কার্ড ও সার্টিফিকেট",
      "বার্ষিক সাধারণ সভায় আমন্ত্রণ ও প্রকল্প পরিদর্শনের সুযোগ",
    ],
    nextStep: "WhatsApp-এ আবেদন পাঠান",
  },
  volunteer: {
    title: "জাযাকাল্লাহু খাইরান!",
    subtitle: "স্বেচ্ছাসেবক টিমে যুক্ত হওয়ার আবেদন পেয়েছি",
    message:
      "আপনার সময় ও ইচ্ছা আল্লাহর কাছে অত্যন্ত মূল্যবান। আমরা শীঘ্রই আপনার আগ্রহের ক্ষেত্র অনুযায়ী টিমে অন্তর্ভুক্ত করব — ইন শা আল্লাহ।",
    bullets: [
      "২৪-৪৮ ঘণ্টার মধ্যে অরিয়েন্টেশন কলের সময় জানানো হবে",
      "আপনার এলাকার নিকটতম টিম লিডের সাথে পরিচয়",
      "প্রথম মাঠ-কার্যক্রমে যোগদানের সুযোগ",
    ],
    nextStep: "WhatsApp-এ আবেদন পাঠান",
  },
  representative: {
    title: "আলহামদুলিল্লাহ!",
    subtitle: "জেলা প্রতিনিধি আবেদন সফলভাবে গৃহীত হয়েছে",
    message:
      "আপনার প্রদানকৃত তথ্য যাচাই করা হচ্ছে। প্রতিটি জেলা থেকে ১ জন করে নিবেদিত প্রতিনিধি নির্বাচন করা হবে — চূড়ান্ত হলে আপনাকে জানানো হবে ইন শা আল্লাহ।",
    bullets: [
      "৭ কর্মদিবসের মধ্যে প্রাথমিক যাচাই ও ফোনালাপ",
      "নির্বাচিত হলে অরিয়েন্টেশন ও দায়িত্ব হস্তান্তর",
      "সকল তথ্য সম্পূর্ণ গোপনীয় ও সুরক্ষিত",
    ],
    nextStep: "WhatsApp-এ আবেদন পাঠান",
  },
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
  const c = successContent[topic];
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
          পরবর্তী ধাপ
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
          <RotateCcw className="h-4 w-4" /> নতুন আবেদন
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
const Volunteer = () => {
  const [active, setActive] = useState<TabKey>("volunteer");

  return (
    <SiteLayout>
      <Seo
        title="আমাদের সাথে যুক্ত হোন | ইউনাইট ফাউন্ডেশন"
        description="নিয়মিত দাতা, আজীবন সদস্য, স্বেচ্ছাসেবক বা ক্যারিয়ার — যেকোনো ভাবে ইউনাইট ফাউন্ডেশনের সাথে যুক্ত হোন।"
        canonical="/volunteer"
      />

      {/* HERO */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10">
          <img src={volunteerImg} alt="যুক্ত হোন" className="h-full w-full object-cover" loading="eager" />
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
            আমাদের সাথে যুক্ত হোন
          </h1>
          <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-white/70" />
        </div>
      </section>

      {/* TABS + FORMS */}
      <section className="py-14 md:py-20">
        <div className="container-page">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-4xl font-bold leading-tight">
              আমাদের সঙ্গে যুক্ত হতে পারেন বিভিন্নভাবে
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              নিচ থেকে যেকোনো একটি অপশন নির্বাচন করুন — তার জন্য নির্দিষ্ট ফর্ম পূরণ করে
              সরাসরি আমাদের কাছে আবেদন পাঠাতে পারবেন।
            </p>
          </div>

          {/* Tabs */}
          <div className="mt-10 rounded-card border border-border bg-card p-2 md:p-3 shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {tabs.map((t) => {
                const isActive = t.key === active;
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActive(t.key)}
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
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info strip */}
          <div className="mt-5 rounded-card bg-accent/60 border border-accent px-5 md:px-6 py-4 text-sm md:text-base text-foreground/80 text-center">
            যেকোনো বিষয় বুঝতে অসুবিধা হলে, দয়া করে{" "}
            <a
              href={`mailto:${site.email || "info@unite.org"}`}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              {site.email || "info@unite.org"}
            </a>{" "}
            — এ ইমেইল করুন।
          </div>

          {/* Two-column content */}
          <div className="mt-14 grid lg:grid-cols-2 gap-10 items-start">
            {/* Left: contextual info */}
            <LeftPanel active={active} />

            {/* Right: dynamic form */}
            <div
              id="apply"
              className="rounded-card overflow-hidden shadow-[var(--shadow-card-hover)] scroll-mt-28"
              style={{
                background:
                  "linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(142 56% 18%) 100%)",
              }}
            >
              <div className="p-7 md:p-9 text-white">
                {active === "regular" && <RegularForm />}
                {active === "member" && <MemberForm />}
                {active === "volunteer" && <VolunteerForm />}
                {active === "career" && <CareerForm />}
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
                <h4 className="font-bold">দ্রুত WhatsApp</h4>
                <a
                  href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("আসসালামু আলাইকুম, আমি যুক্ত হতে আগ্রহী।")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  সরাসরি মেসেজ পাঠান →
                </a>
              </div>
            </div>
            <div className="card-base p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-accent text-primary flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold">অফিস ঠিকানা</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{site.address}</p>
              </div>
            </div>
            <div className="card-base p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-accent text-primary flex items-center justify-center shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold">অফিস সময়</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">শনি-বৃহঃ, সকাল ১০টা - সন্ধ্যা ৬টা</p>
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
// Left panel: contextual content per tab
const leftContent: Record<TabKey, { title: string; quote?: { text: string; source: string }; intro: string; list: string[]; stats: { v: string; l: string }[] }> = {
  regular: {
    title: "নিয়মিত দাতার গুরুত্ব",
    intro:
      "আপনার মাসিক ছোট অবদানই আমাদের কার্যক্রমকে টেকসই করে — এতিম শিশুর শিক্ষা, খাদ্য সহায়তা ও চিকিৎসা নিরবচ্ছিন্ন রাখে।",
    quote: {
      text: "আল্লাহর কাছে সর্বাধিক প্রিয় আমল হলো, যা সদাসর্বদা নিয়মিত করা হয়, যদিও তা অল্প হয়।",
      source: "(সহীহ বুখারী, হাদীস ৬৪৬৪)",
    },
    list: [
      "প্রতি মাসে স্বয়ংক্রিয় রিমাইন্ডার",
      "প্রতিটি দানের রসিদ ও প্রমাণ",
      "যেকোনো সময় বন্ধ বা পরিবর্তনের সুযোগ",
      "মাসিক ইমপ্যাক্ট রিপোর্ট",
    ],
    stats: [
      { v: "১২,০০০+", l: "নিয়মিত দাতা" },
      { v: "৬৪", l: "জেলা কাভারেজ" },
      { v: "১০০%", l: "স্বচ্ছতা" },
    ],
  },
  member: {
    title: "আজীবন ও দাতা সদস্য",
    intro:
      "এককালীন অবদানের মাধ্যমে আপনি ফাউন্ডেশনের স্থায়ী অংশীদার হবেন এবং দীর্ঘমেয়াদি সকল প্রকল্পে আপনার নাম যুক্ত থাকবে।",
    list: [
      "সদস্যপদ কার্ড ও সার্টিফিকেট",
      "বার্ষিক সাধারণ সভায় অংশগ্রহণ",
      "প্রকল্প পরিদর্শনের সুযোগ",
      "ত্রৈমাসিক বিস্তারিত প্রতিবেদন",
      "ফাউন্ডেশনের সিদ্ধান্ত প্রক্রিয়ায় মতামত",
    ],
    stats: [
      { v: "২৪০+", l: "আজীবন সদস্য" },
      { v: "১৮০+", l: "দাতা সদস্য" },
      { v: "১২৮০+", l: "প্রকল্প" },
    ],
  },
  volunteer: {
    title: "স্বেচ্ছাসেবকের কাজের ক্ষেত্র",
    intro:
      "স্বেচ্ছাসেবা শুধু সময়দান নয় — এটি একটি ইবাদত। আপনার ছোট প্রচেষ্টা বদলে দিতে পারে কারো জীবনের গল্প।",
    quote: {
      text: "আল্লাহর কাছে সর্বাধিক প্রিয় আমল হলো, যা সদাসর্বদা নিয়মিত করা হয়, যদিও তা অল্প হয়।",
      source: "(সহীহ বুখারী, হাদীস ৬৪৬৪)",
    },
    list: [
      "বন্যা, শীত ও দুর্যোগে মাঠপর্যায়ে ত্রাণ",
      "এতিম শিশুদের শিক্ষায় সাপ্তাহিক সময়দান",
      "ফ্রি মেডিকেল ক্যাম্পে অংশগ্রহণ",
      "ফান্ডরাইজিং প্রচারণায় সহযোগিতা",
      "ফটোগ্রাফি, ভিডিও ও সোশ্যাল মিডিয়া",
      "দাওয়াহ ও মসজিদ কেন্দ্রিক কার্যক্রম",
    ],
    stats: [
      { v: "৩,৪৫০+", l: "স্বেচ্ছাসেবক" },
      { v: "১৪", l: "জেলা নেটওয়ার্ক" },
      { v: "১২৮০+", l: "প্রকল্প" },
    ],
  },
  career: {
    title: "ক্যারিয়ার সুযোগ",
    intro:
      "ইউনাইট ফাউন্ডেশনের পূর্ণকালীন/খণ্ডকালীন টিমে যুক্ত হয়ে মানবসেবার পেশায় গড়ুন নিজের ক্যারিয়ার।",
    list: [
      "প্রতিযোগিতামূলক বেতন কাঠামো",
      "প্রশিক্ষণ ও পেশাগত উন্নয়ন",
      "ইসলামিক ওয়ার্ক এনভায়রনমেন্ট",
      "পারফরম্যান্স ভিত্তিক বোনাস",
      "স্বাস্থ্য ও পরিবার সাপোর্ট",
    ],
    stats: [
      { v: "৪২", l: "পূর্ণকালীন কর্মী" },
      { v: "১৪", l: "জেলা অফিস" },
      { v: "১২", l: "ওপেন পজিশন" },
    ],
  },
};

const LeftPanel = ({ active }: { active: TabKey }) => {
  const c = leftContent[active];
  return (
    <div>
      <p className="text-base md:text-lg leading-relaxed text-foreground/85">{c.intro}</p>
      {c.quote && (
        <blockquote className="mt-6 rounded-card border-l-4 border-primary bg-accent/40 p-5 text-foreground/80 italic leading-relaxed">
          {c.quote.text}{" "}
          <span className="not-italic text-sm text-muted-foreground">{c.quote.source}</span>
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
// Shared form chrome
const FieldLight = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-xs font-semibold text-white/90 mb-1.5 block">{label}</span>
    {children}
  </label>
);

const SubmitButton = ({ children = "পরবর্তী ধাপ" }: { children?: React.ReactNode }) => (
  <>
    <button
      type="submit"
      className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-btn bg-white text-primary font-bold py-3.5 hover:bg-white/90 transition-colors"
    >
      <Send className="h-4 w-4" /> {children}
      <ChevronRight className="h-4 w-4" />
    </button>
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/80 pt-2">
      <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />তথ্য সুরক্ষিত</span>
      <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />২৪-৪৮ ঘণ্টায় উত্তর</span>
    </div>
  </>
);

const FormHeader = ({ title, sub }: { title: string; sub: string }) => (
  <>
    <h3 className="text-xl md:text-2xl font-bold">{title}</h3>
    <p className="text-white/85 text-sm mt-2 leading-relaxed">{sub}</p>
  </>
);

// ============================================================
// 1) REGULAR DONOR FORM
const RegularForm = () => {
  const init = { name: "", phone: "", email: "", city: "", area: "", amount: "", method: "", note: "" };
  const [f, setF] = useState(init);
  const [waUrl, setWaUrl] = useState<string | null>(null);
  const u = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = regularSchema.safeParse(f);
    if (!r.success) return showError(r.error.issues[0]?.message);
    setWaUrl(buildWhatsAppUrl(
      "নিয়মিত দাতা আবেদন",
      `নাম: ${f.name}\nফোন: ${f.phone}\nই-মেইল: ${f.email || "—"}\nশহর: ${f.city}\n\nদানের ক্ষেত্র: ${f.area}\nমাসিক পরিমাণ: ৳${f.amount}\nপেমেন্ট: ${f.method}\n\nবার্তা: ${f.note || "—"}`,
    ));
  };
  if (waUrl) return <SuccessCard topic="regular" waUrl={waUrl} onReset={() => { setF(init); setWaUrl(null); }} />;
  return (
    <>
      <FormHeader title="নিয়মিত দাতা হিসেবে যুক্ত হোন" sub="মাসিক ভিত্তিতে দানের জন্য তথ্য দিন — WhatsApp-এ আমাদের টিম আপনাকে সেটআপে সাহায্য করবে।" />
      <form onSubmit={submit} className="mt-6 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <FieldLight label="পূর্ণ নাম *"><input required maxLength={80} value={f.name} onChange={u("name")} className="vol-input" /></FieldLight>
          <FieldLight label="মোবাইল *"><input required type="tel" inputMode="numeric" maxLength={11} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "") })} placeholder="01XXXXXXXXX" className="vol-input" /></FieldLight>
          <FieldLight label="ই-মেইল"><input type="email" maxLength={255} value={f.email} onChange={u("email")} className="vol-input" /></FieldLight>
          <FieldLight label="শহর / জেলা *"><input required maxLength={80} value={f.city} onChange={u("city")} className="vol-input" /></FieldLight>
        </div>
        <FieldLight label="দানের ক্ষেত্র *">
          <select required value={f.area} onChange={u("area")} className="vol-input">
            <option value="">— নির্বাচন করুন —</option>
            {regularAreas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </FieldLight>
        <div className="grid sm:grid-cols-2 gap-3">
          <FieldLight label="মাসিক পরিমাণ (৳) *">
            <select required value={f.amount} onChange={u("amount")} className="vol-input">
              <option value="">— নির্বাচন করুন —</option>
              {regularAmounts.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </FieldLight>
          <FieldLight label="পেমেন্ট মাধ্যম *">
            <select required value={f.method} onChange={u("method")} className="vol-input">
              <option value="">— নির্বাচন করুন —</option>
              <option>bKash</option>
              <option>Nagad</option>
              <option>Rocket</option>
              <option>ব্যাংক ট্রান্সফার</option>
              <option>কার্ড (SSLCommerz)</option>
            </select>
          </FieldLight>
        </div>
        <FieldLight label="বার্তা (ঐচ্ছিক)">
          <textarea rows={3} maxLength={500} value={f.note} onChange={u("note")} className="vol-input resize-none" placeholder="বিশেষ কিছু জানাতে চাইলে লিখুন" />
        </FieldLight>
        <SubmitButton>আবেদন জমা দিন</SubmitButton>
      </form>
    </>
  );
};

// ============================================================
// 2) MEMBERSHIP FORM
const MemberForm = () => {
  const init = { name: "", phone: "", email: "", city: "", profession: "", type: "", address: "", note: "" };
  const [f, setF] = useState(init);
  const [waUrl, setWaUrl] = useState<string | null>(null);
  const u = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = memberSchema.safeParse(f);
    if (!r.success) return showError(r.error.issues[0]?.message);
    const typeLabel = membershipTypes.find((t) => t.value === f.type)?.label || f.type;
    setWaUrl(buildWhatsAppUrl(
      "সদস্যপদ আবেদন",
      `নাম: ${f.name}\nফোন: ${f.phone}\nই-মেইল: ${f.email || "—"}\nশহর: ${f.city}\nপেশা: ${f.profession || "—"}\n\nসদস্যপদ: ${typeLabel}\nঠিকানা: ${f.address}\n\nবার্তা: ${f.note || "—"}`,
    ));
  };
  if (waUrl) return <SuccessCard topic="member" waUrl={waUrl} onReset={() => { setF(init); setWaUrl(null); }} />;
  return (
    <>
      <FormHeader title="আজীবন ও দাতা সদস্য হোন" sub="আবেদন গ্রহণের পর আমাদের টিম সদস্যপদ ও পেমেন্ট প্রক্রিয়া নিশ্চিত করবে।" />
      <form onSubmit={submit} className="mt-6 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <FieldLight label="পূর্ণ নাম *"><input required maxLength={80} value={f.name} onChange={u("name")} className="vol-input" /></FieldLight>
          <FieldLight label="মোবাইল *"><input required type="tel" inputMode="numeric" maxLength={11} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "") })} placeholder="01XXXXXXXXX" className="vol-input" /></FieldLight>
          <FieldLight label="ই-মেইল"><input type="email" maxLength={255} value={f.email} onChange={u("email")} className="vol-input" /></FieldLight>
          <FieldLight label="শহর / জেলা *"><input required maxLength={80} value={f.city} onChange={u("city")} className="vol-input" /></FieldLight>
          <FieldLight label="পেশা"><input maxLength={120} value={f.profession} onChange={u("profession")} className="vol-input" placeholder="যেমন: ব্যবসায়ী" /></FieldLight>
          <FieldLight label="সদস্যপদের ধরন *">
            <select required value={f.type} onChange={u("type")} className="vol-input">
              <option value="">— নির্বাচন করুন —</option>
              {membershipTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </FieldLight>
        </div>
        <FieldLight label="পূর্ণ ঠিকানা *">
          <textarea required rows={2} maxLength={300} value={f.address} onChange={u("address")} className="vol-input resize-none" />
        </FieldLight>
        <FieldLight label="বার্তা (ঐচ্ছিক)">
          <textarea rows={3} maxLength={500} value={f.note} onChange={u("note")} className="vol-input resize-none" />
        </FieldLight>
        <SubmitButton>আবেদন জমা দিন</SubmitButton>
      </form>
    </>
  );
};

// ============================================================
// 3) VOLUNTEER FORM (existing)
const VolunteerForm = () => {
  const init = { name: "", phone: "", email: "", age: "", city: "", profession: "", area: "", availability: "", motivation: "" };
  const [f, setF] = useState(init);
  const [waUrl, setWaUrl] = useState<string | null>(null);
  const u = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = volunteerSchema.safeParse(f);
    if (!r.success) return showError(r.error.issues[0]?.message);
    setWaUrl(buildWhatsAppUrl(
      "স্বেচ্ছাসেবক আবেদন",
      `নাম: ${f.name}\nফোন: ${f.phone}\nই-মেইল: ${f.email || "—"}\nবয়স: ${f.age}\nশহর: ${f.city}\nপেশা: ${f.profession || "—"}\n\nআগ্রহের ক্ষেত্র: ${f.area}\nসময়: ${f.availability}\n\nকেন যুক্ত হতে চান:\n${f.motivation}`,
    ));
  };
  if (waUrl) return <SuccessCard topic="volunteer" waUrl={waUrl} onReset={() => { setF(init); setWaUrl(null); }} />;
  return (
    <>
      <FormHeader title="স্বেচ্ছাসেবক হিসেবে যুক্ত হোন" sub="ফর্মটি পূরণ করুন — আমাদের টিম ২৪-৪৮ ঘণ্টার মধ্যে যোগাযোগ করবে।" />
      <form onSubmit={submit} className="mt-6 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <FieldLight label="পূর্ণ নাম *"><input required maxLength={80} value={f.name} onChange={u("name")} className="vol-input" /></FieldLight>
          <FieldLight label="মোবাইল *"><input required type="tel" inputMode="numeric" maxLength={11} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "") })} placeholder="01XXXXXXXXX" className="vol-input" /></FieldLight>
          <FieldLight label="ই-মেইল"><input type="email" maxLength={255} value={f.email} onChange={u("email")} className="vol-input" /></FieldLight>
          <FieldLight label="বয়স *"><input required type="number" min={14} max={80} value={f.age} onChange={u("age")} className="vol-input" /></FieldLight>
          <FieldLight label="শহর / জেলা *"><input required maxLength={80} value={f.city} onChange={u("city")} className="vol-input" /></FieldLight>
          <FieldLight label="পেশা / ছাত্রত্ব"><input maxLength={120} value={f.profession} onChange={u("profession")} className="vol-input" placeholder="যেমন: ছাত্র, ডাক্তার" /></FieldLight>
        </div>
        <FieldLight label="আগ্রহের ক্ষেত্র *">
          <select required value={f.area} onChange={u("area")} className="vol-input">
            <option value="">— নির্বাচন করুন —</option>
            {volunteerAreas.map((a) => <option key={a} value={a}>{a}</option>)}
            <option value="অন্যান্য">অন্যান্য</option>
          </select>
        </FieldLight>
        <FieldLight label="সাপ্তাহিক সময় *">
          <select required value={f.availability} onChange={u("availability")} className="vol-input">
            <option value="">— নির্বাচন করুন —</option>
            <option>১-৪ ঘণ্টা / সপ্তাহ</option>
            <option>৫-১০ ঘণ্টা / সপ্তাহ</option>
            <option>১০+ ঘণ্টা / সপ্তাহ</option>
            <option>প্রজেক্টভিত্তিক</option>
            <option>শুধু উইকএন্ড</option>
          </select>
        </FieldLight>
        <FieldLight label="কেন যুক্ত হতে চান? *">
          <textarea required rows={4} maxLength={1000} value={f.motivation} onChange={u("motivation")} className="vol-input resize-none" placeholder="আপনার অনুপ্রেরণা সংক্ষেপে লিখুন" />
        </FieldLight>
        <SubmitButton>আবেদন জমা দিন</SubmitButton>
      </form>
    </>
  );
};

// ============================================================
// 4) CAREER FORM
const CareerForm = () => {
  const init = { name: "", phone: "", email: "", city: "", position: "", experience: "", qualification: "", cv: "", cover: "" };
  const [f, setF] = useState(init);
  const [waUrl, setWaUrl] = useState<string | null>(null);
  const u = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = careerSchema.safeParse(f);
    if (!r.success) return showError(r.error.issues[0]?.message);
    setWaUrl(buildWhatsAppUrl(
      "ক্যারিয়ার আবেদন",
      `নাম: ${f.name}\nফোন: ${f.phone}\nই-মেইল: ${f.email || "—"}\nশহর: ${f.city}\n\nপদ: ${f.position}\nঅভিজ্ঞতা: ${f.experience}\nশিক্ষাগত যোগ্যতা: ${f.qualification}\nCV: ${f.cv || "—"}\n\nকভার লেটার:\n${f.cover}`,
    ));
  };
  if (waUrl) return <SuccessCard topic="career" waUrl={waUrl} onReset={() => { setF(init); setWaUrl(null); }} />;
  return (
    <>
      <FormHeader title="ক্যারিয়ার আবেদন" sub="আপনার জন্য উপযুক্ত পদে আবেদন করুন — CV-সহ তথ্য পাঠান।" />
      <form onSubmit={submit} className="mt-6 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <FieldLight label="পূর্ণ নাম *"><input required maxLength={80} value={f.name} onChange={u("name")} className="vol-input" /></FieldLight>
          <FieldLight label="মোবাইল *"><input required type="tel" inputMode="numeric" maxLength={11} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "") })} placeholder="01XXXXXXXXX" className="vol-input" /></FieldLight>
          <FieldLight label="ই-মেইল"><input type="email" maxLength={255} value={f.email} onChange={u("email")} className="vol-input" /></FieldLight>
          <FieldLight label="শহর / জেলা *"><input required maxLength={80} value={f.city} onChange={u("city")} className="vol-input" /></FieldLight>
          <FieldLight label="আবেদনকৃত পদ *">
            <select required value={f.position} onChange={u("position")} className="vol-input">
              <option value="">— নির্বাচন করুন —</option>
              {careerPositions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </FieldLight>
          <FieldLight label="অভিজ্ঞতা *">
            <select required value={f.experience} onChange={u("experience")} className="vol-input">
              <option value="">— নির্বাচন করুন —</option>
              <option>ফ্রেশার (০ বছর)</option>
              <option>১-২ বছর</option>
              <option>৩-৫ বছর</option>
              <option>৫+ বছর</option>
            </select>
          </FieldLight>
        </div>
        <FieldLight label="শিক্ষাগত যোগ্যতা *">
          <input required maxLength={200} value={f.qualification} onChange={u("qualification")} className="vol-input" placeholder="যেমন: BBA, ঢাকা বিশ্ববিদ্যালয়" />
        </FieldLight>
        <FieldLight label="CV লিংক (Google Drive / Dropbox)">
          <input type="url" value={f.cv} onChange={u("cv")} className="vol-input" placeholder="https://" />
        </FieldLight>
        <FieldLight label="কভার লেটার *">
          <textarea required rows={4} maxLength={1000} value={f.cover} onChange={u("cover")} className="vol-input resize-none" placeholder="কেন এই পদে আবেদন করছেন তা সংক্ষেপে লিখুন" />
        </FieldLight>
        <SubmitButton>আবেদন জমা দিন</SubmitButton>
      </form>
    </>
  );
};

export default Volunteer;
