// ============================================================
// Central API client for Unite Foundation
// Backend: Express + MySQL (REST), Auth: JWT Bearer
// Base URL is configured via VITE_API_BASE_URL (.env)
// ============================================================

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://api.unitefoundation.bd";

export const AUTH_STORAGE_KEY =
  (import.meta.env.VITE_AUTH_STORAGE_KEY as string | undefined) || "uf_auth_token";

export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined) || "https://unitefoundation.bd";

// ---------- Token helpers ----------
export const auth = {
  get token(): string | null {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    localStorage.setItem(AUTH_STORAGE_KEY, token);
  },
  clear() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },
};

// ---------- Error type ----------
export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// ---------- Core request ----------
type Options = Omit<RequestInit, "body"> & { body?: unknown; auth?: boolean };

async function request<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const { body, auth: useAuth = true, headers, ...rest } = opts;

  const h = new Headers(headers);
  if (body !== undefined && !(body instanceof FormData)) {
    h.set("Content-Type", "application/json");
  }
  h.set("Accept", "application/json");
  if (useAuth) {
    const t = auth.token;
    if (t) h.set("Authorization", `Bearer ${t}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: h,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
        ? body
        : JSON.stringify(body),
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    if (res.status === 401) auth.clear();
    const msg =
      (isJson && payload && (payload as { message?: string }).message) ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, payload);
  }
  return payload as T;
}

export const api = {
  get: <T = unknown>(p: string, o?: Options) => request<T>(p, { ...o, method: "GET" }),
  post: <T = unknown>(p: string, body?: unknown, o?: Options) =>
    request<T>(p, { ...o, method: "POST", body }),
  put: <T = unknown>(p: string, body?: unknown, o?: Options) =>
    request<T>(p, { ...o, method: "PUT", body }),
  patch: <T = unknown>(p: string, body?: unknown, o?: Options) =>
    request<T>(p, { ...o, method: "PATCH", body }),
  delete: <T = unknown>(p: string, o?: Options) => request<T>(p, { ...o, method: "DELETE" }),
};

// ---------- Endpoint helpers (typed convenience wrappers) ----------
// Extend these as backend endpoints come online.

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: unknown }>("/auth/login", { email, password }, { auth: false }),
  me: () => api.get<{ user: unknown }>("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

export const donationsApi = {
  list: (params?: Record<string, string | number>) => {
    const q = params ? "?" + new URLSearchParams(params as Record<string, string>) : "";
    return api.get(`/donations${q}`);
  },
  create: (data: unknown) => api.post("/donations", data, { auth: false }),
  update: (id: string, data: unknown) => api.patch(`/donations/${id}`, data),
  remove: (id: string) => api.delete(`/donations/${id}`),
};

export const applicationsApi = {
  volunteers: () => api.get("/applications/volunteers"),
  members: () => api.get("/applications/members"),
  careers: () => api.get("/applications/careers"),
  submit: (kind: "volunteer" | "member" | "career" | "donor", data: unknown) =>
    api.post(`/applications/${kind}`, data, { auth: false }),
  updateStatus: (kind: string, id: string, status: string) =>
    api.patch(`/applications/${kind}/${id}`, { status }),
};

export const projectsApi = {
  list: () => api.get("/projects"),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: unknown) => api.post("/projects", data),
  update: (id: string, data: unknown) => api.patch(`/projects/${id}`, data),
  remove: (id: string) => api.delete(`/projects/${id}`),
};

export const settingsApi = {
  get: () => api.get("/settings"),
  update: (data: unknown) => api.put("/settings", data),
};
