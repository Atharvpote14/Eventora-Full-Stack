"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { categoriesService, eventCrudService } from "@/services/events";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Category, EventDetail, EventPayload } from "@/types";

const EVENT_TYPES = [
  "conference",
  "workshop",
  "concert",
  "sports",
  "gaming",
  "education",
  "business",
  "entertainment",
  "festival",
  "other",
];

interface TicketRow {
  name: string;
  price: string;
  capacity: string;
  description: string;
}

export function EventForm({
  event,
  categories,
  onClose,
  onSaved,
}: {
  event: EventDetail | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [category, setCategory] = useState(
    typeof event?.category === "string" ? event.category : event?.category?._id ?? "",
  );
  const [eventType, setEventType] = useState(event?.eventType ?? "concert");
  const [date, setDate] = useState(event?.date ? event.date.slice(0, 10) : "");
  const [startTime, setStartTime] = useState(event?.startTime ?? "");
  const [endTime, setEndTime] = useState(event?.endTime ?? "");
  const [registrationDeadline, setRegistrationDeadline] = useState(
    event?.registrationDeadline ? event.registrationDeadline.slice(0, 10) : "",
  );
  const [venue, setVenue] = useState(event?.venue ?? "");
  const [address, setAddress] = useState(event?.address ?? "");
  const [city, setCity] = useState(event?.city ?? "");
  const [coverImage, setCoverImage] = useState(event?.coverImage ?? "");
  const [rulesText, setRulesText] = useState((event?.rules ?? []).join("\n"));
  const [requirementsText, setRequirementsText] = useState(
    (event?.requirements ?? []).join("\n"),
  );
  const [tickets, setTickets] = useState<TicketRow[]>(
    event?.ticketTypes.length
      ? event.ticketTypes.map((t) => ({
          name: t.name,
          price: String(t.price),
          capacity: String(t.capacity),
          description: t.description ?? "",
        }))
      : [{ name: "", price: "", capacity: "", description: "" }],
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const updateTicket = (index: number, field: keyof TicketRow, value: string) => {
    setTickets((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedTickets = tickets.map((t) => ({
      name: t.name.trim(),
      price: Number(t.price),
      capacity: Number(t.capacity),
      description: t.description.trim() || undefined,
    }));

    if (!title.trim() || title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }
    if (description.trim().length < 20) {
      setError("Description must be at least 20 characters.");
      return;
    }
    if (!category) {
      setError("Please choose a category.");
      return;
    }
    if (!date || !startTime) {
      setError("Date and start time are required.");
      return;
    }
    if (new Date(date) < new Date(new Date().toDateString())) {
      setError("Event date must be in the future.");
      return;
    }
    if (!venue.trim() || !address.trim() || !city.trim()) {
      setError("Venue, address and city are required.");
      return;
    }
    if (parsedTickets.length === 0 || parsedTickets.some((t) => !t.name.trim())) {
      setError("At least one ticket type with a name is required.");
      return;
    }
    if (
      parsedTickets.some(
        (t) => Number.isNaN(t.price) || t.price < 0 || !Number.isInteger(t.capacity) || t.capacity < 1,
      )
    ) {
      setError("Each ticket needs a price (≥ 0) and an integer capacity (≥ 1).");
      return;
    }

    const payload: EventPayload = {
      title: title.trim(),
      description: description.trim(),
      category,
      eventType,
      date,
      startTime,
      endTime: endTime || undefined,
      registrationDeadline: registrationDeadline || undefined,
      venue: venue.trim(),
      address: address.trim(),
      city: city.trim(),
      coverImage: coverImage.trim() || undefined,
      ticketTypes: parsedTickets,
      rules: rulesText.split("\n").map((s) => s.trim()).filter(Boolean),
      requirements: requirementsText.split("\n").map((s) => s.trim()).filter(Boolean),
    };

    setSaving(true);
    try {
      if (event) {
        await eventCrudService.update(event._id, payload);
      } else {
        await eventCrudService.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:py-10"
      role="dialog"
      aria-modal="true"
      aria-label={event ? "Edit event" : "Create event"}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-2xl rounded-lg border border-ink-700 bg-ink-850 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-paper">
            {event ? "Edit event" : "Create event"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-paper-dim hover:bg-ink-800 hover:text-paper"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="space-y-4">
          <Input label="Title *" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-paper-dim">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-ink-700 bg-ink-900 px-3.5 py-2.5 text-sm text-paper placeholder:text-paper-faint transition-colors focus:border-ember-600 focus:outline-none focus:ring-2 focus:ring-ember-900/30"
              placeholder="What is this event about?"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-paper-dim">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 w-full rounded-md border border-ink-700 bg-ink-900 px-3 text-sm text-paper focus:border-ember-600 focus:outline-none"
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-paper-dim">Event type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="h-11 w-full rounded-md border border-ink-700 bg-ink-900 px-3 text-sm text-paper focus:border-ember-600 focus:outline-none"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Date *"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start *"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <Input
                label="End"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <Input
            label="Registration deadline"
            type="date"
            value={registrationDeadline}
            onChange={(e) => setRegistrationDeadline(e.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Venue *" value={venue} onChange={(e) => setVenue(e.target.value)} />
            <Input label="City *" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <Input label="Address *" value={address} onChange={(e) => setAddress(e.target.value)} />
          <Input
            label="Cover image URL"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            helper="Optional for drafts; required before publishing."
          />

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-paper-dim">Ticket types *</label>
              <button
                type="button"
                onClick={() =>
                  setTickets((prev) => [...prev, { name: "", price: "", capacity: "", description: "" }])
                }
                className="inline-flex items-center gap-1 text-sm font-medium text-ember-300 hover:text-ember-200"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden /> Add ticket
              </button>
            </div>
            <div className="space-y-3">
              {tickets.map((ticket, index) => (
                <div key={index} className="rounded-md border border-ink-700 bg-ink-900 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-paper-faint">
                      Ticket {index + 1}
                    </p>
                    {tickets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setTickets((prev) => prev.filter((_, i) => i !== index))}
                        className="text-xs text-red-500 hover:text-red-400"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    <Input
                      label="Name *"
                      value={ticket.name}
                      onChange={(e) => updateTicket(index, "name", e.target.value)}
                      placeholder="General"
                    />
                    <Input
                      label="Price (₹) *"
                      type="number"
                      min={0}
                      value={ticket.price}
                      onChange={(e) => updateTicket(index, "price", e.target.value)}
                      placeholder="499"
                    />
                    <Input
                      label="Capacity *"
                      type="number"
                      min={1}
                      value={ticket.capacity}
                      onChange={(e) => updateTicket(index, "capacity", e.target.value)}
                      placeholder="200"
                    />
                  </div>
                  <div className="mt-3">
                    <Input
                      label="Description"
                      value={ticket.description}
                      onChange={(e) => updateTicket(index, "description", e.target.value)}
                      placeholder="Perks, seat area…"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-paper-dim">
                Rules (one per line)
              </label>
              <textarea
                value={rulesText}
                onChange={(e) => setRulesText(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-ink-700 bg-ink-900 px-3.5 py-2.5 text-sm text-paper placeholder:text-paper-faint focus:border-ember-600 focus:outline-none"
                placeholder={"No outside food\nArrive 30 min early"}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-paper-dim">
                Requirements (one per line)
              </label>
              <textarea
                value={requirementsText}
                onChange={(e) => setRequirementsText(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-ink-700 bg-ink-900 px-3.5 py-2.5 text-sm text-paper placeholder:text-paper-faint focus:border-ember-600 focus:outline-none"
                placeholder={"Government ID\nPrinted ticket"}
              />
            </div>
          </div>

          {error && (
            <p className={cn("rounded-md border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300")}>
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {event ? "Save changes" : "Create event"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await categoriesService.list();
        if (!cancelled) setCategories(res);
      } catch {
        // Leave empty; the form will show an empty select.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading };
}