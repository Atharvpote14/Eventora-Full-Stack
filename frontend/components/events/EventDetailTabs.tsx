"use client";

import { useEffect, useState } from "react";
import { MapPin, Ticket } from "lucide-react";
import type { EventDetail, RatingSummary } from "@/types";
import { BookingPanel } from "@/components/events/BookingPanel";
import { EventReviews } from "@/components/events/EventReviews";
import { formatDate, formatTime, categoryName } from "@/lib/utils";
import { cn } from "@/lib/utils";

type TabId = "about" | "showtimes" | "reviews" | "faqs" | "rules";

function showDateChips(eventDate: string): { iso: string; active: boolean }[] {
  const base = new Date(eventDate);
  if (Number.isNaN(base.getTime())) return [];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return { iso: d.toISOString(), active: i === 0 };
  });
}

export function EventDetailTabs({
  event,
  ratingSummary,
}: {
  event: EventDetail;
  ratingSummary: RatingSummary;
}) {
  const movieStyle = event.eventType === "entertainment";
  const [activeTab, setActiveTab] = useState<TabId>("about");

  const past = new Date(event.date) < new Date();
  const deadline = event.registrationDeadline
    ? new Date(event.registrationDeadline) < new Date()
    : false;
  const bookingClosed = past || deadline;

  const hasFaqs = (event.faqs?.length ?? 0) > 0;
  const hasRules = (event.rules?.length ?? 0) > 0;

  const tabs: { id: TabId; label: string }[] = [
    { id: "about", label: movieStyle ? "About the Movie" : "About the Event" },
    { id: "showtimes", label: movieStyle ? "Showtimes" : "Schedule & Tickets" },
    { id: "reviews", label: "Reviews" },
    ...(hasFaqs ? [{ id: "faqs" as const, label: "FAQs" }] : []),
    ...(hasRules ? [{ id: "rules" as const, label: "Rules" }] : []),
  ];

  useEffect(() => {
    const ids = tabs.map((t) => t.id);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id;
          if (ids.includes(id as TabId)) setActiveTab(id as TabId);
        }
      },
      { rootMargin: "-120px 0px -55% 0px", threshold: 0 },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const chips = showDateChips(event.date);

  return (
    <div>
      <nav
        className="sticky top-16 z-40 border-b border-ink-800 bg-ink-950/95 backdrop-blur"
        aria-label="Event sections"
      >
        <div className="mx-auto max-w-[1248px] px-4 sm:px-6 lg:px-8">
          <div className="no-scrollbar -mx-4 flex items-center gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollTo(tab.id)}
                aria-current={activeTab === tab.id ? "true" : undefined}
                className={cn(
                  "relative whitespace-nowrap px-3 py-3.5 text-sm font-medium transition-colors sm:px-4",
                  activeTab === tab.id
                    ? "text-ember-400"
                    : "text-paper-dim hover:text-paper",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-ember-500 transition-opacity",
                    activeTab === tab.id ? "opacity-100" : "opacity-0",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </nav>

      <section
        id="about"
        className="scroll-mt-40 border-b border-ink-800/70 py-10 sm:py-12"
      >
        <div className="mx-auto max-w-[1248px] px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold tracking-tight text-paper sm:text-xl">
            {movieStyle ? "About the Movie" : "About the Event"}
          </h2>
          {event.description && (
            <p className="mt-4 max-w-3xl whitespace-pre-line text-[15px] leading-relaxed text-paper-dim">
              {event.description}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-paper-dim">
            <span>
              Category:{" "}
              <span className="font-medium text-paper">{categoryName(event.category)}</span>
            </span>
            {event.endTime && (
              <span>
                Duration: <span className="font-medium text-paper">until {formatTime(event.endTime)}</span>
              </span>
            )}
            <span>
              Date: <span className="font-medium text-paper">{formatDate(event.date)}</span>
            </span>
          </div>
        </div>
      </section>

      <section
        id="showtimes"
        className="scroll-mt-40 border-b border-ink-800/70 py-10 sm:py-12"
      >
        <div className="mx-auto max-w-[1248px] px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold tracking-tight text-paper sm:text-xl">
            {movieStyle ? "Showtimes" : "Schedule & Tickets"}
          </h2>

          <div className="no-scrollbar mt-6 flex gap-3 overflow-x-auto pb-1">
            {chips.map((chip) => {
              const d = new Date(chip.iso);
              const day = d.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase();
              const date = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
              return (
                <div
                  key={chip.iso}
                  aria-current={chip.active ? "date" : undefined}
                  className={cn(
                    "flex w-16 shrink-0 flex-col items-center gap-1 rounded-lg border py-2.5 text-xs font-semibold",
                    chip.active
                      ? "border-ember-600 bg-ember-500 text-white"
                      : "cursor-not-allowed border-ink-700 text-paper-faint opacity-50",
                  )}
                >
                  <span>{day}</span>
                  <span className={cn("text-sm", chip.active ? "text-white" : "text-paper-faint")}>
                    {date}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 divide-y divide-ink-800 rounded-lg border border-ink-800 bg-ink-850/60">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex min-w-0 items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember-400" aria-hidden />
                <div className="min-w-0">
                  <p className="font-semibold text-paper">{event.venue ?? "Online event"}</p>
                  <p className="mt-0.5 truncate text-sm text-paper-dim">
                    {event.address ? `${event.address} · ` : ""}
                    {event.city}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
                {event.startTime && (
                  <button
                    type="button"
                    disabled={bookingClosed}
                    onClick={() => scrollTo("book-panel")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-ink-600 px-4 py-2 text-sm font-semibold text-paper transition-colors hover:border-ember-500 hover:text-ember-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Ticket className="h-3.5 w-3.5" aria-hidden />
                    {formatTime(event.startTime)}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div id="book-panel" className="mt-6 scroll-mt-40 max-w-xl">
            {bookingClosed ? (
              <div className="rounded-lg border border-ink-700 bg-ink-850 p-6 text-center">
                <p className="text-sm font-medium text-paper">Bookings are closed</p>
                <p className="mt-1 text-xs text-paper-dim">
                  This {movieStyle ? "show" : "event"} has already taken place or its
                  registration deadline has passed.
                </p>
              </div>
            ) : event.ticketTypes.length > 0 ? (
              <BookingPanel event={event} />
            ) : (
              <div className="rounded-lg border border-ink-700 bg-ink-850 p-6 text-center">
                <p className="text-sm text-paper-dim">
                  Tickets are not on sale for this {movieStyle ? "show" : "event"} yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="reviews" className="scroll-mt-40 border-b border-ink-800/70 py-10 sm:py-12">
        <div className="mx-auto max-w-[1248px] px-4 sm:px-6 lg:px-8">
          <EventReviews eventId={event._id} initialRating={ratingSummary} />
        </div>
      </section>

      {hasFaqs && (
        <section id="faqs" className="scroll-mt-40 border-b border-ink-800/70 py-10 sm:py-12">
          <div className="mx-auto max-w-[1248px] px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold tracking-tight text-paper sm:text-xl">FAQs</h2>
            <dl className="mt-4 max-w-3xl space-y-4">
              {event.faqs!.map((faq, index) => (
                <div key={index}>
                  <dt className="text-sm font-semibold text-paper">{faq.question}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-paper-dim">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {hasRules && (
        <section id="rules" className="scroll-mt-40 py-10 sm:py-12">
          <div className="mx-auto max-w-[1248px] px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold tracking-tight text-paper sm:text-xl">
              Rules & guidelines
            </h2>
            <ul className="mt-4 max-w-3xl space-y-2 text-sm text-paper-dim">
              {event.rules!.map((rule, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-ember-400" aria-hidden>
                    •
                  </span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

    </div>
  );
}
