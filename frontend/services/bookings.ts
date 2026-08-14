import { request } from "@/lib/api";
import type { Booking, Pagination, RazorpayOrder, Ticket } from "@/types";

export const bookingsService = {
  async create(payload: {
    eventId: string;
    ticketTypeId: string;
    quantity: number;
  }): Promise<Booking> {
    const res = await request<{ booking: Booking }>({
      method: "POST",
      url: "/bookings",
      data: payload,
    });
    return res.data.booking;
  },

  async my(page = 1, limit = 10): Promise<{ data: Booking[]; pagination?: Pagination }> {
    const res = await request<Booking[]>({
      method: "GET",
      url: "/bookings/my",
      params: { page, limit },
    });
    return { data: res.data, pagination: res.pagination };
  },

  async detail(id: string): Promise<Booking> {
    const res = await request<{ booking: Booking }>({
      method: "GET",
      url: `/bookings/${id}`,
    });
    return res.data.booking;
  },

  async cancel(id: string): Promise<void> {
    await request<null>({ method: "PATCH", url: `/bookings/${id}/cancel` });
  },
};

export const paymentsService = {
  async createOrder(bookingId: string): Promise<RazorpayOrder> {
    const res = await request<RazorpayOrder>({
      method: "POST",
      url: "/payments/create-order",
      data: { bookingId },
    });
    return res.data;
  },

  async verify(payload: {
    bookingId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<void> {
    await request<null>({ method: "POST", url: "/payments/verify", data: payload });
  },

  async reportFailure(bookingId: string): Promise<void> {
    await request<null>({
      method: "POST",
      url: "/payments/failure",
      data: { bookingId },
    });
  },
};

export const ticketsService = {
  async my(page = 1, limit = 20): Promise<{ data: Ticket[]; pagination?: Pagination }> {
    const res = await request<Ticket[]>({
      method: "GET",
      url: "/tickets/my",
      params: { page, limit },
    });
    return { data: res.data, pagination: res.pagination };
  },

  async detail(id: string): Promise<Ticket> {
    const res = await request<Ticket>({
      method: "GET",
      url: `/tickets/${id}`,
    });
    return res.data;
  },
};