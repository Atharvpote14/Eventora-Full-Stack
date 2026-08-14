import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  reviewCount,
  size = "md",
  showValue = true,
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}) {
  const starSize = size === "lg" ? "h-5 w-5" : size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const textSize = size === "lg" ? "text-base" : size === "sm" ? "text-xs" : "text-sm";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSize,
              rating >= star - 0.25
                ? "fill-sand-500 text-sand-500"
                : rating >= star - 0.75
                  ? "fill-sand-500/40 text-sand-500/40"
                  : "fill-transparent text-ink-600",
            )}
          />
        ))}
      </span>
      {showValue && (
        <span className={cn("font-medium text-paper-dim", textSize)}>
          {rating > 0 ? rating.toFixed(1) : "New"}
          {reviewCount !== undefined && reviewCount > 0 && (
            <span className="text-paper-faint">
              {" "}
              ({reviewCount})
            </span>
          )}
        </span>
      )}
    </span>
  );
}