// ============================================================
// Dashboard data hooks — React Query wrappers
// Strategy: try the live API first; if it fails (backend not
// deployed yet, network error, 404), fall back to mock data so
// the dashboard remains usable today. Once the Express + MySQL
// backend is live at VITE_API_BASE_URL, real data flows in
// automatically — no component changes needed.
// ============================================================
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { EXTRAS, mergeExtras } from "@/lib/localExtras";
import type { FormKey, FormSchema } from "@/data/formDefaults";
import {
  donations as mockDonations,
  volunteerApps as mockVolunteers,
  memberApps as mockMembers,
  careerApps as mockCareers,
  projects as mockProjects,
  posts as mockPosts,
  messages as mockMessages,
  galleryItems as mockGallery,
  kpis as mockKpis,
  donationTrend as mockTrend,
  channelSplit as mockChannels,
  recentActivity as mockActivity,
} from "@/data/dashboardMock";

// Helper — try API, fall back to mock on any failure
async function tryApi<T>(path: string, fallback: T): Promise<T> {
  try {
    const data = await api.get<T>(path, { auth: true });
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

const STALE = 60_000; // 1 min

// Re-fetch a bucket when a manual entry is added elsewhere in the app.
function useExtrasInvalidator(bucket: string, queryKey: readonly unknown[]) {
  const qc = useQueryClient();
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail.bucket === bucket) qc.invalidateQueries({ queryKey: [...queryKey] });
    };
    window.addEventListener("uf-extras-changed", handler);
    return () => window.removeEventListener("uf-extras-changed", handler);
  }, [bucket, qc, queryKey]);
}

export const useDonations = () => {
  useExtrasInvalidator(EXTRAS.donations, ["donations"]);
  return useQuery({
    queryKey: ["donations"],
    queryFn: async () => {
      const rows = await tryApi<any[]>("/donations", mockDonations as any);
      const normalized = (Array.isArray(rows) ? rows : []).map((r: any) => ({
        id: String(r.id ?? ""),
        name: r.name ?? "",
        phone: r.phone ?? "",
        amount: Number(r.amount) || 0,
        method: r.method ?? "",
        area: r.area ?? "",
        date: r.date ?? (r.created_at ? String(r.created_at).slice(0, 10) : ""),
        status: r.status ?? "pending",
        bank_tran_id: r.bank_tran_id ?? "",
        card_type: r.card_type ?? "",
      }));
      return mergeExtras(EXTRAS.donations, normalized);
    },
    staleTime: STALE,
  });
};

// ---- Applications: DB-only (no mocks, no local extras) --------------------
// Backend returns rows of: { id, kind, name, phone, email, address, profession,
// message, extra (JSON), status, created_at }. We normalise to the Application
// shape the dashboard table already renders — details are derived from the
// `extra` blob and `message`, so whatever the public form submits shows up.
import type { Application } from "@/data/dashboardMock";

type ApiApplication = {
  id: string;
  kind: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  profession?: string | null;
  message?: string | null;
  extra?: any;
  status: Application["status"];
  created_at?: string;
};

const parseExtra = (v: any) => {
  if (!v) return {};
  if (typeof v === "string") { try { return JSON.parse(v); } catch { return {}; } }
  return v;
};

const formatDate = (d?: string) => (d ? String(d).slice(0, 10) : "");
const formatDateTime = (d?: string) => (d ? String(d).replace("T", " ").slice(0, 16) : "");

