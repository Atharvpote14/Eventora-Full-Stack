import Link from "next/link";
import { eventsService, categoriesService } from "@/services/events";
import { EventRail } from "@/components/EventRail";
import { HeroSlider } from "@/components/home/HeroSlider";

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
        <HeroSlider events={featured} />
      ) : (
        <section className="flex h-[240px] items-center justify-center">
          <p className="text-sm text-paper-dim">No featured events right now.</p>
        </section>
      )}

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
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
            <h2 className="mb-4 text-lg font-semibold tracking-tight text-paper sm:text-xl">
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