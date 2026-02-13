import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiLogin, apiRegister } from "@/lib/authApi";

type User = { id: string; name: string; email: string; role: string };

type AuthCtx = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      token,
      login: async (email, password) => {
        const { token, user } = await apiLogin({ email, password });
        setToken(token);
        setUser(user);
      },
      register: async (name, email, password) => {
        const { token, user } = await apiRegister({ name, email, password });
        setToken(token);
        setUser(user);
      },
      logout: () => {
        setToken(null);
        setUser(null);
      },
    }),
    [user, token]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
