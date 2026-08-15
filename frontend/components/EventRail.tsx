import Link from "next/link";
import type { EventListItem } from "@/types";
import { EventCard } from "@/components/EventCard";
import { Loader } from "@/components/Loader";

export function EventRail({
  title,
  subtitle,
  events,
  loading,
  seeAllHref,
  className,
}: {
  title: string;
  subtitle?: string;
  events: EventListItem[];
  loading?: boolean;
  seeAllHref?: string;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-paper sm:text-xl">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-paper-dim">{subtitle}</p>}
        </div>
        {seeAllHref && events.length > 0 && (
          <Link
            href={seeAllHref}
            className="shrink-0 text-sm font-medium text-ember-400 transition-colors hover:text-ember-300"
          >
            See all <span aria-hidden>→</span>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex h-56 items-center justify-center">
          <Loader />
        </div>
      ) : events.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ink-700 px-6 py-10 text-center text-sm text-paper-dim">
          No events found yet.
        </p>
      ) : (
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {events.map((event) => (
<EventCard
              key={event._id}
              event={event}
              className="w-[140px] shrink-0 snap-start sm:w-[190px] sm:flex-none"
            />
          ))}
        </div>
      )}
    </section>
  );
}