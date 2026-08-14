"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export function EventImage({
  src,
  alt,
  sizes,
  className,
  imgClassName,
  priority,
  darkFallback,
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  darkFallback?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex h-full w-full items-center justify-center",
          darkFallback
            ? "bg-gradient-to-br from-neutral-800 via-neutral-900 to-black"
            : "bg-gradient-to-br from-ink-800 via-ink-850 to-ember-900/30",
          className,
        )}
      >
        <CalendarDays
          className={cn("h-10 w-10", darkFallback ? "text-neutral-600" : "text-ink-600")}
          aria-hidden
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={cn("object-cover", imgClassName, className)}
    />
  );
}