function toApplication(row: ApiApplication, kind: "volunteer" | "member" | "career", idPrefix: string): Application {
  const ex = parseExtra(row.extra);
  // Prefer an explicit "type" from extras; fall back to profession.
  const type = ex.type || ex.area || ex.membershipType || row.profession || "—";
  const city = ex.city || ex.district || "—";
  const formNameMap: Record<typeof kind, string> = {
    volunteer: "স্বেচ্ছাসেবক",
    career: "প্রতিনিধি",
    member: "সদস্যপদ",
  };

  const detailFields: { label: string; value: string; long?: boolean }[] = [];
  if (row.email) detailFields.push({ label: "ই-মেইল", value: row.email });
  if (row.address) detailFields.push({ label: "ঠিকানা", value: row.address, long: true });
  if (row.profession) detailFields.push({ label: "পেশা", value: row.profession });
  Object.entries(ex).forEach(([k, v]) => {
    if (v == null || v === "" || ["city", "district", "type", "area", "membershipType"].includes(k)) return;
    detailFields.push({ label: k, value: Array.isArray(v) ? v.join(", ") : String(v) });
  });
  if (row.message) detailFields.push({ label: "বার্তা", value: row.message, long: true });

  return {
    id: `${idPrefix}-${String(row.id).slice(0, 6).toUpperCase()}`,
    rawId: String(row.id),
    name: row.name,
    phone: row.phone || "",
    email: row.email || undefined,
    city,
    type,
    formName: formNameMap[kind],
    date: formatDate(row.created_at),
    submittedAt: formatDateTime(row.created_at),
    status: row.status || "new",
    details: detailFields.length ? [{ title: "বিস্তারিত", fields: detailFields }] : undefined,
  };
}

const fetchApps = async (kind: "volunteer" | "member" | "career", prefix: string): Promise<Application[]> => {
  try {
    const rows = await api.get<ApiApplication[]>(`/applications/${kind}`, { auth: true });
    return (rows || []).map((r) => toApplication(r, kind, prefix));
  } catch {
    return [];
  }
};

export const useVolunteerApps = () =>
  useQuery({
    queryKey: ["applications", "volunteers"],
    queryFn: () => fetchApps("volunteer", "VOL"),
    staleTime: STALE,
  });

export const useMemberApps = () =>
  useQuery({
    queryKey: ["applications", "members"],
    queryFn: () => fetchApps("member", "MEM"),
    staleTime: STALE,
  });

export const useCareerApps = () =>
  useQuery({
    queryKey: ["applications", "careers"],
    queryFn: () => fetchApps("career", "DR"),
    staleTime: STALE,
  });

export const useDeleteApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, id }: { kind: "volunteer" | "member" | "career"; id: string }) =>
      api.delete(`/applications/${kind}/${id}`, { auth: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["stats", "overview"] });
    },
  });
};

export const useProjects = () =>
  useQuery({
    queryKey: ["projects"],
    queryFn: () => tryApi("/projects", mockProjects),
    staleTime: STALE,
  });

export const usePosts = () =>
  useQuery({
    queryKey: ["posts"],
    queryFn: () => tryApi("/posts", mockPosts),
    staleTime: STALE,
  });

export const useMessages = () => {
  useExtrasInvalidator(EXTRAS.messages || "messages", ["messages"]);
  return useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const rows = await tryApi<any[]>("/messages", []);
      const normalized = (Array.isArray(rows) ? rows : []).map((r: any) => ({
        id: String(r.id ?? ""),
        name: r.name ?? "",
        email: r.email ?? "",
        subject: r.subject ?? "",
        preview: r.preview ?? (r.body ? String(r.body).slice(0, 80) : ""),
        date: r.date ?? (r.created_at ? relTime(r.created_at) : ""),
        status: r.status ?? "unread",
        replies: r.replies ?? [],
      }));
      return mergeExtras(EXTRAS.messages || "messages", normalized);
    },
    staleTime: STALE,
  });
};

function relTime(s?: string) {
  if (!s) return "";
  const d = new Date(s);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "এইমাত্র";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} মিনিট আগে`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ঘণ্টা আগে`;
  return d.toLocaleDateString("bn-BD");
}


export const useGallery = () =>
  useQuery({
    queryKey: ["gallery"],
    queryFn: () => tryApi("/gallery", mockGallery),
    staleTime: STALE,
  });

export const useOverviewStats = () =>
  useQuery({
    queryKey: ["stats", "overview"],
    queryFn: () =>
      tryApi("/stats/overview", {
        kpis: mockKpis,
        trend: mockTrend,
        channels: mockChannels,
        activity: mockActivity,
      }),
    staleTime: STALE,
  });

// ---------- Settings (dashboard editable) ----------
export type ImpactStat = { value: number; label: string; suffix?: string };

