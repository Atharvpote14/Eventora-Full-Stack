"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CalendarClock,
  CircleDollarSign,
  LayoutGrid,
  Ticket,
  TrendingUp,
} from "lucide-react";
import { organizerService } from "@/services/organizer";
import { StatCard } from "@/components/dashboard/StatCard";
import { HBarList } from "@/components/dashboard/HBarList";
import { Table, Td, Th } from "@/components/dashboard/Table";
import { BookingStatusBadge } from "@/components/dashboard/StatusBadges";
import { getErrorMessage } from "@/lib/api";
import { formatDate, formatINR, timeAgo } from "@/lib/utils";

export function OverviewTab() {
  const [data, setData] = useState<Awaited<ReturnType<typeof organizerService.dashboard>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await organizerService.dashboard();
        if (!cancelled) setData(res);
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

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-lg" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-lg" />
      </div>
    );
  }

  if (error) return <p className="text-sm text-red-600 dark:text-red-300">{error}</p>;
  if (!data) return null;

  const topEvents = data.eventPerformance.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<CircleDollarSign className="h-5 w-5" aria-hidden />}
          label="Total revenue"
          value={formatINR(data.totalRevenue)}
          sub={`${data.ticketsSold} tickets sold`}
          tone="accent"
        />
        <StatCard
          icon={<Ticket className="h-5 w-5" aria-hidden />}
          label="Bookings"
          value={String(data.totalBookings)}
          sub={`${data.upcomingEvents} upcoming events`}
          tone="success"
        />
        <StatCard
          icon={<LayoutGrid className="h-5 w-5" aria-hidden />}
          label="Events"
          value={`${data.publishedEvents}/${data.totalEvents}`}
          sub={`${data.pendingEvents} pending review`}
        />
        <StatCard
          icon={<CalendarClock className="h-5 w-5" aria-hidden />}
          label="Capacity left"
          value={String(data.availableCapacity)}
          sub="Across published events"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-ink-800 bg-ink-850 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-paper">
            <TrendingUp className="h-4 w-4 text-ember-400" aria-hidden />
            Top events by revenue
          </h2>
          {topEvents.length === 0 ? (
            <p className="text-sm text-paper-faint">
              No sales yet. Publish an event to get started.
            </p>
          ) : (
            <HBarList
              items={topEvents.map((event) => ({
                label: event.title,
                value: event.revenue,
                valueLabel: formatINR(event.revenue),
                sub: `${event.ticketsSold}/${event.capacity} tickets · ${event.fillRate}% full`,
              }))}
            />
          )}
        </section>

        <section className="rounded-lg border border-ink-800 bg-ink-850 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-paper">
            <CalendarDays className="h-4 w-4 text-ember-400" aria-hidden />
            Recent bookings
          </h2>
          {data.recentBookings.length === 0 ? (
            <p className="text-sm text-paper-faint">No bookings yet.</p>
          ) : (
            <Table className="min-w-0">
              <thead>
                <tr>
                  <Th>Event</Th>
                  <Th>Attendee</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Total</Th>
                </tr>
              </thead>
              <tbody>
                {data.recentBookings.map((booking) => (
                  <tr key={booking._id} className="border-t border-ink-800">
                    <Td>
                      <p className="max-w-48 truncate font-medium text-paper">
                        {booking.event.title}
                      </p>
                      <p className="text-xs text-paper-faint">{timeAgo(booking.createdAt)}</p>
                    </Td>
                    <Td>
                      <p>{booking.user?.name ?? "—"}</p>
                      <p className="text-xs text-paper-faint">{booking.reference}</p>
                    </Td>
                    <Td>
                      <BookingStatusBadge status={booking.bookingStatus} />
                    </Td>
                    <Td className="text-right font-semibold text-paper">
                      {formatINR(booking.total)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </section>
      </div>

      {data.recentEvents.length > 0 && (
        <section className="rounded-lg border border-ink-800 bg-ink-850 p-5">
          <h2 className="mb-4 text-base font-semibold text-paper">Recent events</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.recentEvents.map((event) => (
              <li key={event._id}>
                <Link
                  href={`/events/${event.slug}`}
                  className="block rounded-md border border-ink-700 p-3 transition-colors hover:border-ember-500/50"
                >
                  <p className="truncate text-sm font-semibold text-paper">{event.title}</p>
                  <p className="mt-1 text-xs text-paper-dim">
                    {formatDate(event.date)} · {event.city}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}