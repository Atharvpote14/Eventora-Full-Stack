"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Heart,
  LogOut,
  MapPin,
  Ticket,
} from "lucide-react";
import { RequireAuth, useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { bookingsService, ticketsService } from "@/services/bookings";
import { notificationsService, wishlistService } from "@/services/user";
import { EventImage } from "@/components/EventImage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Section";
import { getErrorMessage } from "@/lib/api";
import {
  cn,
  formatDate,
  formatDateTime,
  formatINR,
  initials,
  timeAgo,
} from "@/lib/utils";
import type { Booking, Notification, Ticket as TicketType, WishlistItem } from "@/types";

type Tab = "bookings" | "tickets" | "wishlist" | "notifications";

const BOOKING_TONE: Record<Booking["bookingStatus"], "success" | "warning" | "danger" | "neutral" | "accent"> = {
  confirmed: "success",
  pending: "warning",
  cancelled: "danger",
  expired: "neutral",
  refunded: "neutral",
};

const TABS: { id: Tab; label: string }[] = [
  { id: "bookings", label: "Bookings" },
  { id: "tickets", label: "Tickets" },
  { id: "wishlist", label: "Wishlist" },
  { id: "notifications", label: "Notifications" },
];

export default function AccountPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-700 border-t-ember-500" />
          </div>
        }
      >
        <AccountContent />
      </Suspense>
    </RequireAuth>
  );
}