export type HeroSlide = {
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaTo: string;
  secondaryCtaLabel: string;
  secondaryCtaTo: string;
  // ---- optional pro controls (all backward-compatible) ----
  enabled?: boolean;                       // default true
  align?: "left" | "center" | "right";     // default "left"
  overlay?: "dark" | "medium" | "light";   // default "dark"
};


export type AboutContent = {
  tagline?: string;
  heading: string;
  highlight: string;
  body: string;
  quoteText: string;
  quoteSource: string;
  quoteText2?: string;
  quoteSource2?: string;
  points: string[];
  sideImage: string;
  expNumber: string;
  expLabel: string;
};


export type TrustItem = {
  icon: "shield" | "award" | "file" | "users";
  title: string;
  note: string;
};

export type Milestone = {
  yearBn: string;
  yearEn: string;
  titleBn: string;
  titleEn: string;
  itemsBn: string[];
  itemsEn: string[];
};

export type MilestonesSection = {
  eyebrowBn: string;
  eyebrowEn: string;
  headingBn: string;
  headingEn: string;
  introBn: string;
  introEn: string;
  quoteBn: string;
  quoteEn: string;
};

export type MissionSection = {
  image: string;
  eyebrowBn: string;
  eyebrowEn: string;
  headingBn: string;
  headingEn: string;
  headingHighlightBn: string;
  headingHighlightEn: string;
  introBn: string;
  introEn: string;
  goalsBn: string[];
  goalsEn: string[];
};

export type SiteSettings = {
  organization: {
    name: string;
    tagline: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    registration_no: string;
  };
  payments: {
    bkash: string;
    nagad: string;
    rocket: string;
    bank_name: string;
    bank_account: string;
    sslcommerz_store_id: string;
    qr_image: string;
    banks: Array<{
      bank: string;
      branch: string;
      account: string;
      number: string;
      routing: string;
      swift: string;
    }>;
  };
  socials: {
    facebook: string;
    youtube: string;
    instagram: string;
    twitter: string;
  };
  security: {
    two_factor: boolean;
    session_timeout_min: number;
    password_min_length: number;
    require_strong_password: boolean;
    login_alerts: boolean;
    allowed_admin_emails: string;
  };
  notifications: {
    email_on_donation: boolean;
    email_on_volunteer: boolean;
    email_on_message: boolean;
    weekly_report: boolean;
    sms_alerts: boolean;
    notify_email: string;
  };
  impact_stats: ImpactStat[];
  impact_section?: { eyebrow?: string; heading?: string; subtitle?: string };
  hero_slides: HeroSlide[];
  about: AboutContent;
  trust: TrustItem[];
  milestones: Milestone[];
  milestones_section: MilestonesSection;
  mission_section: MissionSection;
  page_heroes: PageHeroes;
  founder: FounderContent;
  form_schemas?: Partial<Record<FormKey, FormSchema>>;
};

export type PageHeroes = {
  about: string;
  projects: string;
  blog: string;
  contact: string;
  volunteer: string;
  privacy: string;
  gallery: string;
  terms: string;
  refund: string;
};


export type FounderContent = {
  nameBn: string;
  nameEn: string;
  subtitleBn: string;
  subtitleEn: string;
  badgeLabel: string;
  sectionTitleBn: string;
  sectionTitleEn: string;
  photo: string;
  bioBn: string;
  bioEn: string;
  facebook: string;
  youtube: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
  x: string;
};


