import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useToast } from "./ToastContext";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
};

type StoredSession = {
  token: string;
  user: AuthUser;
};

type AuthContextValue = {
  user: AuthUser | null;
  authReady: boolean;
  login: (
    email: string,
    password: string,
    redirectTo?: string,
  ) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "foodislice_session";

function safeRedirect(path: string | undefined): string {
  const fallback = "/menu";
  if (!path || typeof path !== "string") return fallback;
  const p = path.trim();
  if (!p.startsWith("/") || p.startsWith("//")) return fallback;
  return p;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (
      parsed &&
      typeof parsed.token === "string" &&
      parsed.user &&
      typeof parsed.user.email === "string" &&
      typeof parsed.user.name === "string" &&
      typeof parsed.user.id === "number"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/** For authenticated API calls (e.g. placing an order). */
export function getStoredAuthToken(): string | null {
  return readStoredSession()?.token ?? null;
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (data?.error) return data.error;
  } catch {
    /* ignore */
  }
  if (res.status === 502 || res.status === 503 || res.status === 504) {
    return "API server is not reachable (502). Start it from the Restaurant folder: npm run dev:api — or run frontend + API together: npm run dev:full.";
  }
  return `Request failed (${res.status}).`;
}

async function fetchAuth(path: string, init?: Parameters<typeof apiFetch>[1]) {
  try {
    return await apiFetch(path, init);
  } catch (e: unknown) {
    if (e instanceof TypeError) {
      throw new Error(
        "Network error — start the API: npm run dev:api (same project folder).",
      );
    }
    throw e;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const persist = useCallback((session: StoredSession | null) => {
    if (session)
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    const session = readStoredSession();
    if (!session?.token) {
      setAuthReady(true);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetchAuth("/api/auth/me", {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        if (!res.ok) throw new Error("invalid");
        const data = (await res.json()) as { user: AuthUser };
        if (!cancelled) setUser(data.user);
      } catch {
        persist(null);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [persist]);

  const login = useCallback(
    async (
      email: string,
      password: string,
      redirectTo?: string,
    ) => {
      const trimmed = email.trim().toLowerCase();
      if (!trimmed) throw new Error("Please enter your email.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        throw new Error("Please enter a valid email address.");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      const res = await fetchAuth("/api/auth/login", {
        method: "POST",
        json: { email: trimmed, password },
      });
      if (!res.ok) throw new Error(await parseError(res));

      const data = (await res.json()) as { token: string; user: AuthUser };
      const session: StoredSession = { token: data.token, user: data.user };
      setUser(data.user);
      persist(session);
      showToast("Logged in successfully.");
      navigate(safeRedirect(redirectTo), { replace: true });
    },
    [navigate, persist, showToast],
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedName) throw new Error("Please enter your name.");
      if (!trimmedEmail) throw new Error("Please enter your email.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        throw new Error("Please enter a valid email address.");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      const res = await fetchAuth("/api/auth/register", {
        method: "POST",
        json: {
          name: trimmedName,
          email: trimmedEmail,
          password,
        },
      });
      if (!res.ok) throw new Error(await parseError(res));

      await res.json();
      showToast("Account created successfully.");
      navigate("/login", { replace: true });
    },
    [navigate, showToast],
  );

  const logout = useCallback(() => {
    setUser(null);
    persist(null);
    showToast("Logged out successfully.");
    navigate("/login", { replace: true });
  }, [navigate, persist, showToast]);

  const value = useMemo(
    () => ({
      user,
      authReady,
      login,
      signup,
      logout,
    }),
    [user, authReady, login, signup, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
