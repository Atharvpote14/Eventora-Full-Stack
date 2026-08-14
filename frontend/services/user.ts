import { request } from "@/lib/api";
import type { Notification, Review, User, WishlistItem } from "@/types";

export const wishlistService = {
  async list(): Promise<WishlistItem[]> {
    const res = await request<{ items: WishlistItem[] }>({
      method: "GET",
      url: "/wishlist",
    });
    return res.data.items;
  },

  async add(eventId: string): Promise<WishlistItem> {
    const res = await request<{ item: WishlistItem }>({
      method: "POST",
      url: `/wishlist/${eventId}`,
    });
    return res.data.item;
  },

  async remove(eventId: string): Promise<void> {
    await request<null>({ method: "DELETE", url: `/wishlist/${eventId}` });
  },
};

export const reviewsService = {
  async update(id: string, rating: number, comment: string): Promise<Review> {
    const res = await request<{ review: Review }>({
      method: "PUT",
      url: `/reviews/${id}`,
      data: { rating, comment },
    });
    return res.data.review;
  },

  async remove(id: string): Promise<void> {
    await request<null>({ method: "DELETE", url: `/reviews/${id}` });
  },
};

export const notificationsService = {
  async list(page = 1, limit = 20): Promise<Notification[]> {
    const res = await request<Notification[]>({
      method: "GET",
      url: "/notifications",
      params: { page, limit },
    });
    return res.data;
  },

  async unreadCount(): Promise<number> {
    const res = await request<{ unreadCount: number }>({
      method: "GET",
      url: "/notifications/unread-count",
    });
    return res.data.unreadCount;
  },

  async markRead(id: string): Promise<void> {
    await request<null>({ method: "PATCH", url: `/notifications/${id}/read` });
  },

  async markAllRead(): Promise<void> {
    await request<null>({ method: "PATCH", url: "/notifications/read-all" });
  },
};

export const userService = {
  async profile(): Promise<{ user: User }> {
    const res = await request<{ user: User }>({
      method: "GET",
      url: "/users/me",
    });
    return res.data;
  },

  async updateProfile(payload: Partial<Pick<User, "name" | "phone" | "city">>): Promise<User> {
    const res = await request<{ user: User }>({
      method: "PUT",
      url: "/users/me",
      data: payload,
    });
    return res.data.user;
  },

  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await request<null>({
      method: "PUT",
      url: "/users/me/password",
      data: payload,
    });
  },
};