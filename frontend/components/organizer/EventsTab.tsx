"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { organizerService } from "@/services/organizer";
import { eventsService, eventCrudService } from "@/services/events";
import { EventForm, useCategories } from "@/components/organizer/EventForm";
import { Button } from "@/components/ui/Button";
import { EventStatusBadge } from "@/components/dashboard/StatusBadges";
import { EmptyState } from "@/components/ui/Section";
import { Loader } from "@/components/Loader";
import { getErrorMessage } from "@/lib/api";
import { cn, formatDateTime } from "@/lib/utils";
import type { EventDetail, EventListItem } from "@/types";

const STATUS_FILTERS = ["", "draft", "pending", "published", "rejected", "cancelled"];

export function EventsTab() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventDetail | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { categories } = useCategories();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await organizerService.myEvents(1, 100, filter || undefined);
      setEvents(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await organizerService.myEvents(1, 100, filter || undefined);
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

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = async (event: EventListItem) => {
    setBusyId(event._id);
    setActionError(null);
    try {
      const { event: detail } = await eventsService.byId(event._id);
      setEditing(detail);
      setFormOpen(true);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const runAction = async (id: string, action: () => Promise<unknown>, successMessage?: string) => {
    setBusyId(id);
    setActionError(null);
    try {
      await action();
      if (successMessage) window.alert(successMessage);
      await load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (error) return <p className="text-sm text-red-600 dark:text-red-300">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === status
                  ? "bg-ink-800 text-paper"
                  : "text-paper-dim hover:text-paper",
              )}
            >
              {status === "" ? "All" : status}
            </button>
          ))}
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" aria-hidden /> Create event
        </Button>
      </div>

      {actionError && (
        <p className="rounded-md border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {actionError}
        </p>
      )}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center">
          <Loader />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No events here"
          description="Create your first event and submit it for review."
          action="Create event"
          onAction={openCreate}
        />
      ) : (
        <ul className="space-y-2">
          {events.map((event) => {
            const editable = ["draft", "pending", "rejected", "published"].includes(event.status);
            const publishable = ["draft", "rejected"].includes(event.status);
            const cancellable = ["draft", "pending", "published"].includes(event.status);
            return (
              <li
                key={event._id}
                className="flex flex-col gap-3 rounded-lg border border-ink-800 bg-ink-850 p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-paper">{event.title}</h3>
                    <EventStatusBadge status={event.status} />
                  </div>
                  <p className="mt-1 text-sm text-paper-dim">
                    {formatDateTime(event.date, event.startTime)} · {event.city} ·{" "}
                    {event.venue}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Link href={`/events/${event.slug}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" aria-hidden /> View
                    </Button>
                  </Link>
                  {editable && (
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={busyId === event._id}
                      onClick={() => openEdit(event)}
                    >
                      <Pencil className="h-4 w-4" aria-hidden /> Edit
                    </Button>
                  )}
                  {publishable && (
                    <Button
                      variant="primary"
                      size="sm"
                      loading={busyId === event._id}
                      onClick={() =>
                        void runAction(
                          event._id,
                          () => eventCrudService.publish(event._id),
                          "Event submitted for admin review.",
                        )
                      }
                    >
                      <Send className="h-4 w-4" aria-hidden /> Publish
                    </Button>
                  )}
                  {cancellable && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={busyId === event._id}
                      onClick={() => {
                        if (window.confirm(`Cancel "${event.title}"? Paid bookings will be refunded.`)) {
                          void runAction(event._id, () => eventCrudService.cancel(event._id));
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={busyId === event._id}
                    onClick={() => {
                      if (window.confirm(`Delete "${event.title}"? This cannot be undone.`)) {
                        void runAction(event._id, () => eventCrudService.remove(event._id));
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" aria-hidden />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {formOpen && (
        <EventForm
          event={editing}
          categories={categories}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            void load();
          }}
        />
      )}
    </div>
  );
}