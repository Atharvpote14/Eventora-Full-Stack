"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authService, type RegisterPayload } from "@/services/auth";
import { userService } from "@/services/user";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ user: User }>;
  verifyOtp: (email: string, otp: string) => Promise<{ user: User }>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: Partial<Pick<User, "name" | "phone" | "city">>) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const { user: me } = await authService.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { user: me } = await authService.me();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialized(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: loggedIn } = await authService.login(email, password);
      setUser(loggedIn);
    },
    [],
  );

  const register = useCallback(async (payload: RegisterPayload) => {
    return authService.register(payload);
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    return authService.verifyOtp(email, otp);
  }, []);

  const resendOtp = useCallback(async (email: string) => {
    return authService.resendOtp(email);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Local logout regardless of network failure.
    }
    setUser(null);
    router.push("/");
  }, [router]);

  const updateProfile = useCallback(
    async (payload: Partial<Pick<User, "name" | "phone" | "city">>) => {
      const updated = await userService.updateProfile(payload);
      setUser(updated);
    },
    [],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      initialized,
      login,
      register,
      verifyOtp,
      resendOtp,
      logout,
      updateProfile,
      refresh,
    }),
    [user, loading, initialized, login, register, verifyOtp, resendOtp, logout, updateProfile, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.replace("/login");
    }
  }, [initialized, loading, user, router]);

  if (!initialized || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-700 border-t-ember-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export function RequireRole({
  roles,
  children,
}: {
  roles: Array<User["role"]>;
  children: ReactNode;
}) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialized || loading) return;
    if (!user) {
      router.replace("/login");
    } else if (!roles.includes(user.role)) {
      router.replace("/");
    }
  }, [initialized, loading, user, roles, router]);

  if (!initialized || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-700 border-t-ember-500" />
      </div>
    );
  }

  if (!user || !roles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}