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
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-800 via-ink-850 to-ember-900/30",
          className,
        )}
      >
        <CalendarDays className="h-10 w-10 text-ink-600" aria-hidden />
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