const defaultMilestones: Milestone[] = [
  { yearBn: "২০১৭", yearEn: "2017", titleBn: "যাত্রা শুরু", titleEn: "Journey begins",
    itemsBn: [
      "০৭ মার্চ ২০১৭ — মাত্র ১০ জন স্বেচ্ছাসেবক নিয়ে শিক্ষানগরী রাজশাহীর নওদাপাড়ায় ‘ইসলামিক রিসার্চ সেন্টার বাংলাদেশ’ নামে আনুষ্ঠানিক কার্যক্রমের শুভ সূচনা।",
      "মানবতার কল্যাণে অনলাইন ভিত্তিক মিডিয়া ‘ইউনাইট টিভি’-এর কার্যক্রম শুরু।",
    ],
    itemsEn: [
      "7 March 2017 — Formal launch as 'Islamic Research Centre Bangladesh' in Naodapara, Rajshahi, with just 10 volunteers.",
      "Launch of the online media platform 'Unite TV' for humanitarian causes.",
    ] },
  { yearBn: "২০১৭–২০১৮", yearEn: "2017–2018", titleBn: "রোহিঙ্গা শরণার্থী সহায়তা", titleEn: "Rohingya refugee relief",
    itemsBn: ["মিয়ানমার থেকে নির্যাতিত হয়ে বাংলাদেশে (বান্দরবান ও কক্সবাজার) আশ্রয় নেওয়া রোহিঙ্গা মুসলিমদের মাঝে প্রাথমিক খাদ্য, বস্ত্র ও আবাসন ব্যবস্থার সুনিপুণ আয়োজন।"],
    itemsEn: ["Well-organised delivery of initial food, clothing and shelter to Rohingya Muslims who fled Myanmar to Bandarban and Cox's Bazar."] },
  { yearBn: "২০১৮", yearEn: "2018", titleBn: "নিজস্ব ঠিকানার সূচনা", titleEn: "Our own address",
    itemsBn: ["রাজধানী ঢাকার উত্তরা-উত্তরখানে নিজস্ব অফিস ভবনের নির্মাণকাজ শুরু।"],
    itemsEn: ["Construction of our own office building begins in Uttara-Uttarkhan, Dhaka."] },
  { yearBn: "২০১৯", yearEn: "2019", titleBn: "ঈদ সামগ্রী বিতরণ", titleEn: "Eid distribution",
    itemsBn: ["সুবিধাবঞ্চিত ইয়াতিম, বিধবা, গরিব, মিসকিন ও অসহায় মানুষদের মাঝে প্রতি ঈদে ‘ঈদ সামগ্রী বিতরণ’ কর্মসূচির সূচনা।"],
    itemsEn: ["Launch of the 'Eid Distribution' programme for orphans, widows, the poor and destitute every Eid."] },
  { yearBn: "২০২০", yearEn: "2020", titleBn: "সম্প্রসারণ ও নবরূপ", titleEn: "Expansion & rebrand",
    itemsBn: [
      "উত্তরা-উত্তরখানে নিজস্ব অফিস ভবনের নির্মাণকাজ সফলভাবে সমাপ্ত।",
      "প্রধান কার্যালয় রাজশাহী থেকে সফলভাবে রাজধানী ঢাকায় স্থানান্তর।",
      "সেবার পরিধি বাড়াতে সংগঠনের নাম পরিবর্তন করে ‘ইসলামিক ফেইথ অ্যান্ড ওয়েলফেয়ার ফাউন্ডেশন’ নামকরণ।",
    ],
    itemsEn: [
      "Completion of our office building in Uttara-Uttarkhan.",
      "Head office relocated from Rajshahi to Dhaka.",
      "Renamed 'Islamic Faith and Welfare Foundation' to expand our scope.",
    ] },
  { yearBn: "২০২১", yearEn: "2021", titleBn: "মহামারীর পাশে", titleEn: "Standing by in the pandemic",
    itemsBn: ["করোনা মহামারীর বৈশ্বিক সংকটে শত-শত কর্মহীন ও অসহায় পরিবারে জরুরি ত্রাণ সহায়তা প্রদান।"],
    itemsEn: ["Emergency relief for hundreds of jobless and helpless families during the COVID-19 crisis."] },
  { yearBn: "২০২২", yearEn: "2022", titleBn: "ইউনাইট কনফারেন্স ও সাবলম্বীকরণ", titleEn: "Unite Conference & empowerment",
    itemsBn: [
      "ইউনাইট টিভির আয়োজনে ‘ইউনাইট কনফারেন্স’-এর শুভ সূচনা; যা প্রতি বছর পবিত্র রামাযান মাসে রাজধানী ঢাকায় সফলভাবে আয়োজিত হয়ে আসছে।",
      "সাবলম্বীকরণ প্রকল্প — নারীদের মাঝে উপকরণ হস্তান্তর।",
    ],
    itemsEn: [
      "Launch of the 'Unite Conference' by Unite TV, held annually in Dhaka during Ramadan.",
      "Empowerment project — handing tools to women.",
    ] },
  { yearBn: "২০২৩", yearEn: "2023", titleBn: "দুর্যোগে পাশে, নতুন উদ্যোগ", titleEn: "Beside disasters, new initiatives",
    itemsBn: [
      "দেশজুড়ে তীব্র শীতে অসহায় শীতার্তদের মাঝে উন্নতমানের শীতবস্ত্র বিতরণ কর্মসূচির সূচনা।",
      "বন্যা কবলিত এলাকায় জরুরি খাদ্য, বস্ত্র সরবরাহ এবং ক্ষতিগ্রস্ত বাসস্থানের পুনর্বাসন।",
      "‘আত-ত্বাইয়্যেবা ট্রাভেল এজেন্সি’ ও ‘আত-ত্বাইয়্যেবা প্রকাশনী’-এর কার্যক্রম শুরু।",
    ],
    itemsEn: [
      "Launch of nationwide winter clothing distribution for those suffering the cold.",
      "Emergency food and clothing in flood-hit areas and rehabilitation of damaged homes.",
      "Launch of 'At-Tayyiba Travel Agency' and 'At-Tayyiba Publications'.",
    ] },
  { yearBn: "২০২৪", yearEn: "2024", titleBn: "ইউনাইট ফাউন্ডেশন", titleEn: "Unite Foundation",
    itemsBn: [
      "সংগঠনের নাম পুনর্নির্ধারণ করে চূড়ান্তভাবে ‘ইউনাইট ফাউন্ডেশন’ রূপান্তর ও নামকরণ।",
      "আন্তর্জাতিক অঙ্গনে সেবার পরিধি বিস্তৃত করে ফিলিস্তিনে নির্যাতিত মুসলিম ভাই-বোনদের মাঝে খাদ্য ও আবাসন সহযোগিতা কার্যক্রমের সূচনা।",
      "দেশজুড়ে বৃক্ষ রোপন কর্মসূচী শুরু।",
    ],
    itemsEn: [
      "Final renaming and rebranding as 'Unite Foundation'.",
      "Extended service internationally — food and shelter aid for oppressed Muslim brothers and sisters in Palestine.",
      "Launch of a nationwide tree-planting programme.",
    ] },
  { yearBn: "২০২৫", yearEn: "2025", titleBn: "কর্জে হাসানাহ ও ইফতার", titleEn: "Qarz-e-Hasanah & iftar",
    itemsBn: [
      "সম্পূর্ণ সুদমুক্ত ও আত্মনির্ভরশীল সমাজ গঠনে ‘কর্জে হাসানাহ’ প্রজেক্টের পথচলা শুরু।",
      "পবিত্র রামাযান মাসব্যাপী অসহায় ও রোজাদারদের মাঝে ‘ইফতার বিতরণ’ কর্মসূচি শুরু।",
    ],
    itemsEn: [
      "Launch of the 'Qarz-e-Hasanah' project to build an interest-free, self-reliant society.",
      "Launch of the 'Iftar Distribution' programme for the needy and fasting people throughout Ramadan.",
    ] },
  { yearBn: "২০২৬", yearEn: "2026", titleBn: "নতুন দিগন্ত", titleEn: "New horizons",
    itemsBn: [
      "অসহায় ও ইয়াতিম শিশুদের মাঝে নতুন বস্ত্র বিতরণ।",
      "পবিত্র ঈদুল আজহায় সুবিধাবঞ্চিতদের মাঝে ‘কুরবানী প্রজেক্ট’ সফলভাবে বাস্তবায়ন।",
      "বিধবা, ইয়াতিম ও দরিদ্র পরিবারের জন্য ‘আবাসন প্রকল্প’-এর শুভ সূচনা।",
      "দক্ষ জনশক্তি ও কর্মসংস্থান সৃষ্টির লক্ষ্যে ‘ইউনাইট ট্রেনিং সেন্টার’-এর কার্যক্রম শুরু।",
      "মানসম্মত শিক্ষার প্রসারে ‘ইউনাইট একাডেমি’-এর গৌরবময় ঘোষণা।",
    ],
    itemsEn: [
      "Distribution of new clothes to needy and orphan children.",
      "Successful execution of the 'Qurbani Project' for the underprivileged on Eid al-Adha.",
      "Launch of the 'Housing Project' for widows, orphans and poor families.",
      "Launch of 'Unite Training Centre' for skilled workforce and employment.",
      "Proud announcement of 'Unite Academy' for quality education.",
    ] },
];

