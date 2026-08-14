import { Badge } from "@/components/ui/Badge";

const eventTones: Record<string, "default" | "accent" | "success" | "warning" | "danger" | "neutral"> = {
  draft: "neutral",
  pending: "warning",
  published: "success",
  rejected: "danger",
  cancelled: "danger",
  completed: "neutral",
};

const bookingTones: Record<string, "default" | "accent" | "success" | "warning" | "danger" | "neutral"> = {
  confirmed: "success",
  pending: "warning",
  cancelled: "danger",
  expired: "neutral",
  refunded: "neutral",
  failed: "danger",
};

const paymentTones: Record<string, "default" | "accent" | "success" | "warning" | "danger" | "neutral"> = {
  successful: "success",
  paid: "success",
  pending: "warning",
  created: "warning",
  failed: "danger",
  refunded: "neutral",
  refund_requested: "warning",
};

export function EventStatusBadge({ status }: { status: string }) {
  return <Badge variant={eventTones[status] ?? "default"}>{status}</Badge>;
}

export function BookingStatusBadge({ status }: { status: string }) {
  return <Badge variant={bookingTones[status] ?? "default"}>{status}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return <Badge variant={paymentTones[status] ?? "default"}>{status}</Badge>;
}

export function TicketStatusBadge({ status }: { status: string }) {
  const tone =
    status === "active"
      ? "success"
      : status === "used"
        ? "neutral"
        : status === "cancelled"
          ? "danger"
          : "neutral";
  return <Badge variant={tone}>{status}</Badge>;
}