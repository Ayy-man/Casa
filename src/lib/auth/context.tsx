"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Role = "owner" | "operations";

export type AuthUser = {
  email: string;
  name: string;
  initials: string;
  role: string; // existing free-string display label ("CEO / Founder")
  workspaceRole: Role; // drives greetings, Vault pinning, Assistant prompts
};

type SignInResult = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
  user: AuthUser | null;
  signIn: (email: string, password: string) => SignInResult;
  signOut: () => void;
  ready: boolean;
};

const USERS: Record<string, { password: string } & Omit<AuthUser, "email">> = {
  "carlos@casa.com": {
    password: "demo",
    name: "Carlos Robles",
    initials: "CR",
    role: "CEO / Founder",
    workspaceRole: "owner",
  },
  "denika@casa.com": {
    password: "demo",
    name: "Denika Patel",
    initials: "DP",
    role: "Portfolio Manager",
    workspaceRole: "operations",
  },
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "casa.auth.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  const signIn = useCallback((email: string, password: string): SignInResult => {
    const key = email.toLowerCase().trim();
    const record = USERS[key];
    if (record && record.password === password) {
      const next: AuthUser = {
        email: key,
        name: record.name,
        initials: record.initials,
        role: record.role,
        workspaceRole: record.workspaceRole,
      };
      setUser(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return { ok: true };
    }
    return { ok: false, error: "We don’t recognize those credentials." };
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useRole(): Role {
  const { user } = useAuth();
  return user?.workspaceRole ?? "operations";
}
