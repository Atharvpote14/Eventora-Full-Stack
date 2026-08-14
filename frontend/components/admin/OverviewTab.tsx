"use client";

import { useEffect, useState } from "react";
import { CircleDollarSign, Clock3, LayoutGrid, Ticket, UserRound, Users } from "lucide-react";
import { adminService } from "@/services/admin";
import { StatCard } from "@/components/dashboard/StatCard";
import { getErrorMessage } from "@/lib/api";
import { formatINR } from "@/lib/utils";

export function OverviewTab() {
  const [data, setData] = useState<Awaited<ReturnType<typeof adminService.dashboard>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminService.dashboard();
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) return <p className="text-sm text-red-600 dark:text-red-300">{error}</p>;
  if (!data) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<CircleDollarSign className="h-5 w-5" aria-hidden />}
        label="Revenue"
        value={formatINR(data.revenue)}
        tone="accent"
      />
      <StatCard
        icon={<Users className="h-5 w-5" aria-hidden />}
        label="Users"
        value={String(data.users)}
        sub={`${data.organizers} organizers`}
      />
      <StatCard
        icon={<LayoutGrid className="h-5 w-5" aria-hidden />}
        label="Events"
        value={String(data.events)}
        sub={`${data.pendingEvents} pending review`}
        tone="warning"
      />
      <StatCard
        icon={<Ticket className="h-5 w-5" aria-hidden />}
        label="Bookings"
        value={String(data.bookings)}
        sub={`${data.payments} payments`}
        tone="success"
      />
      <StatCard
        icon={<UserRound className="h-5 w-5" aria-hidden />}
        label="Organizers"
        value={String(data.organizers)}
        sub="Registered organizers"
      />
      <StatCard
        icon={<Clock3 className="h-5 w-5" aria-hidden />}
        label="Pending moderation"
        value={String(data.pendingEvents)}
        sub="Events awaiting approval"
        tone={data.pendingEvents > 0 ? "warning" : "success"}
      />
    </div>
  );
}