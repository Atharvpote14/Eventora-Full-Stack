import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-bold tracking-tight text-paper">
        4<span className="text-ember-500">0</span>4
      </p>
      <h1 className="text-xl font-semibold text-paper">
        Looks like this event has left the building
      </h1>
      <p className="max-w-sm text-sm text-paper-dim">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        href="/events"
        className="mt-2 inline-flex h-11 items-center gap-2 rounded-md bg-ember-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-ember-400"
      >
        <Compass className="h-4 w-4" aria-hidden />
        Explore events
      </Link>
    </div>
  );
}