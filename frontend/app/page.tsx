import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { eventsService, categoriesService } from "@/services/events";
import { EventRail } from "@/components/EventRail";
import { EventImage } from "@/components/EventImage";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatINR } from "@/lib/utils";

export const metadata = {
  title: "Discover events worth remembering",
  description:
    "Explore concerts, tech summits, workshops and more near you. Book tickets securely on Eventora.",
};

export const revalidate = 60;

export default async function HomePage() {
  const [featured, popular, upcoming, categories, free] = await Promise.all([
    eventsService.featured(10).catch(() => []),
    eventsService.popular(10).catch(() => []),
    eventsService.upcoming(10).catch(() => []),
    categoriesService.list().catch(() => []),
    eventsService
      .list({ minPrice: 0, maxPrice: 0, sort: "date_asc", limit: 8 })
      .then((res) => res.data)
      .catch(() => []),
  ]);

  const hero = featured[0];

  return (
    <div className="fade-up">
      {hero ? (
        <section className="relative">
          <div className="relative h-[520px] w-full overflow-hidden sm:h-[560px]">
            <EventImage
              src={hero.coverImage}
              alt={hero.title}
              sizes="100vw"
              priority
              className="brightness-[0.85]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0">
              <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
                <Badge variant="accent" className="mb-3">
                  Featured
                </Badge>
                <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-paper sm:text-5xl">
                  {hero.title}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-paper-dim">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-ember-400" aria-hidden />
                    {formatDate(hero.date)}
                    {hero.startTime && ` · ${hero.startTime}`}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-ember-400" aria-hidden />
                    {hero.city}
                    {hero.venue && ` · ${hero.venue}`}
                  </span>
                  <span className="font-semibold text-paper">
                    {hero.minPrice > 0 ? (
                      <>From {formatINR(hero.minPrice)}</>
                    ) : (
                      "Free"
                    )}
                  </span>
                </div>
                <Link
                  href={`/events/${hero.slug}`}
                  className="mt-6 inline-flex h-12 items-center gap-2 rounded-md bg-ember-500 px-7 text-base font-semibold text-white transition-colors hover:bg-ember-400"
                >
                  Explore event <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="flex h-[420px] items-center justify-center">
          <p className="text-sm text-paper-dim">No featured events right now.</p>
        </section>
      )}

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6 lg:px-8">
        <EventRail
          title="Trending now"
          subtitle="The experiences everyone is talking about"
          events={popular}
          seeAllHref="/events?sort=popular"
        />

        <EventRail
          title="Upcoming events"
          subtitle="Mark your calendar for what's next"
          events={upcoming}
          seeAllHref="/events?sort=date_asc"
        />

        {categories.length > 0 && (
          <section>
            <h2 className="mb-5 text-xl font-semibold tracking-tight text-paper sm:text-2xl">
              Explore categories
            </h2>
            <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/events?category=${encodeURIComponent(category.name)}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ink-700 bg-ink-850 px-4 py-2 text-sm font-medium text-paper-dim transition-colors hover:border-ember-600 hover:text-paper sm:shrink"
                >
                  {category.icon && <span aria-hidden>{category.icon}</span>}
                  {category.name}
                  {category.eventCount > 0 && (
                    <span className="text-xs text-paper-faint">{category.eventCount}</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {free.length > 0 && (
          <EventRail
            title="Free events"
            subtitle="Zero cost, all the fun"
            events={free}
            seeAllHref="/events?minPrice=0&maxPrice=0"
          />
        )}
      </div>
    </div>
  );
}