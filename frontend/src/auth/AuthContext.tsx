import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { api } from "../api/client";
import type { AuthUser, UserRole } from "../types";

export interface RegisterPayload {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  rubro?: string;
  site?: string;
  size?: string;
  description?: string;
  university?: string;
  career?: string;
  location?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = "praxislink_token";
const USER_KEY = "praxislink_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      if (raw && token) setUser(JSON.parse(raw));
    } catch {
      // localStorage no disponible: se sigue sin sesión guardada.
    }
    setLoading(false);
  }, []);

  function persistSession(token: string, authUser: AuthUser) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    } catch {
      // Si el navegador bloquea localStorage, la sesión sigue en memoria para esta pestaña.
    }
    setUser(authUser);
  }

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    persistSession(data.token, data.user);
  }

  async function register(payload: RegisterPayload) {
    const { data } = await api.post("/auth/register", payload);
    persistSession(data.token, data.user);
  }

  function logout() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // no-op
    }
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return ctx;
}
