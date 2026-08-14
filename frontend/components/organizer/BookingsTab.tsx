"use client";

import { useEffect, useState } from "react";
import { organizerService } from "@/services/organizer";
import { Table, Td, Th } from "@/components/dashboard/Table";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/StatusBadges";
import { EmptyState } from "@/components/ui/Section";
import { getErrorMessage } from "@/lib/api";
import { cn, formatDateTime, formatINR } from "@/lib/utils";
import type { Booking, EventListItem } from "@/types";

const STATUS_FILTERS = ["", "pending", "confirmed", "cancelled", "expired", "refunded", "failed"];

export function BookingsTab() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await organizerService.myEvents(1, 100);
        if (!cancelled) setEvents(res.data);
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = selectedId
          ? await organizerService.eventBookings(selectedId, 1, 100, filter || undefined)
          : await organizerService.allBookings(1, 100, filter || undefined);
        const list = "bookings" in res.data ? res.data.bookings : res.data;
        if (!cancelled) setBookings(list);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, filter]);

  if (loading && events.length === 0 && bookings.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) return <p className="text-sm text-red-600 dark:text-red-300">{error}</p>;

  if (events.length === 0) {
    return (
      <EmptyState
        title="No events yet"
        description="Bookings will appear here once your events have ticket sales."
      />
    );
  }

  const confirmed = bookings.filter((b) => b.bookingStatus === "confirmed").length;
  const tickets = bookings
    .filter((b) => b.bookingStatus === "confirmed")
    .reduce((sum, b) => sum + b.quantity, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <label className="mb-1.5 block text-sm font-medium text-paper-dim">
            Event
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="h-11 w-full rounded-md border border-ink-700 bg-ink-900 px-3 text-sm text-paper focus:border-ember-600 focus:outline-none"
          >
            <option value="">All my events</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-paper-dim">
          <span className="font-semibold text-paper">{confirmed}</span> confirmed ·{" "}
          <span className="font-semibold text-paper">{tickets}</span> tickets
        </p>
      </div>

      <div className="no-scrollbar flex gap-1 overflow-x-auto">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              filter === status ? "bg-ink-800 text-paper" : "text-paper-dim hover:text-paper",
            )}
          >
            {status === "" ? "All" : status}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <p className="text-sm text-paper-faint">No bookings match this filter.</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Event</Th>
              <Th>Reference</Th>
              <Th>Attendee</Th>
              <Th>Ticket</Th>
              <Th>Booking</Th>
              <Th>Payment</Th>
              <Th className="text-right">Total</Th>
              <Th>Booked</Th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} className="border-t border-ink-800">
                <Td>
                  <p className="max-w-44 truncate font-medium text-paper">
                    {booking.event?.title ?? "Event removed"}
                  </p>
                  <p className="text-xs text-paper-faint">
                    {booking.event ? formatDateTime(booking.event.date) : "—"}
                  </p>
                </Td>
                <Td className="font-mono text-xs text-paper">{booking.reference}</Td>
                <Td>
                  <p className="max-w-40 truncate font-medium text-paper">
                    {booking.user?.name ?? "—"}
                  </p>
                  <p className="max-w-40 truncate text-xs text-paper-faint">
                    {booking.user?.email ?? ""}
                  </p>
                </Td>
                <Td>
                  <p>{booking.ticketType.name}</p>
                  <p className="text-xs text-paper-faint">× {booking.quantity}</p>
                </Td>
                <Td>
                  <BookingStatusBadge status={booking.bookingStatus} />
                </Td>
                <Td>
                  <PaymentStatusBadge status={booking.paymentStatus} />
                </Td>
                <Td className="text-right font-semibold text-paper">
                  {formatINR(booking.total)}
                </Td>
                <Td className="text-xs text-paper-faint">
                  {formatDateTime(booking.createdAt)}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}