const defaultSettings: SiteSettings = {
  organization: {
    name: "ইউনাইট ফাউন্ডেশন",
    tagline: "সুন্নাহর অনুসরণে, মানবতার কল্যাণে।",
    email: "info@unitefoundation.bd",
    phone: "+880 1759-754265",
    website: "https://unitefoundation.bd",
    address: "উত্তরখান, উত্তরা, ঢাকা ১২৩০।",
    registration_no: "S-12345/2024",
  },
  payments: {
    bkash: "01759-754265",
    nagad: "01759-754265",
    rocket: "01759-754265-1",
    bank_name: "Islami Bank Bangladesh Ltd.",
    bank_account: "20502070205708118",
    sslcommerz_store_id: "unitefoundation",
    qr_image: "",
    banks: [
      {
        bank: "Islami Bank Bangladesh",
        branch: "Branch : Uttara",
        account: "Unite Training Center",
        number: "20502070100758906",
        routing: "125264639",
        swift: "IBBLBDDH207",
      },
      {
        bank: "City Bank",
        branch: "Branch : Uttara",
        account: "Unite Training Center",
        number: "1254971392001",
        routing: "225264634",
        swift: "CIBLBDDH",
      },
    ],
  },
  socials: {
    facebook: "https://www.facebook.com/UniteFoundation.UniteTv",
    youtube: "https://youtube.com/@unite.foundation",
    instagram: "https://instagram.com/unitefoundation",
    twitter: "https://x.com/unitefoundation",
  },
  security: {
    two_factor: false,
    session_timeout_min: 60,
    password_min_length: 8,
    require_strong_password: true,
    login_alerts: true,
    allowed_admin_emails: "admin@unitefoundation.bd",
  },
  notifications: {
    email_on_donation: true,
    email_on_volunteer: true,
    email_on_message: true,
    weekly_report: false,
    sms_alerts: false,
    notify_email: "admin@unitefoundation.bd",
  },
  impact_stats: [
    { value: 248000, label: "মানুষকে সাহায্য", suffix: "+" },
    { value: 1280, label: "প্রকল্প সম্পন্ন", suffix: "+" },
    { value: 3450, label: "স্বেচ্ছাসেবক", suffix: "" },
    { value: 14, label: "দেশে কার্যক্রম", suffix: "" },
  ],
  impact_section: {
    eyebrow: "",
    heading: "আপনার আমানত পৌঁছে যাচ্ছে মানুষের দোরগোড়ায়।",
    subtitle: "",
  },
  hero_slides: [],
  about: {
    heading: "সুন্নাহর অনুসরণে, মানবতার কল্যাণে",
    highlight: "ইউনাইট ফাউন্ডেশন",
    body: "ইউনাইট ফাউন্ডেশন একটি অরাজনৈতিক ও অলাভজনক ইসলামিক প্ল্যাটফর্ম। পবিত্র কুরআন ও সহীহ হাদীছের দাওয়াত পৌঁছে দেওয়া, তরুণ সমাজকে তাক্বওয়াশীল দাঈ হিসেবে গড়ে তোলা, বিশুদ্ধ আক্বীদা ও আমলের সচেতনতা সৃষ্টি এবং সমাজকল্যাণমূলক কার্যক্রম পরিচালনাই আমাদের প্রধান লক্ষ্য।",
    quoteText: "তোমরা একটি খেজুরের টুকরা দান করে হলেও জাহান্নামের আগুন থেকে বাঁচো।",
    quoteSource: "— তিরমিযী, হা/২৯৫৩",
    points: [
      "পবিত্র কুরআন ও সহীহ হাদীছের আলোকে পরিচালিত",
      "দাওয়াহ, তালীম, সমাজকল্যাণ ও জরুরি ত্রাণে নিবেদিত",
      "শতভাগ স্বচ্ছ ও শরীয়াহ-সম্মত আর্থিক ব্যবস্থাপনা",
      "প্রতিটি দানের জন্য বিস্তারিত প্রভাব প্রতিবেদন",
    ],
    sideImage: "",
    expNumber: "১৫+",
    expLabel: "বছরের অভিজ্ঞতা ও বিশ্বাস",
  },
  trust: [
    { icon: "shield", title: "সরকার-নিবন্ধিত", note: "সমাজসেবা অধিদপ্তর কর্তৃক স্বীকৃত" },
    { icon: "file", title: "বার্ষিক অডিট", note: "স্বাধীন চার্টার্ড অ্যাকাউন্ট্যান্ট দ্বারা" },
    { icon: "award", title: "শরীয়াহ-অনুমোদিত", note: "শরীয়াহ বোর্ড দ্বারা যাচাইকৃত" },
    { icon: "users", title: "৫০,০০০+ দাতা", note: "বিশ্বব্যাপী বিশ্বস্ত পরিবার" },
  ],
  milestones: defaultMilestones,
  milestones_section: {
    eyebrowBn: "আমাদের যাত্রা",
    eyebrowEn: "Our journey",
    headingBn: "মাইলফলকসমূহ",
    headingEn: "Milestones",
    introBn: "শূন্য থেকে শুরু হওয়া একটি স্বপ্ন — যা আজ হাজারো মানুষের সেবার পথে অবিরাম এগিয়ে চলছে।",
    introEn: "A dream that started from nothing — today it moves on tirelessly, serving thousands.",
    quoteBn: "২০১৭ সালে মাত্র ১০ জন স্বেচ্ছাসেবক নিয়ে যে ছোট চারাগাছটি রোপণ করা হয়েছিল, ২০২৬ সালে এসে সেটি অসংখ্য মানুষের সেবার এক বিশাল 'মহীরুহে' পরিণত হয়েছে। ফালিল্লাহিল হামদ।",
    quoteEn: "The small sapling planted in 2017 with just 10 volunteers has, by 2026, grown into a mighty tree serving countless people. Falillahil hamd.",
  },
  mission_section: {
    image: "",
    eyebrowBn: "আমাদের লক্ষ্য",
    eyebrowEn: "Our mission",
    headingBn: "যে পথে আমরা",
    headingEn: "The path we walk",
    headingHighlightBn: "এগিয়ে যাচ্ছি",
    headingHighlightEn: "together",
    introBn: "একটি সমৃদ্ধ, ন্যায়ভিত্তিক ও ঈমানদার সমাজ গঠনে আমাদের পরিকল্পিত পথচলা — নিচে আমাদের মূল ছয়টি লক্ষ্য তুলে ধরা হলো।",
    introEn: "Our planned path toward a prosperous, just and faith-guided society — the six core goals below shape our work.",
    goalsBn: [
      "সকল মানুষের নিকট পবিত্র কুরআন ও সহীহ হাদীছের দাওয়াত পৌঁছানো।",
      "তরুণ ও ছাত্র সমাজকে যোগ্য ও তাক্বওয়াশীল দাঈ ইলাল্লাহ হিসেবে গঠন করা।",
      "বিশুদ্ধ আক্বীদা ও আমল সম্পর্কে সমাজে সচেতনতা সৃষ্টি করা।",
      "ইসলামী শিক্ষা ও সংস্কৃতির নীতি প্রণয়ন ও বাস্তবায়ন।",
      "ইসলামের বিভিন্ন বিষয়ে গ্রন্থ ও সহীহ অনুবাদ প্রকাশ।",
      "সমাজকল্যাণমূলক কার্যক্রম পরিচালনা।",
    ],
    goalsEn: [
      "Convey the message of the Holy Qur'an and authentic Hadith to all people.",
      "Shape young people and students into capable, God-conscious callers to Allah.",
      "Raise awareness in society about correct beliefs and practices.",
      "Formulate and implement policies for Islamic education and culture.",
      "Publish books and authentic translations on Islamic topics.",
      "Carry out social welfare activities.",
    ],
  },
  page_heroes: {
    about: "",
    projects: "",
    blog: "",
    contact: "",
    volunteer: "",
    privacy: "",
    gallery: "",
    terms: "",
    refund: "",
  },

  founder: {
    nameBn: "আব্দুল্লাহ বিন এরশাদ",
    nameEn: "Abdullah bin Ershad",
    subtitleBn: "দাঈ ইলাল্লাহ",
    subtitleEn: "Da'i Ilallah",
    badgeLabel: "Founder",
    sectionTitleBn: "প্রতিষ্ঠাতা ও চেয়ারম্যান",
    sectionTitleEn: "Founder & Chairman",
    photo: "",
    bioBn: "",
    bioEn: "",
    facebook: "https://www.facebook.com/AbdullahBinArshad",
    youtube: "https://youtube.com/@abdullahbinarshad",
    instagram: "https://www.instagram.com/abdullahbinarshad.tv",
    tiktok: "https://www.tiktok.com/@abdullahbinarshad.aba",
    whatsapp: "https://wa.me/message/QNW22PYYZM4ZN1",
    x: "https://x.com/abdullah6852443",
  },
  form_schemas: {},
};

