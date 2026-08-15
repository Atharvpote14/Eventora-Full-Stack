"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Link2, Plus, Trash2 } from "lucide-react";
import { heroService } from "@/services/hero";
import { EventImage } from "@/components/EventImage";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/Section";
import { getErrorMessage } from "@/lib/api";
import type { HeroSlide } from "@/types";

const cleanImageUrl = (value: string): string => {
  const trimmed = value.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith("/_next/image")) {
      return parsed.searchParams.get("url") ?? trimmed;
    }
  } catch {
    // Not a URL; leave as-is.
  }
  return trimmed;
};

export function HeroTab() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [image, setImage] = useState("");
  const [addLink, setAddLink] = useState(false);
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await heroService.all();
      setSlides(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await heroService.all();
        if (!cancelled) setSlides(res);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const add = async () => {
    const trimmedImage = cleanImageUrl(image);
    if (!/^https?:\/\/.+/.test(trimmedImage)) {
      setError("Hero image must be a valid image URL.");
      return;
    }
    const trimmedLink = link.trim();
    if (addLink && trimmedLink && !/^https?:\/\/.+/.test(trimmedLink)) {
      setError("Redirect link must be a valid URL.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await heroService.create({
        image: trimmedImage,
        link: addLink ? trimmedLink || undefined : undefined,
      });
      setImage("");
      setLink("");
      setAddLink(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-paper">Hero images</h2>
        <p className="mt-1 text-sm text-paper-dim">
          Images added here slide on the home page hero (images only, auto-advancing). Each image
          can optionally redirect to a link when clicked.
        </p>
      </div>

      {error && (
        <p className="rounded-md border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="rounded-lg border border-ink-700 bg-ink-850 p-4">
        <p className="mb-3 text-sm font-medium text-paper">Add a hero image</p>
        <div className="space-y-3">
          <Input
            label="Image URL *"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/hero.jpg"
          />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-paper-dim">
            <input
              type="checkbox"
              checked={addLink}
              onChange={(e) => {
                setAddLink(e.target.checked);
                if (!e.target.checked) setLink("");
              }}
              className="h-4 w-4 accent-ember-500"
            />
            <Link2 className="h-3.5 w-3.5" aria-hidden />
            Add link (clicking this hero image redirects to it)
          </label>
          {addLink && (
            <Input
              label="Redirect link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com/event"
            />
          )}
          <Button
            variant="primary"
            onClick={() => void add()}
            loading={saving}
            className="mt-1"
          >
            <Plus className="h-4 w-4" aria-hidden /> Add image
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center">
          <Loader />
        </div>
      ) : slides.length === 0 ? (
        <EmptyState title="No hero images yet" description="Add your first hero image above." />
      ) : (
        <ul className="space-y-3">
          {slides.map((slide) => (
            <SlideRow
              key={slide._id}
              slide={slide}
              busy={busyId === slide._id}
              onSave={(data) =>
                void runAction(slide._id, () => heroService.update(slide._id, data))
              }
              onToggle={() =>
                void runAction(slide._id, () =>
                  heroService.update(slide._id, { isActive: !slide.isActive }),
                )
              }
              onDelete={() => {
                if (window.confirm("Remove this hero image?")) {
                  void runAction(slide._id, () => heroService.remove(slide._id));
                }
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function SlideRow({
  slide,
  busy,
  onSave,
  onToggle,
  onDelete,
}: {
  slide: HeroSlide;
  busy: boolean;
  onSave: (data: { image: string; link?: string }) => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [image, setImage] = useState(slide.image);
  const [addLink, setAddLink] = useState((slide.link ?? "").length > 0);
  const [link, setLink] = useState(slide.link ?? "");

  const save = () => {
    const cleanImage = cleanImageUrl(image);
    if (!/^https?:\/\/.+/.test(cleanImage)) {
      window.alert("Image URL must be a valid URL.");
      return;
    }
    if (addLink && link.trim() && !/^https?:\/\/.+/.test(link.trim())) {
      window.alert("Redirect link must be a valid URL.");
      return;
    }
    onSave({ image: cleanImage, link: addLink ? link.trim() || undefined : undefined });
  };

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-ink-800 bg-ink-850 p-3.5 sm:flex-row sm:items-center">
      <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md">
        <EventImage src={slide.image} alt="" sizes="128px" darkFallback />
        <span
          className={`absolute right-1 top-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            slide.isActive ? "bg-moss-500/90 text-white" : "bg-neutral-600 text-white"
          }`}
        >
          {slide.isActive ? "Active" : "Hidden"}
        </span>
      </div>
      <div className="min-w-0 flex-1 space-y-2.5">
        <Input
          label="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="text-sm"
        />
        <label className="flex cursor-pointer items-center gap-2 text-xs text-paper-dim">
          <input
            type="checkbox"
            checked={addLink}
            onChange={(e) => {
              setAddLink(e.target.checked);
              if (!e.target.checked) setLink("");
            }}
            className="h-3.5 w-3.5 accent-ember-500"
          />
          Add link
          {slide.link && (
            <a
              href={slide.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-ember-400 hover:text-ember-300"
            >
              <ExternalLink className="h-3 w-3" aria-hidden /> {slide.link}
            </a>
          )}
        </label>
        {addLink && (
          <Input
            label="Redirect link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://example.com"
            className="text-sm"
          />
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          loading={busy}
          onClick={() => void onToggle()}
          title={slide.isActive ? "Hide from home page" : "Show on home page"}
        >
          {slide.isActive ? "Hide" : "Show"}
        </Button>
        <Button variant="primary" size="sm" loading={busy} onClick={() => void save()}>
          Save
        </Button>
        <Button variant="ghost" size="sm" loading={busy} onClick={() => void onDelete()}>
          <Trash2 className="h-4 w-4 text-red-500" aria-hidden />
        </Button>
      </div>
    </li>
  );
}
