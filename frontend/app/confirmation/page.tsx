"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Ticket, XCircle } from "lucide-react";
import { RequireAuth } from "@/contexts/AuthContext";
import { bookingsService, ticketsService } from "@/services/bookings";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/Loader";
import { ReceiptPrinter } from "@/components/receipt/ReceiptPrinter";
import { getErrorMessage } from "@/lib/api";
import { formatDate, formatTime, formatINR } from "@/lib/utils";
import type { Booking, Ticket as TicketType } from "@/types";

export default function ConfirmationPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4">
            <Loader />
          </div>
        }
      >
        <ConfirmationContent />
      </Suspense>
    </RequireAuth>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") ?? "";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    let cancelled = false;
    (async () => {
      try {
        const bookingDetail = await bookingsService.detail(bookingId);
        if (cancelled) return;
        setBooking(bookingDetail);
        const ticketPage = await ticketsService.my(1, 50);
        if (!cancelled) {
          setTickets(
            ticketPage.data.filter(
              (t) => t.bookingReference === bookingDetail.reference,
            ),
          );
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <Loader />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
        <XCircle className="h-14 w-14 text-red-600 dark:text-red-300" aria-hidden />
        <h1 className="mt-4 text-xl font-semibold text-paper">
          Could not load this booking
        </h1>
        <p className="mt-2 text-sm text-paper-dim">
          {error ?? "This booking may have expired or been cancelled."}
        </p>
        <Link href="/account" className="mt-6">
          <Button variant="outline">Go to my bookings</Button>
        </Link>
      </div>
    );
  }

  const confirmed = booking.bookingStatus === "confirmed";

  return (
    <div className="fade-up mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        {confirmed ? (
          <CheckCircle2 className="mx-auto h-16 w-16 text-moss-500" aria-hidden />
        ) : (
          <XCircle className="mx-auto h-16 w-16 text-sand-500" aria-hidden />
        )}
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-paper sm:text-3xl">
          {confirmed ? "Booking confirmed" : "Booking not completed"}
        </h1>
        <p className="mt-2 text-sm text-paper-dim">
          {confirmed
            ? "You're all set. Your tickets are ready below."
            : booking.bookingStatus === "pending"
              ? "Your payment was not completed. This booking will expire shortly."
              : "This booking could not be completed."}
        </p>
      </div>

      <div className="mt-10">
        {confirmed ? (
          <>
            <ReceiptPrinter
              reference={booking.reference}
              eventTitle={booking.event?.title ?? "Event no longer available"}
              eventDate={booking.event ? formatDate(booking.event.date) : "—"}
              ticketTypeName={booking.ticketType.name}
              quantity={booking.quantity}
              unitPrice={booking.unitPrice}
              subtotal={booking.subtotal}
              fees={booking.fees}
              total={booking.total}
              paidOn={booking.createdAt}
              paidLabel="PAYMENT SUCCESSFUL"
            />

            {tickets.length > 0 && (
              <div className="mt-10 rounded-lg border border-ink-700 bg-ink-850 p-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-paper-faint">
                  Tickets
                </p>
                <ul className="space-y-2">
                  {tickets.map((ticket) => (
                    <li key={ticket._id}>
                      <Link
                        href={`/ticket/${ticket._id}`}
                        className="flex items-center justify-between rounded-md border border-ink-700 bg-ink-900 px-4 py-3 transition-colors hover:border-ember-600"
                      >
                        <span className="flex items-center gap-2.5 text-sm font-medium text-paper">
                          <Ticket className="h-4 w-4 text-ember-400" aria-hidden />
                          {ticket.ticketNumber}
                        </span>
                        <span className="text-xs text-ember-400">View ticket →</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg border border-ink-700 bg-ink-850 p-6">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-paper-faint">Booking ID</dt>
                <dd className="font-mono font-medium text-paper">{booking.reference}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-paper-faint">Event</dt>
                <dd className="text-right font-medium text-paper">
                  {booking.event?.title ?? "Event no longer available"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-paper-faint">Date</dt>
                <dd className="text-paper">
                  {booking.event
                    ? `${formatDate(booking.event.date)}${
                        booking.event.startTime ? ` · ${formatTime(booking.event.startTime)}` : ""
                      }`
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-paper-faint">Tickets</dt>
                <dd className="text-paper">
                  {booking.ticketType.name} × {booking.quantity}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-paper-faint">Total</dt>
                <dd className="font-bold text-ember-400">{formatINR(booking.total)}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/account" className="inline-flex">
          <Button variant="secondary">My bookings</Button>
        </Link>
        <Link href="/events" className="inline-flex">
          <Button variant="ghost">Back to events</Button>
        </Link>
      </div>
    </div>
  );
}