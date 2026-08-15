"use client";

import { useEffect, useState } from "react";
import { BarChart3, CircleDollarSign, Ticket } from "lucide-react";
import { organizerService } from "@/services/organizer";
import { AreaChart } from "@/components/dashboard/AreaChart";
import { HBarList } from "@/components/dashboard/HBarList";
import { Loader } from "@/components/Loader";
import { getErrorMessage } from "@/lib/api";
import { cn, formatINR } from "@/lib/utils";
import type { OrganizerAnalytics } from "@/types";

const PERIODS: { id: "7d" | "30d" | "90d" | "12m"; label: string }[] = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "12m", label: "12 months" },
];

export function AnalyticsTab() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "12m">("30d");
  const [data, setData] = useState<OrganizerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await organizerService.analytics(period);
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
  }, [period]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-paper">
          <BarChart3 className="h-4 w-4 text-ember-400" aria-hidden />
          Sales analytics
        </h2>
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                period === p.id ? "bg-ink-800 text-paper" : "text-paper-dim hover:text-paper",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="flex min-h-56 items-center justify-center">
          <Loader />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
      ) : data ? (
        <>
          <section className="rounded-lg border border-ink-800 bg-ink-850 p-5">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-paper">
              <CircleDollarSign className="h-4 w-4 text-ember-400" aria-hidden />
              Revenue
            </h3>
            <AreaChart labels={data.revenue.labels} values={data.revenue.values} money />
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-lg border border-ink-800 bg-ink-850 p-5">
              <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-paper">
                <BarChart3 className="h-4 w-4 text-ember-400" aria-hidden />
                Bookings
              </h3>
              <AreaChart labels={data.bookings.labels} values={data.bookings.values} />
            </section>

            <section className="rounded-lg border border-ink-800 bg-ink-850 p-5">
              <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-paper">
                <Ticket className="h-4 w-4 text-ember-400" aria-hidden />
                Tickets sold
              </h3>
              <AreaChart labels={data.ticketsSold.labels} values={data.ticketsSold.values} />
            </section>
          </div>

          {data.topEvents.length > 0 && (
            <section className="rounded-lg border border-ink-800 bg-ink-850 p-5">
              <h3 className="mb-4 text-sm font-semibold text-paper">Top events</h3>
              <HBarList
                items={data.topEvents.map((event) => ({
                  label: event.title,
                  value: event.revenue,
                  valueLabel: formatINR(event.revenue),
                  sub: `${event.bookings} booking${event.bookings === 1 ? "" : "s"}`,
                }))}
              />
            </section>
          )}
        </>
      ) : null}
    </div>
  );
}