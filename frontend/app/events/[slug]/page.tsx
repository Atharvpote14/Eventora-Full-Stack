import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays, Clock, MapPin, ShieldCheck, User2 } from "lucide-react";
import { eventsService } from "@/services/events";
import { EventImage } from "@/components/EventImage";
import { Badge } from "@/components/ui/Badge";
import { RatingStars } from "@/components/ui/RatingStars";
import { BookingPanel } from "@/components/events/BookingPanel";
import { WishlistButton } from "@/components/events/WishlistButton";
import { EventReviews } from "@/components/events/EventReviews";
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

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;

  let data;
  try {
    data = await eventsService.detail(slug);
  } catch {
    notFound();
  }

  const { event, ratingSummary } = data;
  const past = new Date(event.date) < new Date();
  const deadline = event.registrationDeadline
    ? new Date(event.registrationDeadline) < new Date()
    : false;
  const bookingClosed = past || deadline;

  return (
    <div className="fade-up">
      <div className="relative h-72 w-full overflow-hidden sm:h-96 lg:h-[440px]">
        <EventImage
          src={event.coverImage}
          alt={event.title}
          sizes="100vw"
          priority
          className="brightness-[0.9]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-10 mb-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">{categoryName(event.category)}</Badge>
                {event.featured && <Badge>Featured</Badge>}
                {bookingClosed && <Badge variant="neutral">Bookings closed</Badge>}
              </div>
              <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-paper sm:text-4xl">
                {event.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-paper-dim">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-ember-400" aria-hidden />
                  {formatDate(event.date)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-ember-400" aria-hidden />
                  {formatTime(event.startTime)}
                  {event.endTime ? ` – ${formatTime(event.endTime)}` : ""}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-ember-400" aria-hidden />
                  {event.city}
                  {event.venue ? ` · ${event.venue}` : ""}
                </span>
              </div>
              {ratingSummary.reviewCount > 0 && (
                <div className="mt-3">
                  <RatingStars
                    rating={ratingSummary.averageRating}
                    reviewCount={ratingSummary.reviewCount}
                  />
                </div>
              )}

              {event.description && (
                <p className="mt-6 max-w-3xl whitespace-pre-line text-[15px] leading-relaxed text-paper-dim">
                  {event.description}
                </p>
              )}

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
                <div className="rounded-lg border border-ink-800 bg-ink-850 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-paper-faint">
                    Date & time
                  </h3>
                  <p className="mt-2 text-sm text-paper">
                    {formatDate(event.date)} · {formatTime(event.startTime)}
                  </p>
                  {event.endTime && (
                    <p className="mt-1 text-xs text-paper-faint">
                      Ends at {formatTime(event.endTime)}
                    </p>
                  )}
                </div>
                <div className="rounded-lg border border-ink-800 bg-ink-850 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-paper-faint">
                    Location
                  </h3>
                  <p className="mt-2 text-sm text-paper">
                    {event.venue ?? "Online"}
                  </p>
                  <p className="mt-1 text-xs text-paper-faint">
                    {event.address ? `${event.address} · ` : ""}
                    {event.city}
                  </p>
                </div>
              </div>

              {event.rules && event.rules.length > 0 && (
                <div className="mt-8 max-w-3xl">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-paper-faint">
                    Rules & guidelines
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-paper-dim">
                    {event.rules.map((rule, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-ember-400" aria-hidden>•</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {event.faqs && event.faqs.length > 0 && (
                <div className="mt-8 max-w-3xl">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-paper-faint">
                    FAQs
                  </h3>
                  <dl className="mt-3 space-y-4">
                    {event.faqs.map((faq, index) => (
                      <div key={index}>
                        <dt className="text-sm font-semibold text-paper">{faq.question}</dt>
                        <dd className="mt-1 text-sm leading-relaxed text-paper-dim">
                          {faq.answer}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              <EventReviews eventId={event._id} initialRating={ratingSummary} />
            </div>

            <aside className="w-full shrink-0 lg:w-96">
              <div className="space-y-4 lg:sticky lg:top-24">
                <div className="rounded-lg border border-ink-700 bg-ink-850 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-paper-faint">
                    Organizer
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-paper">
                    <User2 className="h-4 w-4 text-ember-400" aria-hidden />
                    {event.organizer ? "Verified organizer" : "Eventora"}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-xs text-paper-faint">
                    <ShieldCheck className="h-3.5 w-3.5 text-moss-500" aria-hidden />
                    Secure booking powered by Razorpay
                  </p>
                </div>
                <BookingPanel event={event} />
                <WishlistButton eventId={event._id} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}