"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import type { EventDetail } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatINR, availabilityLabel } from "@/lib/utils";

export function BookingPanel({ event }: { event: EventDetail }) {
  const router = useRouter();
  const [ticketTypeId, setTicketTypeId] = useState<string>(
    event.ticketTypes[0]?._id ?? "",
  );
  const [quantity, setQuantity] = useState(1);

  const ticket = useMemo(
    () => event.ticketTypes.find((t) => t._id === ticketTypeId),
    [event.ticketTypes, ticketTypeId],
  );

  const available = ticket ? ticket.capacity - ticket.sold : 0;
  const availability = ticket ? availabilityLabel(ticket.sold, ticket.capacity) : null;
  const soldOut = ticket ? available <= 0 : false;

  const subtotal = ticket ? ticket.price * quantity : 0;
  const total = ticket ? subtotal + 50 : 0;

  const continueToBooking = () => {
    if (!ticket) return;
    router.push(
      `/checkout?eventId=${event._id}&ticketTypeId=${ticket._id}&qty=${quantity}`,
    );
  };

  if (event.ticketTypes.length === 0) {
    return (
      <div className="rounded-lg border border-ink-700 bg-ink-850 p-5">
        <p className="text-sm text-paper-dim">
          Tickets are not on sale for this event yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ink-700 bg-ink-850 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-paper-faint">
        Tickets
      </h2>

      <div className="mt-4 space-y-3">
        {event.ticketTypes.map((t) => {
          const remaining = t.capacity - t.sold;
          const soldOutType = remaining <= 0;
          return (
            <label
              key={t._id}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3.5 transition-colors ${
                ticketTypeId === t._id
                  ? "border-ember-600 bg-ember-500/5"
                  : "border-ink-700 hover:border-ink-600"
              } ${soldOutType ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="ticket-type"
                  checked={ticketTypeId === t._id}
                  onChange={() => {
                    setTicketTypeId(t._id);
                    setQuantity(1);
                  }}
                  disabled={soldOutType}
                  className="h-4 w-4 accent-ember-500"
                />
                <span>
                  <span className="block text-sm font-medium text-paper">{t.name}</span>
                  <span className="mt-0.5 block text-xs text-paper-faint">
                    {soldOutType ? "Sold out" : `${remaining} left`}
                  </span>
                </span>
              </span>
              <span className="text-sm font-bold text-paper">
                {t.price > 0 ? formatINR(t.price) : "Free"}
              </span>
            </label>
          );
        })}
      </div>

      {ticket && !soldOut && (
        <div className="mt-5">
          {availability && (
            <Badge variant={availability === "Selling fast" ? "warning" : "danger"} className="mb-3">
              {availability}
            </Badge>
          )}
          <div className="flex items-center justify-between rounded-md border border-ink-700 bg-ink-900 p-3">
            <span className="text-sm text-paper-dim">Quantity</span>
            <span className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-700 text-paper transition-colors hover:border-ink-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" aria-hidden />
              </button>
              <span className="w-6 text-center text-base font-semibold text-paper">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, available, q + 1))}
                disabled={quantity >= Math.min(10, available)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-700 text-paper transition-colors hover:border-ink-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
              </button>
            </span>
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-paper-dim">
              <dt>
                {ticket.name} × {quantity}
              </dt>
              <dd>{subtotal > 0 ? formatINR(subtotal) : "Free"}</dd>
            </div>
            <div className="flex justify-between text-paper-dim">
              <dt>Booking fee</dt>
              <dd>{formatINR(50)}</dd>
            </div>
            <div className="flex justify-between border-t border-ink-700 pt-2 text-base font-bold text-paper">
              <dt>Total</dt>
              <dd className={ticket.price > 0 ? "text-ember-400" : "text-moss-500"}>
                {formatINR(total)}
              </dd>
            </div>
          </dl>

          <Button
            className="mt-5 w-full"
            size="lg"
            onClick={continueToBooking}
            disabled={!ticket || soldOut}
          >
            Continue to booking
          </Button>
        </div>
      )}
    </div>
  );
}