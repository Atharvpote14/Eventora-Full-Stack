"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Ticket,
  User2,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn, initials } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/events", label: "Explore" },
  { href: "/events?sort=popular", label: "Trending" },
];

const CATEGORY_LINKS = [
  { slug: "music", label: "Music" },
  { slug: "theatre", label: "Theatre" },
  { slug: "sports", label: "Sports" },
  { slug: "comedy", label: "Comedy" },
  { slug: "festivals", label: "Festivals" },
];

function NavLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const sort = searchParams.get("sort");

  const isEventsPage = pathname.startsWith("/events");
  const exploreActive = isEventsPage && !category;
  const trendingActive = isEventsPage && sort === "popular";

  return (
    <>
      {NAV_LINKS.map((link) => {
        const active =
          link.href === "/events" ? exploreActive : link.href.includes("popular") ? trendingActive : pathname === link.href;
        return (
          <Link
            key={link.label}
            href={link.href}
            className={cn(
              "relative px-3 py-2 text-sm font-medium transition-colors",
              active ? "text-ember-500" : "text-paper-dim hover:text-paper",
            )}
          >
            {link.label}
            <span
              className={cn(
                "absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-ember-500 transition-opacity",
                active ? "opacity-100" : "opacity-0",
              )}
            />
          </Link>
        );
      })}
      <span className="mx-1 h-5 w-px bg-ink-700" aria-hidden />
      {CATEGORY_LINKS.map((link) => (
        <Link
          key={link.slug}
          href={`/events?category=${link.slug}`}
          className={cn(
            "relative px-3 py-2 text-sm font-medium transition-colors",
            category === link.slug
              ? "text-ember-500"
              : "text-paper-dim hover:text-paper",
          )}
        >
          {link.label}
          <span
            className={cn(
              "absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-ember-500 transition-opacity",
              category === link.slug ? "opacity-100" : "opacity-0",
            )}
          />
        </Link>
      ))}
    </>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const closeMenus = () => {
    setMenuOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    closeMenus();
    router.push(q ? `/events?search=${encodeURIComponent(q)}` : "/events");
  };

  const listShowHref =
    user?.role === "organizer" ? "/organizer" : user?.role === "admin" ? "/admin" : "/login";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-ink-800 bg-ink-950/95 backdrop-blur-md transition-shadow duration-300",
        scrolled && "shadow-lg shadow-black/5 dark:shadow-black/30",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1248px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {!isAuthPage && (
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-paper-dim transition-colors hover:bg-ink-800 hover:text-paper md:hidden"
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        )}

        <Link
          href="/"
          onClick={closeMenus}
          className="flex shrink-0 items-center gap-1.5"
          aria-label="Eventora home"
        >
          <span className="text-xl font-bold tracking-tight text-paper">
            Event<span className="text-ember-500">ora</span>
          </span>
        </Link>

        <form
          onSubmit={submitSearch}
          role="search"
          className="relative mx-auto hidden w-full max-w-lg flex-1 md:block"
        >
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-faint"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for events, plays, sports and activities…"
            aria-label="Search events"
            className="h-10 w-full rounded-full border border-ink-700 bg-ink-900 pl-10 pr-4 text-sm text-paper placeholder:text-paper-faint transition-all focus:border-ember-600 focus:outline-none focus:ring-2 focus:ring-ember-900/30"
          />
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-0">
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-paper-dim transition-colors hover:bg-ink-800 hover:text-paper md:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" aria-hidden />
          </button>

          <ThemeToggle />

          {user && (
            <Link
              href="/account?tab=wishlist"
              className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-paper-dim transition-colors hover:bg-ink-800 hover:text-paper"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="h-5 w-5" aria-hidden />
            </Link>
          )}

          {user ? (
            <div className="relative ml-2" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                className="flex h-10 items-center gap-2 rounded-full border border-ink-700 bg-ink-900 pl-1 pr-3 text-sm text-paper transition-colors hover:border-ink-600"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ember-500 text-[11px] font-semibold text-white">
                  {initials(user.name)}
                </span>
                <span className="hidden max-w-24 truncate sm:block">{user.name}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border border-ink-700 bg-ink-850 py-1 shadow-xl shadow-black/10 dark:shadow-black/40">
                  <div className="border-b border-ink-800 px-4 py-2.5">
                    <p className="truncate text-sm font-medium text-paper">{user.name}</p>
                    <p className="truncate text-xs text-paper-faint">{user.email}</p>
                  </div>
                  <Link
                    href="/account"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-paper-dim transition-colors hover:bg-ink-800 hover:text-paper"
                  >
                    <User2 className="h-4 w-4" aria-hidden /> My account
                  </Link>
                  <Link
                    href="/account?tab=tickets"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-paper-dim transition-colors hover:bg-ink-800 hover:text-paper"
                  >
                    <Ticket className="h-4 w-4" aria-hidden /> My tickets
                  </Link>
                  <Link
                    href="/account?tab=notifications"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-paper-dim transition-colors hover:bg-ink-800 hover:text-paper"
                  >
                    <Bell className="h-4 w-4" aria-hidden /> Notifications
                  </Link>
                  {user.role !== "user" && (
                    <Link
                      href={user.role === "admin" ? "/admin" : "/organizer"}
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 border-t border-ink-800 px-4 py-2.5 text-sm text-paper-dim transition-colors hover:bg-ink-800 hover:text-paper"
                    >
                      <LayoutDashboard className="h-4 w-4" aria-hidden />{" "}
                      {user.role === "admin" ? "Admin dashboard" : "Organizer dashboard"}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="flex w-full items-center gap-2.5 border-t border-ink-800 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-950/30"
                  >
                    <LogOut className="h-4 w-4" aria-hidden /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-2 inline-flex h-10 items-center rounded-full bg-ember-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-ember-400"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {!isAuthPage && (
        <div className="hidden border-t border-ink-800/70 md:block">
          <div className="mx-auto flex h-11 max-w-[1248px] items-center gap-1 px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center" aria-label="Main">
              <Suspense fallback={null}>
                <NavLinks />
              </Suspense>
            </nav>
            <Link
              href={listShowHref}
              className="ml-auto inline-flex h-8 items-center rounded-full bg-ember-500 px-4 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-ember-400"
            >
              List your show
            </Link>
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="border-t border-ink-800 px-4 pb-4 pt-3 md:hidden">
          <form onSubmit={submitSearch} className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-faint"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search events, cities…"
              autoFocus
              className="h-11 w-full rounded-full border border-ink-700 bg-ink-900 pl-10 pr-4 text-sm text-paper placeholder:text-paper-faint focus:border-ember-600 focus:outline-none"
            />
          </form>
        </div>
      )}

      {!isAuthPage && menuOpen && (
        <nav className="border-t border-ink-800 bg-ink-950/95 px-4 py-3 md:hidden" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={closeMenus}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-paper-dim transition-colors hover:bg-ink-800 hover:text-paper"
            >
              {link.label}
            </Link>
          ))}
          <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-paper-faint">
            Categories
          </p>
          {CATEGORY_LINKS.map((link) => (
            <Link
              key={link.slug}
              href={`/events?category=${link.slug}`}
              onClick={closeMenus}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-paper-dim transition-colors hover:bg-ink-800 hover:text-paper"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={listShowHref}
            onClick={closeMenus}
            className="mt-3 block rounded-full bg-ember-500 px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-ember-400"
          >
            List your show
          </Link>
        </nav>
      )}
    </header>
  );
}
