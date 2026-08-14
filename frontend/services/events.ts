import { request } from "@/lib/api";
import type {
  Category,
  EventDetail,
  EventDetailResponse,
  EventListItem,
  EventPayload,
  EventQuery,
  Pagination,
  Review,
} from "@/types";

export const eventsService = {
  async list(
    query: EventQuery = {},
  ): Promise<{ data: EventListItem[]; pagination?: Pagination }> {
    const params: Record<string, string | number | undefined> = {
      page: query.page ?? 1,
      limit: query.limit ?? 12,
      sort: query.sort ?? "date_asc",
    };
    if (query.search) params.search = query.search;
    if (query.category) params.category = query.category;
    if (query.city) params.city = query.city;
    if (query.date) params.date = query.date;
    if (query.minPrice !== undefined) params.minPrice = query.minPrice;
    if (query.maxPrice !== undefined) params.maxPrice = query.maxPrice;
    const res = await request<EventListItem[]>({
      method: "GET",
      url: "/events",
      params,
    });
    return { data: res.data, pagination: res.pagination };
  },

  async featured(limit = 10): Promise<EventListItem[]> {
    const res = await request<EventListItem[]>({
      method: "GET",
      url: "/events/featured",
      params: { limit },
    });
    return res.data;
  },

  async upcoming(limit = 10): Promise<EventListItem[]> {
    const res = await request<EventListItem[]>({
      method: "GET",
      url: "/events/upcoming",
      params: { limit },
    });
    return res.data;
  },

  async popular(limit = 10): Promise<EventListItem[]> {
    const res = await request<EventListItem[]>({
      method: "GET",
      url: "/events/popular",
      params: { limit },
    });
    return res.data;
  },

  async detail(slug: string): Promise<EventDetailResponse> {
    const res = await request<EventDetailResponse>({
      method: "GET",
      url: `/events/slug/${slug}`,
    });
    return res.data;
  },

  async byId(id: string): Promise<EventDetailResponse> {
    const res = await request<EventDetailResponse>({
      method: "GET",
      url: `/events/${id}`,
    });
    return res.data;
  },

  async reviews(
    eventId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Review[]; pagination?: Pagination }> {
    const res = await request<{ reviews: Review[] }>({
      method: "GET",
      url: `/events/${eventId}/reviews`,
      params: { page, limit },
    });
    return { data: res.data.reviews, pagination: res.pagination };
  },

  async createReview(eventId: string, rating: number, comment: string): Promise<Review> {
    const res = await request<{ review: Review }>({
      method: "POST",
      url: `/events/${eventId}/reviews`,
      data: { rating, comment },
    });
    return res.data.review;
  },
};

export const eventCrudService = {
  async create(payload: EventPayload): Promise<EventDetail> {
    const res = await request<{ event: EventDetail }>({
      method: "POST",
      url: "/events",
      data: payload,
    });
    return res.data.event;
  },

  async update(id: string, payload: Partial<EventPayload>): Promise<EventDetail> {
    const res = await request<{ event: EventDetail }>({
      method: "PUT",
      url: `/events/${id}`,
      data: payload,
    });
    return res.data.event;
  },

  async publish(id: string): Promise<EventDetail> {
    const res = await request<{ event: EventDetail }>({
      method: "PATCH",
      url: `/events/${id}/publish`,
    });
    return res.data.event;
  },

  async cancel(id: string): Promise<void> {
    await request<null>({ method: "PATCH", url: `/events/${id}/cancel` });
  },

  async remove(id: string): Promise<void> {
    await request<null>({ method: "DELETE", url: `/events/${id}` });
  },
};

export const categoriesService = {
  async list(): Promise<Category[]> {
    const res = await request<Category[]>({ method: "GET", url: "/categories" });
    return res.data;
  },
};