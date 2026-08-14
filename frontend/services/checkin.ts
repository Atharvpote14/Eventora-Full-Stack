import { request } from "@/lib/api";
import type { VerifyResult } from "@/types";

export const checkinService = {
  async verify(ticketNumber: string): Promise<VerifyResult> {
    const res = await request<VerifyResult>({
      method: "POST",
      url: "/tickets/verify",
      data: { ticketNumber },
    });
    return res.data;
  },
};
