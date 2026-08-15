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
import { Loader } from "@/components/Loader";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<{ user: User; isNew: boolean }>;
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

  const googleLogin = useCallback(async (idToken: string) => {
    const result = await authService.googleLogin(idToken);
    setUser(result.user);
    return result;
  }, []);

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
      googleLogin,
      register,
      verifyOtp,
      resendOtp,
      logout,
      updateProfile,
      refresh,
    }),
    [user, loading, initialized, login, googleLogin, register, verifyOtp, resendOtp, logout, updateProfile, refresh],
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
        <Loader />
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
  emails,
  children,
}: {
  roles: Array<User["role"]>;
  emails?: string[];
  children: ReactNode;
}) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  const allowed = !!user && roles.includes(user.role) && (!emails || emails.includes(user.email));

  useEffect(() => {
    if (!initialized || loading) return;
    if (!user) {
      router.replace("/login");
    } else if (!allowed) {
      router.replace("/");
    }
  }, [initialized, loading, user, allowed, router]);

  if (!initialized || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}