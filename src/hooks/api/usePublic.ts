// ============================================================
// Public data hooks — used by public-facing pages.
// NO static demo fallback: if API fails or returns empty, we
// return empty results so the site always reflects live data.
// ============================================================
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { type Project as StaticProject } from "@/data/projects";
import { type BlogPost as StaticBlogPost } from "@/data/blog";
import { type Partner as StaticPartner } from "@/data/partners";

const STALE = 60_000;

// ---------- local project ordering (fallback until backend reorder endpoint is deployed) ----------
const PROJECT_ORDER_KEY = "projectSortOrderV1";
function loadProjectOrder(): string[] {
  try {
    const raw = localStorage.getItem(PROJECT_ORDER_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch { return []; }
}
function saveProjectOrder(ids: string[]) {
  try { localStorage.setItem(PROJECT_ORDER_KEY, JSON.stringify(ids)); } catch { /* noop */ }
}
function applyProjectOrder<T extends { id: string }>(rows: T[]): T[] {
  const order = loadProjectOrder();
  if (!order.length) return rows;
  const idx = new Map(order.map((id, i) => [id, i] as const));
  return [...rows].sort((a, b) => {
    const ai = idx.has(a.id) ? (idx.get(a.id) as number) : Number.MAX_SAFE_INTEGER;
    const bi = idx.has(b.id) ? (idx.get(b.id) as number) : Number.MAX_SAFE_INTEGER;
    return ai - bi;
  });
}

// ---------- shared helper ----------
async function tryList<T>(path: string): Promise<T[]> {
  try {
    const data = await api.get<T[]>(path, { auth: false });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// ============================================================
// PROJECTS
// ============================================================
export type ApiProject = {
  id: string;
  slug: string;
  title: string;
  category: string;
  short_description?: string | null;
  description?: string | null;
  content?: string | null;
  cover_image_url?: string | null;
  gallery?: string[] | null;
  budget?: number;
  target?: number;
  raised?: number;
  beneficiaries?: number;
  donors?: number;
  location?: string | null;
  urgent?: number | boolean;
  status?: "active" | "completed" | "draft";
};

export type UiProject = StaticProject;

const num = (v: unknown, def = 0) => (typeof v === "number" ? v : v ? Number(v) || def : def);

export function apiToProject(row: ApiProject): UiProject {
  const target = num(row.target || row.budget);
  const raised = num(row.raised);
  let parsed: any = {};
  if (row.content && typeof row.content === "string") {
    try { parsed = JSON.parse(row.content); } catch { parsed = {}; }
  }
  const html = typeof parsed?.html === "string" && parsed.html ? parsed.html : (row.description || "");
  return {
    id: row.id,
    slug: row.slug || row.id,
    title: row.title,
    category: (row.category as UiProject["category"]) || "দাওয়াহ",
    shortDescription: row.short_description || "",
    description: html,
    image: row.cover_image_url || "",
    gallery: Array.isArray(row.gallery) ? row.gallery : row.cover_image_url ? [row.cover_image_url] : [],
    target,
    raised,
    donors: num(row.donors),
    beneficiaries: num(row.beneficiaries),
    urgent: Boolean(row.urgent),
    location: row.location || "",
    status: row.status,
    startDate: parsed?.startDate || "",
    endDate: parsed?.endDate || "",
  };
}

export const useProjectsPublic = () =>
  useQuery({
    queryKey: ["public", "projects"],
    queryFn: async () => {
      const rows = await tryList<ApiProject>("/projects");
      return applyProjectOrder(rows).map(apiToProject);
    },
    staleTime: STALE,
  });

export const useProjectPublic = (slug: string) =>
  useQuery({
    queryKey: ["public", "project", slug],
    queryFn: async () => {
      try {
        const row = await api.get<ApiProject>(`/projects/${slug}`, { auth: false });
        return apiToProject(row);
      } catch {
        return null;
      }
    },
    enabled: !!slug,
    staleTime: STALE,
  });

// ============================================================
// BLOG POSTS
// ============================================================
export type ApiPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null; // HTML or JSON string
  cover_image_url?: string | null;
  category?: string | null;
  status: "draft" | "published";
  published_at?: string | null;
  created_at?: string;
  views?: number | null;
  author_name?: string | null;
};

const bnDate = (iso?: string | null) => {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
};

export type UiBlogPost = StaticBlogPost & { html?: string; views?: number };

export function apiToPost(row: ApiPost): UiBlogPost {
  // content may be plain HTML (from dashboard rich-text editor) OR a JSON ContentBlock[] string
  let body: StaticBlogPost["body"] = [];
  let html: string | undefined;
  const c = row.content || "";
  if (c) {
    try {
      const parsed = JSON.parse(c);
      if (Array.isArray(parsed)) body = parsed;
      else html = c;
    } catch {
      html = c;
    }
  }
  return {
    slug: row.slug,
    title: row.title,
    category: row.category || "সাধারণ",
    excerpt: row.excerpt || "",
    cover: row.cover_image_url || "",
    banner: row.cover_image_url || undefined,
    date: bnDate(row.published_at || row.created_at),
    readMin: Math.max(3, Math.round((c.length || 500) / 800)),
    body,
    html,
    views: typeof row.views === "number" ? row.views : Number(row.views) || 0,
    author: row.author_name || "",
  };
}

export const usePostsPublic = () =>
  useQuery({
    queryKey: ["public", "posts"],
    queryFn: async () => {
      const rows = await tryList<ApiPost>("/posts?status=published");
      return rows.map(apiToPost);
    },
    staleTime: STALE,
  });

export const usePostPublic = (slug: string) =>
  useQuery({
    queryKey: ["public", "post", slug],
    queryFn: async () => {
      try {
        const row = await api.get<ApiPost>(`/posts/${slug}`, { auth: false });
        return apiToPost(row);
      } catch {
        return null;
      }
    },
    enabled: !!slug,
    staleTime: STALE,
  });

export const useIncrementPostView = () =>
  useMutation({
    mutationFn: async (slug: string) => {
      try {
        return await api.post<{ views: number }>(`/posts/${slug}/view`, {}, { auth: false });
      } catch {
        return { views: 0 };
      }
    },
  });

// ============================================================
// GALLERY
// ============================================================
export type ApiGalleryAlbum = {
  id: string;
  title: string;
  slug?: string;
  description?: string | null;
  cover_url?: string | null;
  category?: string | null;
  status?: "published" | "draft" | "archived";
  date?: string | null;
  location?: string | null;
  tags?: string[] | null;
  featured?: number | boolean;
  sort_order?: number;
  created_at?: string;
};
export type ApiGalleryItem = {
  id: string;
  album_id?: string | null;
  kind: "image" | "video";
  title?: string | null;
  url: string;
  thumb_url?: string | null;
  caption?: string | null;
  youtube_id?: string | null;
  duration?: string | null;
  sort_order?: number;
};

export const useGalleryPublic = () =>
  useQuery({
    queryKey: ["public", "gallery"],
    queryFn: async () => {
      try {
        const data = await api.get<{ albums: ApiGalleryAlbum[]; items: ApiGalleryItem[] }>(
          "/gallery",
          { auth: false }
        );
        return {
          albums: data.albums || [],
          items: data.items || [],
        };
      } catch {
        return { albums: [], items: [] };
      }
    },
    staleTime: STALE,
  });

// ---------- GALLERY — admin CRUD ----------
export const useGalleryAdmin = () =>
  useQuery({
    queryKey: ["admin", "gallery"],
    queryFn: async () => {
      try {
        return await api.get<{ albums: ApiGalleryAlbum[]; items: ApiGalleryItem[] }>("/gallery");
      } catch {
        return { albums: [] as ApiGalleryAlbum[], items: [] as ApiGalleryItem[] };
      }
    },
    staleTime: 15_000,
  });

const invalidateGallery = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["admin", "gallery"] });
  qc.invalidateQueries({ queryKey: ["public", "gallery"] });
};

