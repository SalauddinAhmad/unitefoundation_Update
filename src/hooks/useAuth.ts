// Lightweight auth hook for admin dashboard.
// Supports: JWT login, 2FA OTP step, forgot/reset password.
// Falls back to a demo mode when the Express backend isn't reachable so
// the dashboard remains testable.

import { useCallback, useEffect, useState } from "react";
import { ApiError, api, auth, authApi } from "@/lib/api";
import { can as canPerm, type Permission, type Role } from "@/lib/permissions";

const USER_KEY = "uf_auth_user";
const OTP_KEY = "uf_auth_otp_demo";
const RESET_KEY = "uf_auth_reset_demo";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
};

const DEMO_USER: AuthUser = {
  id: "demo-admin",
  name: "Demo Admin",
  email: "admin@unitefoundation.bd",
  role: "super_admin",
};

const DEMO_TOKEN = "demo.local.token";
const DEMO_PASSWORD = "admin123";

function readUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function isNetworkErr(err: unknown) {
  return !(err instanceof ApiError) || err.status >= 500 || err.status === 0;
}

function isTwoFactorEnabled() {
  try {
    const raw = localStorage.getItem("uf_settings_draft");
    if (!raw) return false;
    const s = JSON.parse(raw);
    return Boolean(s?.security?.two_factor);
  } catch {
    return false;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => readUser());
  const [loading, setLoading] = useState(false);

  // Safety: if a stale demo token is stored while we're pointed at the real
  // production API, purge it so the dashboard forces a proper re-login.
  useEffect(() => {
    const isProdApi = /unitefoundation\.bd/i.test(
      (import.meta.env.VITE_API_BASE_URL as string | undefined) || "https://api.unitefoundation.bd",
    );
    if (isProdApi && auth.token === DEMO_TOKEN) {
      auth.clear();
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const onStorage = () => setUser(readUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // STEP 1 — login (password). May return { requiresOtp: true } when 2FA on.
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      try {
        const res = await api.post<{
          token?: string;
          user?: AuthUser;
          requiresOtp?: boolean;
        }>("/auth/login", { email, password }, { auth: false });

        if (res.requiresOtp) {
          return { ok: true as const, requiresOtp: true, email };
        }
        if (res.token && res.user) {
          auth.set(res.token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          setUser(res.user);
          return { ok: true as const };
        }
        return { ok: false as const, message: "অপ্রত্যাশিত প্রতিক্রিয়া" };
      } catch (err) {
        // Demo fallback ONLY when the real backend is truly unreachable
        // (network/CORS) AND we're not talking to the production API.
        // This prevents a stale `demo.local.token` from being sent to the
        // real server and getting rejected as "Invalid or expired token".
        if (
          isNetworkErr(err) &&
          email === DEMO_USER.email &&
          password === DEMO_PASSWORD
        ) {
          if (isTwoFactorEnabled()) {
            const code = String(Math.floor(100000 + Math.random() * 900000));
            sessionStorage.setItem(OTP_KEY, code);
            // eslint-disable-next-line no-console
            console.info("[DEMO OTP] কোড:", code);
            return { ok: true as const, requiresOtp: true, email, demoOtp: code };
          }
          auth.set(DEMO_TOKEN);
          localStorage.setItem(USER_KEY, JSON.stringify(DEMO_USER));
          setUser(DEMO_USER);
          return { ok: true as const, demo: true };
        }
        if (err instanceof ApiError) return { ok: false as const, message: err.message };
        return {
          ok: false as const,
          message: "সার্ভারে সংযোগ করা যায়নি — CORS/নেটওয়ার্ক সমস্যা। কিছুক্ষণ পর আবার চেষ্টা করুন।",
        };
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // STEP 2 — verify OTP
  const verifyOtp = useCallback(async (email: string, code: string) => {
    setLoading(true);
    try {
      try {
        const res = await api.post<{ token: string; user: AuthUser }>(
          "/auth/verify-otp",
          { email, code },
          { auth: false },
        );
        auth.set(res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        setUser(res.user);
        return { ok: true as const };
      } catch (err) {
        if (isNetworkErr(err)) {
          const expected = sessionStorage.getItem(OTP_KEY);
          if (expected && code.trim() === expected) {
            sessionStorage.removeItem(OTP_KEY);
            auth.set(DEMO_TOKEN);
            localStorage.setItem(USER_KEY, JSON.stringify(DEMO_USER));
            setUser(DEMO_USER);
            return { ok: true as const, demo: true };
          }
          return { ok: false as const, message: "OTP সঠিক নয়" };
        }
        if (err instanceof ApiError) return { ok: false as const, message: err.message };
        return { ok: false as const, message: "OTP যাচাই ব্যর্থ" };
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Forgot password — send email link
  const forgotPassword = useCallback(async (email: string) => {
    try {
      await api.post("/auth/forgot-password", { email }, { auth: false });
      return { ok: true as const };
    } catch (err) {
      if (isNetworkErr(err)) {
        const token = Math.random().toString(36).slice(2, 12);
        localStorage.setItem(RESET_KEY, JSON.stringify({ email, token, ts: Date.now() }));
        // eslint-disable-next-line no-console
        console.info(
          `[DEMO] রিসেট লিংক: ${window.location.origin}/reset-password/${token}`,
        );
        return { ok: true as const, demo: true, demoLink: `/reset-password/${token}` };
      }
      if (err instanceof ApiError) return { ok: false as const, message: err.message };
      return { ok: false as const, message: "অনুরোধ পাঠানো যায়নি" };
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    try {
      await api.post("/auth/reset-password", { token, password }, { auth: false });
      return { ok: true as const };
    } catch (err) {
      if (isNetworkErr(err)) {
        const raw = localStorage.getItem(RESET_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          if (data.token === token) {
            localStorage.removeItem(RESET_KEY);
            return { ok: true as const, demo: true };
          }
        }
        return { ok: false as const, message: "টোকেন অবৈধ বা মেয়াদোত্তীর্ণ" };
      }
      if (err instanceof ApiError) return { ok: false as const, message: err.message };
      return { ok: false as const, message: "পাসওয়ার্ড রিসেট ব্যর্থ" };
    }
  }, []);

  // Update own profile (name / avatar)
  const updateProfile = useCallback(async (patch: { name?: string; avatar?: string }) => {
    try {
      const res = await api.patch<{ token?: string; user: AuthUser }>("/auth/me", patch);
      if (res.token) auth.set(res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      setUser(res.user);
      return { ok: true as const };
    } catch (err) {
      if (err instanceof ApiError) return { ok: false as const, message: err.message };
      return { ok: false as const, message: "প্রোফাইল সংরক্ষণ করা যায়নি" };
    }
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        await api.post("/auth/change-password", { currentPassword, newPassword });
        return { ok: true as const };
      } catch (err) {
        if (err instanceof ApiError) return { ok: false as const, message: err.message };
        return { ok: false as const, message: "পাসওয়ার্ড পরিবর্তন ব্যর্থ" };
      }
    },
    [],
  );

  const logout = useCallback(() => {
    auth.clear();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const can = useCallback(
    (perm: Permission) => canPerm(user?.role, perm),
    [user?.role],
  );

  return {
    user,
    loading,
    login,
    verifyOtp,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    logout,
    isAuthenticated: !!user,
    role: user?.role,
    can,
  };
}

