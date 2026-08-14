import { request } from "@/lib/api";
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

  async verifyOtp(email: string, otp: string): Promise<{ user: User }> {
    const res = await request<{ user: User }>({
      method: "POST",
      url: "/auth/verify-otp",
      data: { email, otp },
    });
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
    const res = await request<{ user: User }>({
      method: "POST",
      url: "/auth/login",
      data: { email, password },
    });
    return res.data;
  },

  async logout(): Promise<void> {
    await request<null>({ method: "POST", url: "/auth/logout" });
  },

  async me(): Promise<{ user: User }> {
    const res = await request<{ user: User }>({ method: "GET", url: "/auth/me" });
    return res.data;
  },
};