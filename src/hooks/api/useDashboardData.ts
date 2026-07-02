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

export const useVolunteerApps = () => {
  useExtrasInvalidator(EXTRAS.volunteers, ["applications", "volunteers"]);
  return useQuery({
    queryKey: ["applications", "volunteers"],
    queryFn: async () =>
      mergeExtras(EXTRAS.volunteers, await tryApi("/applications/volunteers", mockVolunteers)),
    staleTime: STALE,
  });
};

export const useMemberApps = () => {
  useExtrasInvalidator(EXTRAS.members, ["applications", "members"]);
  return useQuery({
    queryKey: ["applications", "members"],
    queryFn: async () =>
      mergeExtras(EXTRAS.members, await tryApi("/applications/members", mockMembers)),
    staleTime: STALE,
  });
};

export const useCareerApps = () => {
  useExtrasInvalidator(EXTRAS.careers, ["applications", "careers"]);
  return useQuery({
    queryKey: ["applications", "careers"],
    queryFn: async () =>
      mergeExtras(EXTRAS.careers, await tryApi("/applications/careers", mockCareers)),
    staleTime: STALE,
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