export const useSaveAlbum = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: Partial<ApiGalleryAlbum> }) => {
      if (id) return api.patch(`/gallery/albums/${id}`, data);
      return api.post<{ id: string }>("/gallery/albums", data);
    },
    onSuccess: () => invalidateGallery(qc),
  });
};

export const useDeleteAlbum = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/gallery/albums/${id}`),
    onSuccess: () => invalidateGallery(qc),
  });
};

export const useSaveGalleryItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: Partial<ApiGalleryItem> }) => {
      if (id) return api.patch(`/gallery/items/${id}`, data);
      return api.post<{ id: string }>("/gallery/items", data);
    },
    onSuccess: () => invalidateGallery(qc),
  });
};

export const useDeleteGalleryItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/gallery/${id}`),
    onSuccess: () => invalidateGallery(qc),
  });
};

// ============================================================
// PARTNERS
// ============================================================
export type ApiPartner = {
  id: string;
  slug: string;
  name: string;
  logo_url?: string | null;
  cover_url?: string | null;
  tagline?: string | null;
  description?: string | null;
  content?: any;
  website?: string | null;
  category?: string | null;
  theme?: "green" | "red" | "black" | null;
  established?: string | null;
  address?: string | null;
  phone?: string | null;
  sort_order?: number;
  status?: "active" | "draft";
};

