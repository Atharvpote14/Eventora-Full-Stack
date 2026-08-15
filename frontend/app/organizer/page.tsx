"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BarChart3, CalendarCheck, Images, LayoutDashboard, ListOrdered, ScanLine } from "lucide-react";
import { RequireRole } from "@/contexts/AuthContext";
import { ADMIN_EMAILS } from "@/lib/access";
import { OverviewTab } from "@/components/organizer/OverviewTab";
import { EventsTab } from "@/components/organizer/EventsTab";
import { BookingsTab } from "@/components/organizer/BookingsTab";
import { AnalyticsTab } from "@/components/organizer/AnalyticsTab";
import { CheckInTab } from "@/components/organizer/CheckInTab";
import { HeroTab } from "@/components/organizer/HeroTab";
import { Loader } from "@/components/Loader";
import { cn } from "@/lib/utils";

type Tab = "overview" | "events" | "bookings" | "analytics" | "checkin" | "hero";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "events", label: "Events", icon: CalendarCheck },
  { id: "bookings", label: "Bookings", icon: ListOrdered },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "checkin", label: "Check-in", icon: ScanLine },
  { id: "hero", label: "Hero", icon: Images },
];

export default function OrganizerPage() {
  return (
    <RequireRole roles={["organizer", "admin"]} emails={ADMIN_EMAILS}>
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader />
          </div>
        }
      >
        <OrganizerContent />
      </Suspense>
    </RequireRole>
  );
}

function OrganizerContent() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab") as Tab | null;
  const tab: Tab =
    requestedTab && TABS.some((t) => t.id === requestedTab) ? requestedTab : "overview";

  return (
    <div className="mx-auto max-w-[1248px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-paper">
            Organizer dashboard
          </h1>
          <p className="mt-1 text-sm text-paper-dim">
            Manage events, bookings and check-ins.
          </p>
        </div>
        <Link
          href="/events"
          className="text-sm font-medium text-ember-300 transition-colors hover:text-ember-200"
        >
          View public events →
        </Link>
      </div>

      <nav
        className="no-scrollbar -mx-4 mt-8 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0"
        aria-label="Organizer sections"
      >
        {TABS.map((item) => (
          <Link
            key={item.id}
            href={`/organizer?tab=${item.id}`}
            scroll={false}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === item.id
                ? "bg-ink-800 text-paper"
                : "text-paper-dim hover:text-paper",
            )}
          >
            <item.icon className="h-4 w-4" aria-hidden />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "overview" && <OverviewTab />}
        {tab === "events" && <EventsTab />}
        {tab === "bookings" && <BookingsTab />}
        {tab === "analytics" && <AnalyticsTab />}
        {tab === "checkin" && <CheckInTab />}
        {tab === "hero" && <HeroTab />}
      </div>
    </div>
  );
}