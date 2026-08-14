"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Heart, LogOut, Menu, Moon, Search, Sun, Ticket, User2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn, initials } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/events", label: "Explore" },
  { href: "/events?sort=popular", label: "Trending" },
  { href: "/events?category=", label: "Categories" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
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

  const isActive = (href: string) => {
    if (href === "/events") return pathname.startsWith("/events");
    return pathname === href;
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled || searchOpen
          ? "border-b border-ink-800 bg-ink-950/90 backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-1.5 shrink-0" aria-label="Eventora home">
          <span className="text-xl font-bold tracking-tight text-paper">
            Event<span className="text-ember-500">ora</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={closeMenus}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "text-paper"
                  : "text-paper-dim hover:text-paper",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form onSubmit={submitSearch} className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-faint" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search events, cities…"
              aria-label="Search events"
              className="h-10 w-64 rounded-md border border-ink-700 bg-ink-900 pl-9 pr-3 text-sm text-paper placeholder:text-paper-faint transition-all focus:w-80 focus:border-ember-600 focus:outline-none focus:ring-2 focus:ring-ember-900/30"
            />
          </form>

          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-paper-dim transition-colors hover:bg-ink-800 hover:text-paper lg:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" aria-hidden />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-paper-dim transition-colors hover:bg-ink-800 hover:text-paper"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" aria-hidden />
            ) : (
              <Moon className="h-5 w-5" aria-hidden />
            )}
          </button>

          {user && (
            <Link
              href="/account"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-paper-dim transition-colors hover:bg-ink-800 hover:text-paper"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="h-5 w-5" aria-hidden />
            </Link>
          )}

          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                className="flex h-10 items-center gap-2 rounded-md border border-ink-700 bg-ink-900 px-2 text-sm text-paper transition-colors hover:border-ink-600"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ember-500/20 text-[11px] font-semibold text-ember-300">
                  {initials(user.name)}
                </span>
                <span className="hidden max-w-28 truncate sm:block">{user.name}</span>
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
              className="inline-flex h-10 items-center rounded-md bg-ember-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-ember-400"
            >
              Login
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-paper-dim transition-colors hover:bg-ink-800 hover:text-paper md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-ink-800 px-4 pb-4 pt-3 lg:hidden">
          <form onSubmit={submitSearch} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-faint" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search events, cities…"
              autoFocus
              className="h-11 w-full rounded-md border border-ink-700 bg-ink-900 pl-9 pr-3 text-sm text-paper placeholder:text-paper-faint focus:border-ember-600 focus:outline-none"
            />
          </form>
        </div>
      )}

      {menuOpen && (
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
        </nav>
      )}
    </header>
  );
}