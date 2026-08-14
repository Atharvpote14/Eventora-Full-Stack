import { request } from "@/lib/api";
import type {
  AdminAnalytics,
  AdminDashboard,
  AdminEvent,
  AdminPayment,
  AdminUser,
  Booking,
  Pagination,
  Role,
} from "@/types";

export const adminService = {
  async dashboard(): Promise<AdminDashboard> {
    const res = await request<AdminDashboard>({
      method: "GET",
      url: "/admin/dashboard",
    });
    return res.data;
  },

  async users(
    page = 1,
    limit = 20,
    search?: string,
    role?: string,
  ): Promise<{ data: AdminUser[]; pagination?: Pagination }> {
    const params: Record<string, string | number> = { page, limit };
    if (search) params.search = search;
    if (role) params.role = role;
    const res = await request<AdminUser[]>({
      method: "GET",
      url: "/admin/users",
      params,
    });
    return { data: res.data, pagination: res.pagination };
  },

  async updateUserRole(id: string, role: Role): Promise<AdminUser> {
    const res = await request<{ user: AdminUser }>({
      method: "PATCH",
      url: `/admin/users/${id}/role`,
      data: { role },
    });
    return res.data.user;
  },

  async updateUserStatus(id: string, isActive: boolean): Promise<AdminUser> {
    const res = await request<{ user: AdminUser }>({
      method: "PATCH",
      url: `/admin/users/${id}/status`,
      data: { isActive },
    });
    return res.data.user;
  },

  async events(
    page = 1,
    limit = 20,
    status?: string,
    search?: string,
  ): Promise<{ data: AdminEvent[]; pagination?: Pagination }> {
    const params: Record<string, string | number> = { page, limit };
    if (status) params.status = status;
    if (search) params.search = search;
    const res = await request<AdminEvent[]>({
      method: "GET",
      url: "/admin/events",
      params,
    });
    return { data: res.data, pagination: res.pagination };
  },

  async approveEvent(id: string): Promise<void> {
    await request<null>({ method: "PATCH", url: `/admin/events/${id}/approve` });
  },

  async rejectEvent(id: string): Promise<void> {
    await request<null>({ method: "PATCH", url: `/admin/events/${id}/reject` });
  },

  async deleteEvent(id: string): Promise<void> {
    await request<null>({ method: "DELETE", url: `/admin/events/${id}` });
  },

  async bookings(
    page = 1,
    limit = 20,
  ): Promise<{ data: Booking[]; pagination?: Pagination }> {
    const res = await request<Booking[]>({
      method: "GET",
      url: "/admin/bookings",
      params: { page, limit },
    });
    return { data: res.data, pagination: res.pagination };
  },

  async payments(
    page = 1,
    limit = 20,
    status?: string,
  ): Promise<{ data: AdminPayment[]; pagination?: Pagination }> {
    const params: Record<string, string | number> = { page, limit };
    if (status) params.status = status;
    const res = await request<AdminPayment[]>({
      method: "GET",
      url: "/admin/payments",
      params,
    });
    return { data: res.data, pagination: res.pagination };
  },

  async analytics(): Promise<AdminAnalytics> {
    const res = await request<AdminAnalytics>({
      method: "GET",
      url: "/admin/analytics",
    });
    return res.data;
  },
};
