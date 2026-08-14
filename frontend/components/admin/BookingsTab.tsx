"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/admin";
import { Table, Td, Th } from "@/components/dashboard/Table";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/StatusBadges";
import { EmptyState } from "@/components/ui/Section";
import { getErrorMessage } from "@/lib/api";
import { formatDateTime, formatINR } from "@/lib/utils";

interface AdminBooking {
  _id: string;
  bookingReference: string;
  event: { title: string; slug: string } | null;
  user: { name: string; email: string } | null;
  ticketType: string;
  quantity: number;
  amount: number;
  bookingStatus: string;
  paymentStatus: string;
  createdAt: string;
}

export function BookingsTab() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminService.bookings(1, 50);
        if (!cancelled) setBookings(res.data as unknown as AdminBooking[]);
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
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-14 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) return <p className="text-sm text-red-600 dark:text-red-300">{error}</p>;

  if (bookings.length === 0) {
    return <EmptyState title="No bookings yet" />;
  }

  return (
    <Table>
      <thead>
        <tr>
          <Th>Reference</Th>
          <Th>Event</Th>
          <Th>User</Th>
          <Th>Ticket</Th>
          <Th>Booking</Th>
          <Th>Payment</Th>
          <Th className="text-right">Total</Th>
          <Th>Created</Th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((booking) => (
          <tr key={booking._id} className="border-t border-ink-800">
            <Td className="font-mono text-xs text-paper">{booking.bookingReference}</Td>
            <Td className="max-w-52 truncate text-paper">{booking.event?.title ?? "—"}</Td>
            <Td>
              <p className="max-w-40 truncate text-paper">{booking.user?.name ?? "—"}</p>
              <p className="max-w-40 truncate text-xs text-paper-faint">
                {booking.user?.email ?? ""}
              </p>
            </Td>
            <Td>
              <p>{booking.ticketType}</p>
              <p className="text-xs text-paper-faint">× {booking.quantity}</p>
            </Td>
            <Td>
              <BookingStatusBadge status={booking.bookingStatus} />
            </Td>
            <Td>
              <PaymentStatusBadge status={booking.paymentStatus} />
            </Td>
            <Td className="text-right font-semibold text-paper">{formatINR(booking.amount)}</Td>
            <Td className="text-xs text-paper-faint">{formatDateTime(booking.createdAt)}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}