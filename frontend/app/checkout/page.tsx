"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Lock, ShieldCheck } from "lucide-react";
import { RequireAuth, useAuth } from "@/contexts/AuthContext";
import { eventsService } from "@/services/events";
import { bookingsService, paymentsService } from "@/services/bookings";
import { openRazorpay } from "@/lib/razorpay";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EventImage } from "@/components/EventImage";
import { getErrorMessage } from "@/lib/api";
import { formatDate, formatTime, formatINR, categoryName } from "@/lib/utils";
import type { Booking, EventDetail } from "@/types";

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-700 border-t-ember-500" />
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </RequireAuth>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refresh } = useAuth();

  const eventId = searchParams.get("eventId") ?? "";
  const ticketTypeId = searchParams.get("ticketTypeId") ?? "";
  const quantity = Math.max(1, Number(searchParams.get("qty")) || 1);

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ticket = useMemo(
    () => event?.ticketTypes.find((t) => t._id === ticketTypeId),
    [event, ticketTypeId],
  );

  const subtotal = ticket ? ticket.price * quantity : 0;
  const total = ticket ? subtotal + 50 : 0;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const detail = await eventsService.byId(eventId);
        if (!cancelled) setEvent(detail.event);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoadingEvent(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const proceed = async (formEvent: FormEvent) => {
    formEvent.preventDefault();
    if (!eventId || !ticket) return;
    setProcessing(true);
    setError(null);

    let createdBooking: Booking | null = null;

    try {
      createdBooking = await bookingsService.create({
        eventId,
        ticketTypeId,
        quantity,
      });

      const order = await paymentsService.createOrder(createdBooking._id);

      const razorpay = await openRazorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Eventora",
        description: `${event?.title ?? "Event"} · ${createdBooking.reference}`,
        order_id: order.orderId,
        prefill: {
          name,
          email,
          contact: phone || undefined,
        },
        theme: { color: "#e4572e" },
        handler: async (response) => {
          try {
            await paymentsService.verify({
              bookingId: createdBooking?._id ?? "",
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await refresh();
            router.push(`/confirmation?bookingId=${createdBooking?._id ?? ""}`);
          } catch (err) {
            setError(getErrorMessage(err));
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            if (createdBooking) {
              paymentsService.reportFailure(createdBooking._id).catch(() => {});
            }
            setError(
              "Payment was cancelled. Your booking was not charged. You can try again.",
            );
            setProcessing(false);
          },
        },
      });

      razorpay.open();
    } catch (err) {
      if (createdBooking) {
        paymentsService.reportFailure(createdBooking._id).catch(() => {});
      }
      setError(getErrorMessage(err));
      setProcessing(false);
    }
  };

  if (loadingEvent) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="skeleton h-8 w-64 rounded" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="skeleton h-64 rounded-lg" />
          <div className="skeleton h-72 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!event || !ticket) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-xl font-semibold text-paper">Checkout unavailable</h1>
        <p className="mt-2 text-sm text-paper-dim">{error ?? "Invalid booking details."}</p>
        <Link
          href="/events"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-ember-500 px-5 text-sm font-semibold text-white hover:bg-ember-400"
        >
          Browse events
        </Link>
      </div>
    );
  }

  const remaining = ticket.capacity - ticket.sold;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href={`/events/${event.slug}`}
        className="text-sm text-paper-dim transition-colors hover:text-paper"
      >
        ← Back to event
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-paper sm:text-3xl">
        Checkout
      </h1>

      <form
        onSubmit={(event) => void proceed(event)}
        className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]"
        noValidate
      >
        <div className="space-y-6">
          <section className="rounded-lg border border-ink-700 bg-ink-850 p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-paper-faint">
              Your details
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <Input
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Input
                label="Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                helper="Used for booking updates."
              />
            </div>
          </section>

          <section className="rounded-lg border border-ink-700 bg-ink-850 p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-paper-faint">
              Payment
            </h2>
            <p className="mt-3 flex items-start gap-2 text-sm text-paper-dim">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-moss-500" aria-hidden />
              Payment is handled securely by Razorpay. You will be redirected to a
              secure checkout to complete your booking. Your card details never
              touch Eventora.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-md border border-ink-700 bg-ink-900 px-3.5 py-3">
              <ShieldCheck className="h-5 w-5 text-moss-500" aria-hidden />
              <span className="text-sm text-paper-dim">
                Powered by <span className="font-semibold text-paper">Razorpay</span>
              </span>
            </div>
          </section>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-md border border-red-200 bg-red-100 px-3.5 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {error}
            </p>
          )}

          <Button type="submit" size="lg" loading={processing} className="w-full lg:w-auto">
            {processing ? "Preparing payment…" : `Proceed to payment · ${formatINR(total)}`}
          </Button>
        </div>

        <aside className="rounded-lg border border-ink-700 bg-ink-850 p-5 lg:sticky lg:top-24">
          <div className="flex gap-4">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md">
              <EventImage src={event.coverImage} alt={event.title} sizes="80px" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-ember-400">
                {categoryName(event.category)}
              </p>
              <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold text-paper">
                {event.title}
              </h3>
              <p className="mt-1 text-xs text-paper-faint">
                {formatDate(event.date)} · {formatTime(event.startTime)}
              </p>
              <p className="text-xs text-paper-faint">
                {event.city}
                {event.venue ? ` · ${event.venue}` : ""}
              </p>
            </div>
          </div>

          <dl className="mt-5 space-y-2 border-t border-ink-800 pt-4 text-sm">
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
            <div className="flex justify-between border-t border-ink-800 pt-2.5 text-base font-bold text-paper">
              <dt>Total</dt>
              <dd className={ticket.price > 0 ? "text-ember-400" : "text-moss-500"}>
                {formatINR(total)}
              </dd>
            </div>
          </dl>
          {remaining <= 5 && remaining > 0 && (
            <p className="mt-4 text-xs text-sand-500">
              Only {remaining} ticket{remaining === 1 ? "" : "s"} left for this ticket type.
            </p>
          )}
        </aside>
      </form>
    </div>
  );
}