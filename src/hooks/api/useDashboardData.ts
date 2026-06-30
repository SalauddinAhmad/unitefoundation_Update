// ============================================================
// Dashboard data hooks — React Query wrappers
// Strategy: try the live API first; if it fails (backend not
// deployed yet, network error, 404), fall back to mock data so
// the dashboard remains usable today. Once the Express + MySQL
// backend is live at VITE_API_BASE_URL, real data flows in
// automatically — no component changes needed.
// ============================================================
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
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

export const useDonations = () =>
  useQuery({
    queryKey: ["donations"],
    queryFn: () => tryApi("/donations", mockDonations),
    staleTime: STALE,
  });

export const useVolunteerApps = () =>
  useQuery({
    queryKey: ["applications", "volunteers"],
    queryFn: () => tryApi("/applications/volunteers", mockVolunteers),
    staleTime: STALE,
  });

export const useMemberApps = () =>
  useQuery({
    queryKey: ["applications", "members"],
    queryFn: () => tryApi("/applications/members", mockMembers),
    staleTime: STALE,
  });

export const useCareerApps = () =>
  useQuery({
    queryKey: ["applications", "careers"],
    queryFn: () => tryApi("/applications/careers", mockCareers),
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
};

const defaultSettings: SiteSettings = {
  organization: {
    name: "ইউনাইট ফাউন্ডেশন",
    tagline: "অহিভিত্তিক জীবন গড়ার দৃঢ় প্রত্যয়ে",
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
};

function withDefaults(s: Partial<SiteSettings> | null | undefined): SiteSettings {
  return {
    organization: { ...defaultSettings.organization, ...(s?.organization || {}) },
    payments: { ...defaultSettings.payments, ...(s?.payments || {}) },
    socials: { ...defaultSettings.socials, ...(s?.socials || {}) },
    security: { ...defaultSettings.security, ...(s?.security || {}) },
    notifications: { ...defaultSettings.notifications, ...(s?.notifications || {}) },
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
