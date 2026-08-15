"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, TrendingUp, Users } from "lucide-react";
import { adminService } from "@/services/admin";
import { StatCard } from "@/components/dashboard/StatCard";
import { HBarList } from "@/components/dashboard/HBarList";
import { Loader } from "@/components/Loader";
import { getErrorMessage } from "@/lib/api";
import { formatINR } from "@/lib/utils";

export function AnalyticsTab() {
  const [data, setData] = useState<Awaited<ReturnType<typeof adminService.analytics>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminService.analytics();
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
      <div className="flex min-h-64 items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) return <p className="text-sm text-red-600 dark:text-red-300">{error}</p>;
  if (!data) return null;

  const totalEvents = data.eventsByStatus.reduce((sum, s) => sum + s.count, 0);
  const statusBar = data.eventsByStatus.map((s) => ({
    key: s._id,
    count: s.count,
    pct: totalEvents ? (s.count / totalEvents) * 100 : 0,
  }));

  const statusColors: Record<string, string> = {
    draft: "bg-ink-600",
    pending: "bg-sand-500",
    published: "bg-moss-500",
    rejected: "bg-red-400",
    cancelled: "bg-red-700",
    completed: "bg-ink-500",
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<TrendingUp className="h-5 w-5" aria-hidden />}
          label="Revenue"
          value={formatINR(data.totals.revenue)}
          tone="accent"
        />
        <StatCard
          icon={<Users className="h-5 w-5" aria-hidden />}
          label="Users"
          value={String(data.totals.users)}
          sub={`${data.totals.organizers} organizers`}
        />
        <StatCard
          icon={<LayoutGrid className="h-5 w-5" aria-hidden />}
          label="Events"
          value={String(data.totals.events)}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" aria-hidden />}
          label="Bookings"
          value={String(data.totals.bookings)}
        />
      </div>

      <section className="rounded-lg border border-ink-800 bg-ink-850 p-5">
        <h2 className="mb-4 text-base font-semibold text-paper">Events by status</h2>
        {totalEvents === 0 ? (
          <p className="text-sm text-paper-faint">No events yet.</p>
        ) : (
          <>
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-ink-800">
              {statusBar.map(
                (segment) =>
                  segment.pct > 0 && (
                    <div
                      key={segment.key}
                      className={statusColors[segment.key] ?? "bg-ink-600"}
                      style={{ width: `${segment.pct}%` }}
                      title={`${segment.key}: ${segment.count}`}
                    />
                  ),
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
              {statusBar.map((segment) => (
                <span key={segment.key} className="flex items-center gap-1.5 text-xs text-paper-dim">
                  <span className={`h-2 w-2 rounded-full ${statusColors[segment.key] ?? "bg-ink-600"}`} aria-hidden />
                  {segment.key} · {segment.count}
                </span>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="rounded-lg border border-ink-800 bg-ink-850 p-5">
        <h2 className="mb-4 text-base font-semibold text-paper">Top categories</h2>
        {data.topCategories.length === 0 ? (
          <p className="text-sm text-paper-faint">No categories with events yet.</p>
        ) : (
          <HBarList
            items={data.topCategories.map((category) => ({
              label: category.name,
              value: category.count,
              valueLabel: `${category.count} event${category.count === 1 ? "" : "s"}`,
            }))}
          />
        )}
      </section>
    </div>
  );
}