import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays, Clock, MapPin, Star } from "lucide-react";
import { eventsService } from "@/services/events";
import { EventImage } from "@/components/EventImage";
import { EventDetailTabs } from "@/components/events/EventDetailTabs";
import { EventRail } from "@/components/EventRail";
import { WishlistButton } from "@/components/events/WishlistButton";
import { formatDate, formatTime, categoryName } from "@/lib/utils";

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { event } = await eventsService.detail(slug);
    return {
      title: event.title,
      description: event.description?.slice(0, 160),
      openGraph: {
        title: `${event.title} · Eventora`,
        description: event.description?.slice(0, 160),
        images: event.coverImage ? [{ url: event.coverImage }] : undefined,
      },
    };
  } catch {
    return { title: "Event not found" };
  }
}

function durationLabel(start?: string, end?: string): string | null {
  if (!start || !end) return null;
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  let diff = toMinutes(end) - toMinutes(start);
  if (diff <= 0) diff += 24 * 60;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h <= 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function RatingRing({ value, votes }: { value: number; votes: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value * 10));
  return (
    <div
      className="relative inline-flex h-16 w-16 shrink-0 items-center justify-center"
      role="img"
      aria-label={`Rated ${value.toFixed(1)} out of 10 by ${votes} reviewers`}
    >
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="5"
          className="stroke-white/20"
        />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          className="stroke-[#e8b84b] transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-none text-white">{value.toFixed(1)}</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-white/50">
          Votes
        </span>
      </div>
    </div>
  );
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;

  let data;
  try {
    data = await eventsService.detail(slug);
  } catch {
    notFound();
  }

  const { event, ratingSummary } = data;
  const movieStyle = event.eventType === "entertainment";
  const categorySlug =
    typeof event.category === "object" && event.category ? event.category.slug : "";
  const past = new Date(event.date) < new Date();
  const deadline = event.registrationDeadline
    ? new Date(event.registrationDeadline) < new Date()
    : false;
  const bookingClosed = past || deadline;
  const duration = durationLabel(event.startTime, event.endTime);

  let similar: Awaited<ReturnType<typeof eventsService.list>>["data"] = [];
  try {
    const res = await eventsService.list({
      category: categorySlug || undefined,
      limit: 12,
    });
    similar = res.data.filter((e) => e._id !== event._id);
  } catch {
    similar = [];
  }

  return (
    <div className="fade-up">
      <div className="bg-[#1b1c1f]">
        <div className="mx-auto max-w-[1248px] px-4 pb-8 pt-5 sm:px-6 sm:pt-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-white/60"
          >
            <Link href="/events" className="transition-colors hover:text-white">
              Events
            </Link>
            <span aria-hidden>/</span>
            <Link
              href={`/events?category=${categorySlug}`}
              className="transition-colors hover:text-white"
            >
              {categoryName(event.category)}
            </Link>
            <span aria-hidden>/</span>
            <span className="truncate text-white/80">{event.title}</span>
          </nav>

          <div className="mt-5 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                {event.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded border border-white/30 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-white">
                  {movieStyle ? "Movie" : event.eventType}
                </span>
                <span className="rounded border border-white/30 px-2 py-0.5 text-xs font-medium text-white">
                  {event.city}
                </span>
                {bookingClosed && (
                  <span className="rounded border border-ember-600/60 px-2 py-0.5 text-xs font-medium text-ember-400">
                    Bookings closed
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm text-white/70">
                {duration && <span className="font-medium text-white">{duration}</span>}
                {duration && " • "}
                {categoryName(event.category)}
                {" • "}
                {formatDate(event.date)}
              </p>

              <p className="mt-1.5 text-sm text-white/70">
                {formatTime(event.startTime)}
                {event.endTime ? ` – ${formatTime(event.endTime)}` : ""} •{" "}
                {event.venue ?? "Online"} • {event.city}
              </p>

              {typeof event.organizer === "object" && event.organizer?.name && (
                <p className="mt-1.5 text-sm text-white/70">
                  Presented by{" "}
                  <span className="font-medium text-white">{event.organizer.name}</span>
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-4">
                {ratingSummary.reviewCount > 0 && (
                  <RatingRing
                    value={ratingSummary.averageRating * 2}
                    votes={ratingSummary.reviewCount}
                  />
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        aria-hidden
                        className={
                          ratingSummary.averageRating >= star - 0.25
                            ? "h-4 w-4 fill-[#e8b84b] text-[#e8b84b]"
                            : ratingSummary.averageRating >= star - 0.75
                              ? "h-4 w-4 fill-[#e8b84b]/40 text-[#e8b84b]/40"
                              : "h-4 w-4 fill-transparent text-white/25"
                        }
                      />
                    ))}
                    {ratingSummary.reviewCount > 0 && (
                      <span className="text-sm font-medium text-white">
                        {ratingSummary.averageRating.toFixed(1)}
                      </span>
                    )}
                    {ratingSummary.reviewCount > 0 && (
                      <span className="text-xs text-white/50">({ratingSummary.reviewCount})</span>
                    )}
                  </div>
                  <a
                    href="#reviews"
                    className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-ember-400 transition-colors hover:text-ember-300"
                  >
                    <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
                    Rate Now
                  </a>
                </div>
              </div>
            </div>

            <div className="w-48 shrink-0 self-center sm:w-56 lg:self-start">
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-white/5 shadow-2xl ring-1 ring-white/15">
                <EventImage
                  src={event.coverImage}
                  alt={event.title}
                  sizes="(max-width: 640px) 192px, 224px"
                  priority
                  fit="cover"
                />
              </div>
              <a
                href="#showtimes"
                aria-disabled={bookingClosed}
                className={
                  bookingClosed
                    ? "mt-3 block w-full cursor-not-allowed rounded-md bg-white/10 py-3 text-center text-sm font-semibold text-white/40"
                    : "mt-3 block w-full rounded-md bg-[#e4572e] py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#f26b3c]"
                }
              >
                {bookingClosed ? "Bookings closed" : "Book tickets"}
              </a>
              <div className="mt-2.5">
                <WishlistButton eventId={event._id} />
              </div>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-white/50">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                {formatDate(event.date)}
                <Clock className="ml-2 h-3.5 w-3.5" aria-hidden />
                {formatTime(event.startTime)}
                <MapPin className="ml-2 h-3.5 w-3.5" aria-hidden />
                {event.city}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-800/70">
        <EventDetailTabs event={event} ratingSummary={ratingSummary} />
      </div>

      {similar.length > 0 && (
        <div className="border-t border-ink-800/70 py-10 sm:py-12">
          <div className="mx-auto max-w-[1248px] px-4 sm:px-6 lg:px-8">
            <EventRail
              title={movieStyle ? "Similar Movies" : "Similar Events"}
              events={similar}
              seeAllHref={`/events?category=${categorySlug}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
