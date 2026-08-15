"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Heart, MapPin } from "lucide-react";
import type { EventListItem } from "@/types";
import { EventImage } from "@/components/EventImage";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { formatDate, formatINR, categoryName } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function EventCard({
  event,
  className,
}: {
  event: EventListItem;
  className?: string;
}) {
  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const router = useRouter();
  const wishlisted = isWishlisted(event._id);

  const onWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      await toggle(event._id);
    } catch {
      // Silent failure on card hearts; error surfaces on the detail page.
    }
  };

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        "group block overflow-hidden rounded-md border border-ink-800 bg-ink-850 transition-all duration-300 hover:border-ink-600 hover:bg-ink-800",
        className,
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <EventImage
          src={event.coverImage}
          alt={event.title}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
          <Badge variant="accent">{categoryName(event.category)}</Badge>
          <button
            type="button"
            onClick={onWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlisted}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-colors",
              wishlisted
                ? "bg-ember-500 text-white"
                : "bg-ink-950/60 text-paper hover:bg-ink-950/80",
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", wishlisted && "fill-current")} aria-hidden />
          </button>
        </div>
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 text-[13px] font-semibold text-paper group-hover:text-ember-300">
          {event.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-paper-dim">
          <MapPin className="h-3 w-3 shrink-0 text-paper-faint" aria-hidden />
          <span className="truncate">
            {event.city}
            {event.venue ? ` · ${event.venue}` : ""}
          </span>
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-paper-faint">
          <CalendarDays className="h-3 w-3 shrink-0" aria-hidden />
          {formatDate(event.date)}
          {event.startTime ? ` · ${event.startTime}` : ""}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[13px] font-bold text-paper">
            {event.minPrice > 0 ? (
              <>
                From <span className="text-ember-400">{formatINR(event.minPrice)}</span>
              </>
            ) : (
              <span className="text-moss-500">Free</span>
            )}
          </p>
          {event.maxPrice > event.minPrice && (
            <span className="text-[11px] text-paper-faint">
              up to {formatINR(event.maxPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}