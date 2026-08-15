import { request, setStoredToken } from "@/lib/api";
import type { User } from "@/types";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<{ user: User }> {
    const res = await request<{ user: User }>({
      method: "POST",
      url: "/auth/register",
      data: payload,
    });
    return res.data;
  },

  async verifyOtp(email: string, otp: string): Promise<{ user: User; token?: string }> {
    const res = await request<{ user: User; token?: string }>({
      method: "POST",
      url: "/auth/verify-otp",
      data: { email, otp },
    });
    if (res.data.token) setStoredToken(res.data.token);
    return res.data;
  },

  async resendOtp(email: string): Promise<void> {
    await request<null>({
      method: "POST",
      url: "/auth/resend-otp",
      data: { email },
    });
  },

  async login(email: string, password: string): Promise<{ user: User }> {
    const res = await request<{ user: User; token?: string }>({
      method: "POST",
      url: "/auth/login",
      data: { email, password },
    });
    if (res.data.token) setStoredToken(res.data.token);
    return res.data;
  },

  async googleLogin(idToken: string): Promise<{ user: User; isNew: boolean }> {
    const res = await request<{ user: User; isNew: boolean; token?: string }>({
      method: "POST",
      url: "/auth/google",
      data: { idToken },
    });
    if (res.data.token) setStoredToken(res.data.token);
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await request<null>({ method: "POST", url: "/auth/logout" });
    } finally {
      setStoredToken(null);
    }
  },

  async me(): Promise<{ user: User }> {
    const res = await request<{ user: User }>({ method: "GET", url: "/auth/me" });
    return res.data;
  },
};