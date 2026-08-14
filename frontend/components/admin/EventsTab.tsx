"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Eye, Pencil, Trash2, X } from "lucide-react";
import { adminService } from "@/services/admin";
import { eventsService } from "@/services/events";
import { EventForm, useCategories } from "@/components/organizer/EventForm";
import { Table, Td, Th } from "@/components/dashboard/Table";
import { EventStatusBadge } from "@/components/dashboard/StatusBadges";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Section";
import { getErrorMessage } from "@/lib/api";
import { cn, formatDateTime, formatINR } from "@/lib/utils";
import type { AdminEvent, EventDetail } from "@/types";

const STATUS_FILTERS = ["", "draft", "pending", "published", "rejected", "cancelled", "completed"];

export function EventsTab() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventDetail | null>(null);
  const { categories } = useCategories();

  const load = async () => {
    const res = await adminService.events(1, 50, filter || undefined);
    setEvents(res.data);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await adminService.events(1, 50, filter || undefined);
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
  }, [filter]);

  const runAction = async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const openEdit = async (event: AdminEvent) => {
    setBusyId(event._id);
    setError(null);
    try {
      const { event: detail } = await eventsService.byId(event._id);
      setEditing(detail);
      setFormOpen(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
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

      {error && (
        <p className="rounded-md border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-lg" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState title="No events match this filter" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Event</Th>
              <Th>Organizer</Th>
              <Th>Status</Th>
              <Th className="text-right">Price</Th>
              <Th>Created</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event._id} className="border-t border-ink-800">
                <Td>
                  <Link
                    href={`/events/${event.slug}`}
                    className="font-medium text-paper hover:text-ember-300"
                  >
                    {event.title}
                  </Link>
                  <p className="text-xs text-paper-faint">
                    {formatDateTime(event.date)} · {event.city}
                  </p>
                </Td>
                <Td>
                  <p className="text-paper">{event.organizer?.name ?? "—"}</p>
                  <p className="max-w-44 truncate text-xs text-paper-faint">
                    {event.organizer?.email ?? ""}
                  </p>
                </Td>
                <Td>
                  <EventStatusBadge status={event.status} />
                </Td>
                <Td className="text-right font-semibold text-paper">
                  {event.minPrice > 0 ? formatINR(event.minPrice) : "Free"}
                </Td>
                <Td className="text-xs text-paper-faint">{formatDateTime(event.createdAt)}</Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Link href={`/events/${event.slug}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" aria-hidden />
                      </Button>
                    </Link>
                    {event.status === "pending" && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          loading={busyId === event._id}
                          onClick={() => void runAction(event._id, () => adminService.approveEvent(event._id))}
                        >
                          <Check className="h-4 w-4" aria-hidden /> Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={busyId === event._id}
                          onClick={() => void runAction(event._id, () => adminService.rejectEvent(event._id))}
                        >
                          <X className="h-4 w-4" aria-hidden /> Reject
                        </Button>
                      </>
                    )}
                    {!["cancelled", "completed"].includes(event.status) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={busyId === event._id}
                        onClick={() => void openEdit(event)}
                      >
                        <Pencil className="h-4 w-4" aria-hidden /> Edit
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={busyId === event._id}
                      onClick={() => {
                        if (window.confirm(`Delete "${event.title}"? This cannot be undone.`)) {
                          void runAction(event._id, () => adminService.deleteEvent(event._id));
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" aria-hidden />
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {formOpen && (
        <EventForm
          event={editing}
          categories={categories}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            void load().catch((err) => setError(getErrorMessage(err)));
          }}
        />
      )}
    </div>
  );
}