export function apiToPartner(row: ApiPartner): StaticPartner {
  const c = row.content || {};
  return {
    slug: row.slug,
    name: row.name,
    logo: row.logo_url || "",
    tagline: row.tagline || "",
    description: row.description || "",
    activities: Array.isArray(c.activities) ? c.activities : [],
    website: row.website || undefined,
    established: row.established || undefined,
    gallery: Array.isArray(c.gallery) ? c.gallery : undefined,
    license: c.license || undefined,
    address: row.address || undefined,
    phone: row.phone || undefined,
    programs: Array.isArray(c.programs) ? c.programs : undefined,
    goal: c.goal || undefined,
    theme: (row.theme as StaticPartner["theme"]) || "green",
  };
}

export const usePartnersPublic = () =>
  useQuery({
    queryKey: ["public", "partners"],
    queryFn: async () => {
      const rows = await tryList<ApiPartner>("/partners");
      return rows.map(apiToPartner);
    },
    staleTime: STALE,
  });

export const usePartnerPublic = (slug: string) =>
  useQuery({
    queryKey: ["public", "partner", slug],
    queryFn: async () => {
      try {
        const row = await api.get<ApiPartner>(`/partners/${slug}`, { auth: false });
        return apiToPartner(row);
      } catch {
        return null;
      }
    },
    enabled: !!slug,
    staleTime: STALE,
  });

// ============================================================
// PARTNERS — Admin CRUD
// ============================================================
export const usePartnersAdmin = () =>
  useQuery({
    queryKey: ["admin", "partners"],
    queryFn: async () => {
      try {
        return await api.get<ApiPartner[]>("/partners/all");
      } catch {
        return [] as ApiPartner[];
      }
    },
    staleTime: 30_000,
  });

export const useSavePartner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: Partial<ApiPartner> }) => {
      if (id) return api.patch(`/partners/${id}`, data);
      return api.post("/partners", data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "partners"] });
      qc.invalidateQueries({ queryKey: ["public", "partners"] });
    },
  });
};

export const useDeletePartner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/partners/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "partners"] });
      qc.invalidateQueries({ queryKey: ["public", "partners"] });
    },
  });
};

// ============================================================
// BLOG POSTS — Admin CRUD
// ============================================================
export const usePostsAdmin = () =>
  useQuery({
    queryKey: ["admin", "posts"],
    queryFn: async () => {
      try {
        return await api.get<ApiPost[]>("/posts");
      } catch {
        return [] as ApiPost[];
      }
    },
    staleTime: 30_000,
  });

export const useSavePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: Partial<ApiPost> }) => {
      if (id) return api.patch(`/posts/${id}`, data);
      return api.post("/posts", data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "posts"] });
      qc.invalidateQueries({ queryKey: ["public", "posts"] });
    },
  });
};

export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/posts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "posts"] });
      qc.invalidateQueries({ queryKey: ["public", "posts"] });
    },
  });
};

// ============================================================
// PROJECTS — Admin CRUD (used by dashboard)
// ============================================================
export const useProjectsAdmin = () =>
  useQuery({
    queryKey: ["admin", "projects"],
    queryFn: async () => {
      try {
        const rows = await api.get<ApiProject[]>("/projects");
        return applyProjectOrder(rows || []);
      } catch {
        return [] as ApiProject[];
      }
    },
    staleTime: 30_000,
  });

export const useSaveProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: Partial<ApiProject> }) => {
      if (id) return api.patch(`/projects/${id}`, data);
      return api.post("/projects", data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "projects"] });
      qc.invalidateQueries({ queryKey: ["public", "projects"] });
    },
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "projects"] });
      qc.invalidateQueries({ queryKey: ["public", "projects"] });
    },
  });
};

export const useReorderProjects = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; sort_order: number }[]) => {
      // Always save locally first so UI works even without backend endpoint.
      saveProjectOrder(items.map((it) => it.id));
      // Try backend; ignore failure (endpoint may not be deployed yet).
      try {
        await api.post("/projects/reorder", { items });
      } catch { /* fallback to local order */ }
      return { ok: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "projects"] });
      qc.invalidateQueries({ queryKey: ["public", "projects"] });
    },
  });
};
