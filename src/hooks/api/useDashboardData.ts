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
    queryFn: async () => mergeExtras(EXTRAS.donations, await tryApi("/donations", mockDonations)),
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

function toApplication(row: ApiApplication, idPrefix: string): Application {
  const ex = parseExtra(row.extra);
  // Prefer an explicit "type" from extras; fall back to profession.
  const type = ex.type || ex.area || ex.membershipType || row.profession || "—";
  const city = ex.city || ex.district || "—";

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
    name: row.name,
    phone: row.phone || "",
    email: row.email || undefined,
    city,
    type,
    date: formatDate(row.created_at),
    submittedAt: formatDateTime(row.created_at),
    status: row.status || "new",
    details: detailFields.length ? [{ title: "বিস্তারিত", fields: detailFields }] : undefined,
  };
}

const fetchApps = async (kind: "volunteers" | "members" | "careers", prefix: string): Promise<Application[]> => {
  try {
    const rows = await api.get<ApiApplication[]>(`/applications/${kind}`, { auth: true });
    return (rows || []).map((r) => toApplication(r, prefix));
  } catch {
    return [];
  }
};

export const useVolunteerApps = () =>
  useQuery({
    queryKey: ["applications", "volunteers"],
    queryFn: () => fetchApps("volunteers", "VOL"),
    staleTime: STALE,
  });

export const useMemberApps = () =>
  useQuery({
    queryKey: ["applications", "members"],
    queryFn: () => fetchApps("members", "MEM"),
    staleTime: STALE,
  });

export const useCareerApps = () =>
  useQuery({
    queryKey: ["applications", "careers"],
    queryFn: () => fetchApps("careers", "DR"),
    staleTime: STALE,
  });

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

export const useMessages = () =>
  useQuery({
    queryKey: ["messages"],
    queryFn: () => tryApi("/messages", mockMessages),
    staleTime: STALE,
  });

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
  heading: string;
  highlight: string;
  body: string;
  quoteText: string;
  quoteSource: string;
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
  hero_slides: HeroSlide[];
  about: AboutContent;
  trust: TrustItem[];
  milestones: Milestone[];
};

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
    hero_slides: Array.isArray(s?.hero_slides) ? s!.hero_slides! : [],
    about: { ...defaultSettings.about, ...(s?.about || {}), points: (s?.about?.points && s.about.points.length ? s.about.points : defaultSettings.about.points) },
    trust:
      Array.isArray(s?.trust) && s!.trust!.length ? s!.trust! : defaultSettings.trust,
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
      try {
        const remote = await api.get<Partial<SiteSettings>>("/settings", { auth: false });
        return withDefaults(remote);
      } catch {
        return loadLocalSettings();
      }
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
