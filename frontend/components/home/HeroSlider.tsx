"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { EventImage } from "@/components/EventImage";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDate, formatINR } from "@/lib/utils";
import type { EventListItem } from "@/types";

const AUTO_ADVANCE_MS = 3500;

export function HeroSlider({ events }: { events: EventListItem[] }) {
  const [index, setIndex] = useState(0);
  const count = events.length;

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [count, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === "ArrowRight") go(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  if (count === 0) return null;

  return (
    <section
      className="relative"
      aria-roledescription="carousel"
      aria-label="Featured events"
    >
      <div className="relative h-[320px] w-full overflow-hidden sm:h-[360px]">
        {events.map((event, slideIndex) => (
          <div
            key={event._id}
            aria-hidden={slideIndex !== index}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              slideIndex === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <EventImage
              src={event.heroImage || event.coverImage}
              alt={event.title}
              sizes="100vw"
              priority={slideIndex === 0}
              darkFallback
              className="brightness-[0.85]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
            <div className="absolute inset-x-0 bottom-0">
              <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
                <Badge variant="accent" className="mb-2">
                  Featured
                </Badge>
                <h1 className="max-w-2xl text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                  {event.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/80">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-ember-400" aria-hidden />
                    {formatDate(event.date)}
                    {event.startTime && ` · ${event.startTime}`}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-ember-400" aria-hidden />
                    {event.city}
                    {event.venue && ` · ${event.venue}`}
                  </span>
                  <span className="font-semibold text-white">
                    {event.minPrice > 0 ? (
                      <>From {formatINR(event.minPrice)}</>
                    ) : (
                      "Free"
                    )}
                  </span>
                </div>
                <Link
                  href={`/events/${event.slug}`}
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-ember-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-ember-400"
                >
                  Explore event <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous featured event"
              className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/70 sm:inline-flex"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next featured event"
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/70 sm:inline-flex"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-sm sm:right-6">
          {events.map((event, dotIndex) => (
            <button
              key={event._id}
              type="button"
              onClick={() => go(dotIndex)}
              aria-label={`Go to slide ${dotIndex + 1}: ${event.title}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                dotIndex === index
                  ? "w-6 bg-ember-500"
                  : "w-1.5 bg-white/40 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}