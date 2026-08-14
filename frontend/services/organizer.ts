import { request } from "@/lib/api";
import type {
  Booking,
  EventListItem,
  OrganizerAnalytics,
  OrganizerDashboard,
  OrganizerEventBookings,
  Pagination,
} from "@/types";

export const organizerService = {
  async dashboard(): Promise<OrganizerDashboard> {
    const res = await request<OrganizerDashboard>({
      method: "GET",
      url: "/organizer/dashboard",
    });
    return res.data;
  },

  async analytics(period: "7d" | "30d" | "90d" | "12m"): Promise<OrganizerAnalytics> {
    const res = await request<OrganizerAnalytics>({
      method: "GET",
      url: "/organizer/analytics",
      params: { period },
    });
    return res.data;
  },

  async myEvents(
    page = 1,
    limit = 50,
    status?: string,
  ): Promise<{ data: EventListItem[]; pagination?: Pagination }> {
    const params: Record<string, string | number> = { page, limit };
    if (status) params.status = status;
    const res = await request<EventListItem[]>({
      method: "GET",
      url: "/organizer/events",
      params,
    });
    return { data: res.data, pagination: res.pagination };
  },

  async eventBookings(
    eventId: string,
    page = 1,
    limit = 50,
    status?: string,
  ): Promise<{ data: OrganizerEventBookings; pagination?: Pagination }> {
    const params: Record<string, string | number> = { page, limit };
    if (status) params.status = status;
    const res = await request<OrganizerEventBookings>({
      method: "GET",
      url: `/organizer/events/${eventId}/bookings`,
      params,
    });
    return { data: res.data, pagination: res.pagination };
  },

  async allBookings(
    page = 1,
    limit = 100,
    status?: string,
  ): Promise<{ data: Booking[]; pagination?: Pagination }> {
    const params: Record<string, string | number> = { page, limit };
    if (status) params.status = status;
    const res = await request<Booking[]>({
      method: "GET",
      url: "/organizer/bookings",
      params,
    });
    return { data: res.data, pagination: res.pagination };
  },
};
