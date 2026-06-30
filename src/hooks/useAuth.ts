// Lightweight auth hook for admin dashboard.
// Wraps JWT login (via /auth/login) with a graceful demo fallback so the
// dashboard remains usable while the Express backend is still in progress.

import { useCallback, useEffect, useState } from "react";
import { ApiError, auth, authApi } from "@/lib/api";

const USER_KEY = "uf_auth_user";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
};

const DEMO_USER: AuthUser = {
  id: "demo-admin",
  name: "Demo Admin",
  email: "admin@unitefoundation.bd",
  role: "admin",
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

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => readUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Re-sync if token disappears (e.g. cleared from another tab)
    const onStorage = () => setUser(readUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      try {
        const res = await authApi.login(email, password);
        const u = (res.user as AuthUser) ?? DEMO_USER;
        auth.set(res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        setUser(u);
        return { ok: true as const };
      } catch (err) {
        // Backend not reachable — allow demo credentials so dashboard is testable.
        const networkOrServerDown =
          !(err instanceof ApiError) || err.status >= 500 || err.status === 0;
        if (
          networkOrServerDown &&
          email === DEMO_USER.email &&
          password === DEMO_PASSWORD
        ) {
          auth.set(DEMO_TOKEN);
          localStorage.setItem(USER_KEY, JSON.stringify(DEMO_USER));
          setUser(DEMO_USER);
          return { ok: true as const, demo: true };
        }
        if (err instanceof ApiError) {
          return { ok: false as const, message: err.message };
        }
        return {
          ok: false as const,
          message: "সার্ভারে সংযোগ করা যায়নি। ডেমো লগইন: admin@unitefoundation.bd / admin123",
        };
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    auth.clear();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return { user, loading, login, logout, isAuthenticated: !!user };
}
