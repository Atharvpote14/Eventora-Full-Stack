"use client";

import { useCallback, useEffect, useState } from "react";
import { EventImage } from "@/components/EventImage";
import { cn } from "@/lib/utils";

const AUTO_ADVANCE_MS = 2500;

type Slide = { image: string; link?: string };

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [ratios, setRatios] = useState<Record<number, number>>({});
  const count = slides.length;
  const activeRatio = ratios[index] ?? 16 / 9;

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [count, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === "ArrowRight") go(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  if (count === 0) return null;

  return (
    <section
      className="relative"
      aria-roledescription="carousel"
      aria-label="Featured event images"
    >
      <div className="mx-auto max-w-[1248px] px-4 sm:px-6 lg:px-8">
        <div
          className="relative w-full overflow-hidden rounded-xl bg-neutral-900 max-sm:aspect-[16/9]! max-sm:max-h-none!"
          style={{ aspectRatio: String(activeRatio), minHeight: 220, maxHeight: "78vh" }}
        >
          {slides.map((slide, slideIndex) => {
            const image = (
              <EventImage
                src={slide.image}
                alt=""
                sizes="(max-width: 1152px) 100vw, 1152px"
                priority
                darkFallback
                fit="contain"
                imgClassName="max-sm:object-cover!"
                onLoad={(el) => {
                  const { naturalWidth, naturalHeight } = el;
                  if (naturalWidth > 0 && naturalHeight > 0) {
                    setRatios((prev) => {
                      const ratio = naturalWidth / naturalHeight;
                      return prev[slideIndex] === ratio
                        ? prev
                        : { ...prev, [slideIndex]: ratio };
                    });
                  }
                }}
              />
            );
            return (
              <div
                key={slideIndex}
                aria-hidden={slideIndex !== index}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700",
                  slideIndex === index ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                {slide.link ? (
                  <a
                    href={slide.link}
                    className="block h-full w-full"
                    aria-label="Open linked content"
                  >
                    {image}
                  </a>
                ) : (
                  image
                )}
              </div>
            );
          })}

          {count > 1 && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-sm">
              {slides.map((slide, dotIndex) => (
                <button
                  key={dotIndex}
                  type="button"
                  onClick={() => go(dotIndex)}
                  aria-label={`Go to slide ${dotIndex + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    dotIndex === index
                      ? "w-6 bg-ember-500"
                      : "w-1.5 bg-white/40 hover:bg-white/70",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}