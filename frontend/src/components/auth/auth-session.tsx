"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getCurrentUser, logoutUser } from "@/lib/auth/api";
import type { AuthUser } from "@/lib/auth/types";

type AuthSessionValue = {
  user: AuthUser | null;
  ready: boolean;
  logout: () => Promise<void>;
  loggingOut: boolean;
};

const AuthSessionContext = createContext<AuthSessionValue | null>(null);

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await getCurrentUser();
        if (!cancelled) setUser(response.user);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setLoggingOut(false);
    }
  }, []);

  const value = useMemo(
    () => ({ user, ready, logout, loggingOut }),
    [user, ready, logout, loggingOut],
  );

  return (
    <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }
  return ctx;
}