function AccountContent() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab") as Tab | null;
  const tab: Tab =
    requestedTab && TABS.some((t) => t.id === requestedTab) ? requestedTab : "bookings";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <AccountHeader />
      <nav
        className="no-scrollbar -mx-4 mt-8 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0"
        aria-label="Account sections"
      >
        {TABS.map((item) => (
          <Link
            key={item.id}
            href={`/account?tab=${item.id}`}
            scroll={false}
            className={cn(
              "shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === item.id
                ? "bg-ink-800 text-paper"
                : "text-paper-dim hover:text-paper",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">
        {tab === "bookings" && <BookingsTab />}
        {tab === "tickets" && <TicketsTab />}
        {tab === "wishlist" && <WishlistTab />}
        {tab === "notifications" && <NotificationsTab />}
      </div>
    </div>
  );
}

function AccountHeader() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ember-500/20 text-lg font-bold text-ember-300">
          {initials(user.name)}
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-paper">{user.name}</h1>
          <p className="text-sm text-paper-dim">
            {user.email}
            {user.city ? ` · ${user.city}` : ""}
            {user.phone ? ` · ${user.phone}` : ""}
          </p>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={() => void logout()}>
        <LogOut className="h-4 w-4" aria-hidden /> Log out
      </Button>
    </div>
  );
}

function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingsService.my(1, 50);
      setBookings(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await bookingsService.my(1, 50);
        if (!cancelled) setBookings(res.data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cancel = async (bookingId: string) => {
    const booking = bookings.find((b) => b._id === bookingId);
    if (!booking || !window.confirm(`Cancel booking ${booking.reference}?`)) return;
    try {
      await bookingsService.cancel(bookingId);
      await load();
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) return <p className="text-sm text-red-600 dark:text-red-300">{error}</p>;

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays className="h-6 w-6" aria-hidden />}
        title="No bookings yet"
        description="When you book an event, it will show up here."
        action="Explore events"
        actionHref="/events"
      />
    );
  }

  return (
    <ul className="space-y-3">
      {bookings.map((booking) => {
        const cancellable = ["pending", "confirmed"].includes(booking.bookingStatus);
        return (
          <li
            key={booking._id}
            className="flex flex-col gap-4 rounded-lg border border-ink-800 bg-ink-850 p-4 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-paper">{booking.event.title}</h3>
                <Badge variant={BOOKING_TONE[booking.bookingStatus]}>
                  {booking.bookingStatus}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-paper-dim">
                {formatDateTime(booking.event.date, booking.event.startTime)} ·{" "}
                {booking.event.city}
              </p>
              <p className="mt-1 text-xs text-paper-faint">
                {booking.ticketType.name} × {booking.quantity} · {booking.reference}
              </p>
              {booking.bookingStatus === "pending" && booking.expiresAt && (
                <p className="mt-1 text-xs text-sand-500">
                  Complete payment before{" "}
                  {new Date(booking.expiresAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
              <span className="font-bold text-paper">{formatINR(booking.total)}</span>
              <div className="flex gap-2">
                {booking.bookingStatus === "confirmed" && (
                  <Link href={`/confirmation?bookingId=${booking._id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                )}
                {booking.bookingStatus === "pending" && (
                  <Link href={`/checkout?bookingId=${booking._id}`}>
                    <Button variant="primary" size="sm">
                      Complete payment
                    </Button>
                  </Link>
                )}
                {cancellable && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => void cancel(booking._id)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function TicketsTab() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketsService
      .my(1, 50)
      .then((res) => setTickets(res.data))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="skeleton h-40 rounded-lg" />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={<Ticket className="h-6 w-6" aria-hidden />}
        title="No tickets yet"
        description="Your purchased tickets appear here with QR codes for check-in."
        action="Explore events"
        actionHref="/events"
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tickets.map((ticket) => (
        <Link
          key={ticket._id}
          href={`/ticket/${ticket._id}`}
          className="group rounded-lg border border-ink-800 bg-ink-850 p-4 transition-colors hover:border-ink-600"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-sm font-semibold text-paper group-hover:text-ember-300">
              {ticket.event?.title ?? "Event"}
            </p>
            <Badge
              variant={
                ticket.status === "active"
                  ? "success"
                  : ticket.status === "used"
                    ? "neutral"
                    : "danger"
              }
              className="shrink-0"
            >
              {ticket.status}
            </Badge>
          </div>
          <p className="mt-2 text-xs text-paper-dim">
            {ticket.event?.date ? formatDate(ticket.event.date) : "—"} ·{" "}
            {ticket.ticketType}
          </p>
          <p className="mt-3 flex items-center gap-1.5 font-mono text-[11px] text-paper-faint">
            <Ticket className="h-3.5 w-3.5" aria-hidden />
            {ticket.ticketNumber}
          </p>
        </Link>
      ))}
    </div>
  );
}

function WishlistTab() {
  const { refresh, ids } = useWishlist();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await wishlistService.list();
        if (!cancelled) setItems(res);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ids.size]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton aspect-[4/5] rounded-lg" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="h-6 w-6" aria-hidden />}
        title="No saved events yet"
        description="Tap the heart on any event to save it here."
        action="Explore events"
        actionHref="/events"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item._id}
          href={`/events/${item.event.slug}`}
          className="group overflow-hidden rounded-lg border border-ink-800 bg-ink-850 transition-colors hover:border-ink-600"
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            <EventImage
              src={item.event.coverImage}
              alt={item.event.title}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink-950/90 to-transparent" />
            <div className="absolute inset-x-0 bottom-2.5 px-3">
              <h3 className="line-clamp-1 text-sm font-semibold text-paper">
                {item.event.title}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-paper-dim">
                <MapPin className="h-3 w-3" aria-hidden />
                {item.event.city}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await notificationsService.list(1, 30);
        if (!cancelled) setNotifications(res);
      } catch {
        if (!cancelled) setNotifications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    try {
      await notificationsService.markRead(id);
    } catch {
      // Optimistic update; refresh on next load.
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await notificationsService.markAllRead();
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<Bell className="h-6 w-6" aria-hidden />}
        title="No notifications"
        description="Booking updates and event news will appear here."
      />
    );
  }

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      {unread > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-paper-dim">
            {unread} unread notification{unread === 1 ? "" : "s"}
          </p>
          <Button variant="ghost" size="sm" onClick={() => void markAllRead()}>
            Mark all as read
          </Button>
        </div>
      )}
      <ul className="space-y-2">
        {notifications.map((notification) => (
          <li key={notification._id}>
            <button
              type="button"
              onClick={() => void markRead(notification._id)}
              className={cn(
                "w-full rounded-lg border px-4 py-3.5 text-left transition-colors",
                notification.isRead
                  ? "border-ink-800 bg-ink-850"
                  : "border-ember-600/40 bg-ember-500/5",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-paper">
                  {notification.title}
                </span>
                <span className="shrink-0 text-xs text-paper-faint">
                  {timeAgo(notification.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-sm text-paper-dim">{notification.message}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}