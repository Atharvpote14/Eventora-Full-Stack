import Link from "next/link";

const EXPLORE_LINKS = [
  { href: "/events", label: "Explore all events" },
  { href: "/events?sort=popular", label: "Trending now" },
  { href: "/events?sort=date_asc", label: "Upcoming" },
];

const CATEGORY_LINKS = [
  "Technology",
  "Music",
  "Workshops",
  "Sports",
  "Entertainment",
];

export function Footer() {
  return (
    <footer className="border-t border-ink-800 bg-ink-900">
      <div className="mx-auto max-w-[1248px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-lg font-bold tracking-tight text-paper">
              Event<span className="text-ember-500">ora</span>
            </p>
            <p className="mt-2 max-w-52 text-sm text-paper-dim">
              Discover experiences worth remembering. Book tickets securely in
              seconds.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-paper-faint">
              Explore
            </h3>
            <ul className="mt-3 space-y-2">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-paper-dim transition-colors hover:text-paper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-paper-faint">
              Categories
            </h3>
            <ul className="mt-3 space-y-2">
              {CATEGORY_LINKS.map((category) => (
                <li key={category}>
                  <Link
                    href={`/events?category=${encodeURIComponent(category)}`}
                    className="text-sm text-paper-dim transition-colors hover:text-paper"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-paper-faint">
              Support
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/account"
                  className="text-sm text-paper-dim transition-colors hover:text-paper"
                >
                  My account
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-paper-dim transition-colors hover:text-paper"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-paper-dim transition-colors hover:text-paper"
                >
                  Create account
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-ink-800 pt-6 sm:flex-row">
          <p className="text-xs text-paper-faint">
            © {new Date().getFullYear()} Eventora. All rights reserved.
          </p>
          <p className="text-xs text-paper-faint">
            Payments powered by{" "}
            <span className="text-paper-dim">Razorpay</span>
          </p>
        </div>
      </div>
    </footer>
  );
}