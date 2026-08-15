import { request } from "@/lib/api";
import type { HeroSlide } from "@/types";

export const heroService = {
  async slides(): Promise<HeroSlide[]> {
    const res = await request<HeroSlide[]>({ url: "/hero/slides" });
    return res.data;
  },

  async all(): Promise<HeroSlide[]> {
    const res = await request<HeroSlide[]>({ url: "/hero/slides/all" });
    return res.data;
  },

  async create(data: { image: string; link?: string }): Promise<HeroSlide> {
    const res = await request<{ slide: HeroSlide }>({
      method: "POST",
      url: "/hero/slides",
      data,
    });
    return res.data.slide;
  },

  async update(
    id: string,
    data: { image?: string; link?: string; isActive?: boolean },
  ): Promise<HeroSlide> {
    const res = await request<{ slide: HeroSlide }>({
      method: "PATCH",
      url: `/hero/slides/${id}`,
      data,
    });
    return res.data.slide;
  },

  async remove(id: string): Promise<void> {
    await request<null>({ method: "DELETE", url: `/hero/slides/${id}` });
  },
};
