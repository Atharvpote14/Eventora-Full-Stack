"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MapPin, Ticket as TicketIcon } from "lucide-react";
import { RequireAuth } from "@/contexts/AuthContext";
import { ticketsService } from "@/services/bookings";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/utils";
import type { Ticket } from "@/types";

const STATUS_TONE: Record<Ticket["status"], "success" | "warning" | "danger" | "neutral"> = {
  active: "success",
  used: "neutral",
  cancelled: "danger",
  expired: "danger",
};

export default function TicketPage() {
  return (
    <RequireAuth>
      <TicketContent />
    </RequireAuth>
  );
}

function TicketContent() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const detail = await ticketsService.detail(id);
        if (!cancelled) setTicket(detail);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-ink-700 border-t-ember-500" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <TicketIcon className="h-14 w-14 text-paper-faint" aria-hidden />
        <h1 className="mt-4 text-xl font-semibold text-paper">Ticket not found</h1>
        <p className="mt-2 text-sm text-paper-dim">
          {error ?? "This ticket does not exist or you don't have access to it."}
        </p>
        <Link href="/account" className="mt-6">
          <Button variant="outline">My bookings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="fade-up mx-auto max-w-xl px-4 py-14 sm:px-6">
      <div className="overflow-hidden rounded-xl border border-ink-700 bg-ink-850">
        <div className="flex items-center justify-between border-b border-ink-800 px-6 py-4">
          <p className="text-lg font-bold tracking-tight text-paper">
            Event<span className="text-ember-500">ora</span>
          </p>
          <Badge variant={STATUS_TONE[ticket.status]} className="uppercase">
            {ticket.status}
          </Badge>
        </div>

        <div className="px-6 pb-6 pt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ember-400">
            {ticket.ticketType}
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight text-paper">
            {ticket.event?.title ?? "Event"}
          </h1>

          <div className="mt-5 space-y-1.5 text-sm text-paper-dim">
            {ticket.event?.date && (
              <p>
                {formatDate(ticket.event.date)}
                {ticket.event.time ? ` · ${formatTime(ticket.event.time)}` : ""}
              </p>
            )}
            {ticket.event && (
              <p className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-paper-faint" aria-hidden />
                {ticket.event.venue}
                {ticket.event.city ? ` · ${ticket.event.city}` : ""}
              </p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-ink-800 bg-ink-900 p-4 text-sm">
            <div>
              <p className="text-xs text-paper-faint">Ticket holder</p>
              <p className="mt-0.5 font-medium text-paper">
                {ticket.user?.name ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-paper-faint">Booking</p>
              <p className="mt-0.5 font-mono text-paper">
                {ticket.bookingReference ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-paper-faint">Ticket number</p>
              <p className="mt-0.5 font-mono text-paper">{ticket.ticketNumber}</p>
            </div>
            <div>
              <p className="text-xs text-paper-faint">Status</p>
              <p className="mt-0.5 capitalize text-paper">{ticket.status}</p>
            </div>
          </div>

          {ticket.qrCodeImage && (
            <div className="mt-6 flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ticket.qrCodeImage}
                alt={`QR code for ticket ${ticket.ticketNumber}`}
                className="h-44 w-44 rounded-md bg-white p-2"
              />
              <p className="text-xs text-paper-faint">
                Show this QR at the venue for check-in
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Link href="/account" className="inline-flex">
          <Button variant="outline">Back to my bookings</Button>
        </Link>
      </div>
    </div>
  );
}