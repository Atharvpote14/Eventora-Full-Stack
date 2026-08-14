"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pages,
}: {
  page: number;
  pages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goTo = (target: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(target));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (pages <= 1) return null;

  const pageNumbers: Array<number | "…"> = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) {
      pageNumbers.push(p);
    } else if (pageNumbers[pageNumbers.length - 1] !== "…") {
      pageNumbers.push("…");
    }
  }

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink-700 bg-ink-900 text-paper-dim transition-colors hover:border-ink-600 hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>
      {pageNumbers.map((item, index) =>
        item === "…" ? (
          <span key={`ellipsis-${index}`} className="px-1 text-paper-faint">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => goTo(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              "h-10 w-10 rounded-md border text-sm font-medium transition-colors",
              item === page
                ? "border-ember-600 bg-ember-500/15 text-ember-300"
                : "border-ink-700 bg-ink-900 text-paper-dim hover:border-ink-600 hover:text-paper",
            )}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => goTo(page + 1)}
        disabled={page >= pages}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink-700 bg-ink-900 text-paper-dim transition-colors hover:border-ink-600 hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </nav>
  );
}