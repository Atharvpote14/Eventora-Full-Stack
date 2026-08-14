"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { cn } from "@/lib/utils";

export function WishlistButton({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const wishlisted = isWishlisted(eventId);

  const onClick = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setBusy(true);
    try {
      await toggle(eventId);
    } catch {
      // Keep UI stable on failure; wishlist tab shows authoritative state.
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={busy}
      aria-pressed={wishlisted}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors disabled:opacity-60",
        wishlisted
          ? "border-ember-600 bg-ember-500/15 text-ember-300"
          : "border-ink-600 text-paper-dim hover:border-ember-600 hover:text-paper",
      )}
    >
      <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} aria-hidden />
      {wishlisted ? "Wishlisted" : "Save"}
    </button>
  );
}