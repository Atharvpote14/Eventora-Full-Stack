import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { eventsService, categoriesService } from "@/services/events";
import { FilterBar } from "@/components/events/FilterBar";
import { Pagination } from "@/components/events/Pagination";
import { EventCard } from "@/components/EventCard";
import { EmptyState } from "@/components/ui/Section";

type EventsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : (value ?? "");
}

export const metadata: Metadata = {
  title: "Explore events",
  description:
    "Browse all events on Eventora — filter by category, city, price and date.",
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;

  const [eventsResult, categories] = await Promise.all([
    eventsService.list({
      page: Math.max(1, Number(first(params.page)) || 1),
      limit: 12,
      search: first(params.search),
      category: first(params.category),
      city: first(params.city),
      minPrice: params.minPrice !== undefined ? Number(first(params.minPrice)) : undefined,
      maxPrice: params.maxPrice !== undefined ? Number(first(params.maxPrice)) : undefined,
      sort: first(params.sort) || "date_asc",
    }),
    categoriesService.list().catch(() => []),
  ]);

  const { data: events, pagination } = eventsResult;
  const page = pagination?.page ?? 1;
  const pages = pagination?.pages ?? 0;
  const total = pagination?.total ?? 0;

  return (
    <div className="mx-auto max-w-[1248px] px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-paper">
          Explore events
        </h1>
        <p className="mt-2 text-sm text-paper-dim">
          {total > 0
            ? `${total} event${total === 1 ? "" : "s"} to discover`
            : "Events from across the city, curated for you"}
        </p>
      </header>

      <FilterBar categories={categories} key={JSON.stringify(params)} />

      {events.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-6 w-6" aria-hidden />}
          title="No events match your filters"
          description="Try a different search, city or category."
          action="Clear filters"
          actionHref="/events"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} />
    </div>
  );
}