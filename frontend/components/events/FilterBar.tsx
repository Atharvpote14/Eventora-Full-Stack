"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Category } from "@/types";

export const CITIES = [
  "Pune",
  "Mumbai",
  "Bengaluru",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
];

export const SORTS = [
  { value: "date_asc", label: "Date · soonest" },
  { value: "date_desc", label: "Date · latest" },
  { value: "price_asc", label: "Price · low to high" },
  { value: "price_desc", label: "Price · high to low" },
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
];

export function FilterBar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const freeOnly =
    searchParams.get("minPrice") === "0" && searchParams.get("maxPrice") === "0";

  const updateParams = (overrides: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-faint"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") updateParams({ search: search.trim() });
            }}
            onBlur={() => {
              if (search.trim() !== (searchParams.get("search") ?? "")) {
                updateParams({ search: search.trim() });
              }
            }}
            placeholder="Search events, venues, cities…"
            aria-label="Search events"
            className="h-12 w-full rounded-md border border-ink-700 bg-ink-900 pl-10 pr-4 text-sm text-paper placeholder:text-paper-faint focus:border-ember-600 focus:outline-none focus:ring-2 focus:ring-ember-900/30"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-md border border-ink-700 bg-ink-900 px-3.5 text-sm text-paper-dim transition-colors hover:border-ink-600">
            <input
              type="checkbox"
              defaultChecked={freeOnly}
              onChange={(event) =>
                updateParams(
                  event.target.checked
                    ? { minPrice: "0", maxPrice: "0" }
                    : { minPrice: null, maxPrice: null },
                )
              }
              className="h-4 w-4 accent-ember-500"
            />
            Free only
          </label>
          <span className="hidden h-12 items-center gap-1.5 text-sm text-paper-faint sm:inline-flex">
            <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <select
          defaultValue={searchParams.get("category") ?? ""}
          onChange={(event) => updateParams({ category: event.target.value })}
          aria-label="Category"
          className="h-11 rounded-md border border-ink-700 bg-ink-900 px-3 text-sm text-paper focus:border-ember-600 focus:outline-none"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          defaultValue={searchParams.get("city") ?? ""}
          onChange={(event) => updateParams({ city: event.target.value })}
          aria-label="City"
          className="h-11 rounded-md border border-ink-700 bg-ink-900 px-3 text-sm text-paper focus:border-ember-600 focus:outline-none"
        >
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          defaultValue={searchParams.get("sort") ?? "date_asc"}
          onChange={(event) => updateParams({ sort: event.target.value })}
          aria-label="Sort by"
          className="h-11 rounded-md border border-ink-700 bg-ink-900 px-3 text-sm text-paper focus:border-ember-600 focus:outline-none"
        >
          {SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {(searchParams.get("search") ||
          searchParams.get("category") ||
          searchParams.get("city") ||
          freeOnly) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              router.push(pathname);
            }}
            className="inline-flex h-11 items-center rounded-md px-3 text-sm text-paper-dim transition-colors hover:text-paper"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}