function withDefaults(s: Partial<SiteSettings> | null | undefined): SiteSettings {
  return {
    organization: { ...defaultSettings.organization, ...(s?.organization || {}) },
    payments: { ...defaultSettings.payments, ...(s?.payments || {}) },
    socials: { ...defaultSettings.socials, ...(s?.socials || {}) },
    security: { ...defaultSettings.security, ...(s?.security || {}) },
    notifications: { ...defaultSettings.notifications, ...(s?.notifications || {}) },
    impact_stats:
      Array.isArray(s?.impact_stats) && s!.impact_stats!.length
        ? s!.impact_stats!
        : defaultSettings.impact_stats,
    hero_slides: Array.isArray(s?.hero_slides) ? s!.hero_slides! : defaultSettings.hero_slides,
    about: { ...defaultSettings.about, ...(s?.about || {}), points: (s?.about?.points && s.about.points.length ? s.about.points : defaultSettings.about.points) },
    trust:
      Array.isArray(s?.trust) && s!.trust!.length ? s!.trust! : defaultSettings.trust,
    milestones:
      Array.isArray(s?.milestones) && s!.milestones!.length ? s!.milestones! : defaultSettings.milestones,
    milestones_section: { ...defaultSettings.milestones_section, ...(s?.milestones_section || {}) },
    mission_section: {
      ...defaultSettings.mission_section,
      ...(s?.mission_section || {}),
      goalsBn: (s?.mission_section?.goalsBn && s.mission_section.goalsBn.length ? s.mission_section.goalsBn : defaultSettings.mission_section.goalsBn),
      goalsEn: (s?.mission_section?.goalsEn && s.mission_section.goalsEn.length ? s.mission_section.goalsEn : defaultSettings.mission_section.goalsEn),
    },
    page_heroes: { ...defaultSettings.page_heroes, ...(s?.page_heroes || {}) },
    founder: { ...defaultSettings.founder, ...(s?.founder || {}) },
    form_schemas: { ...(s?.form_schemas || {}) },
  };
}

const LOCAL_SETTINGS_KEY = "uf_settings_draft";

function loadLocalSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (raw) return withDefaults(JSON.parse(raw));
  } catch {}
  return defaultSettings;
}

export const useSettings = () =>
  useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const remote = await api.get<Partial<SiteSettings>>("/settings", { auth: false });
      return withDefaults(remote);
    },
    staleTime: STALE,
  });

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: SiteSettings) => {
      try {
        return await api.put<SiteSettings>("/settings", data);
      } catch {
        localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(data));
        return data;
      }
    },
    onSuccess: (data) => {
      qc.setQueryData(["settings"], data);
    },
  });
};
