"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import { eventsService } from "@/services/events";
import { reviewsService } from "@/services/user";
import { useAuth } from "@/contexts/AuthContext";
import { Loader } from "@/components/Loader";
import { RatingStars } from "@/components/ui/RatingStars";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/api";
import { timeAgo, initials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

export function EventReviews({
  eventId,
  initialRating,
}: {
  eventId: string;
  initialRating: { averageRating: number; reviewCount: number };
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState(initialRating);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventsService.reviews(eventId);
      setReviews(res.data);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await eventsService.reviews(eventId);
        if (!cancelled) setReviews(res.data);
      } catch {
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const review = await eventsService.createReview(eventId, rating, comment.trim());
      setReviews((prev) => [review, ...prev]);
      setRating(0);
      setComment("");
      setSummary((prev) => ({
        averageRating:
          (prev.averageRating * prev.reviewCount + review.rating) /
          (prev.reviewCount + 1),
        reviewCount: prev.reviewCount + 1,
      }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (reviewId: string) => {
    try {
      await reviewsService.remove(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      setSummary((prev) => ({
        averageRating: prev.reviewCount > 1 ? prev.averageRating : 0,
        reviewCount: Math.max(0, prev.reviewCount - 1),
      }));
    } catch {
      // Ignore failures on delete; refresh authoritative state.
      void load();
    }
  };

  return (
    <section id="reviews" className="mt-14">
      <div className="mb-6 flex items-center gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-paper">Reviews</h2>
        {summary.reviewCount > 0 && (
          <RatingStars rating={summary.averageRating} reviewCount={summary.reviewCount} />
        )}
      </div>

      {user && (
        <form
          onSubmit={(event) => void submit(event)}
          className="mb-8 rounded-lg border border-ink-700 bg-ink-850 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-paper">Rate this event</span>
            <span className="flex items-center gap-0.5" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`${star} star${star === 1 ? "" : "s"}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onClick={() => setRating(star)}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      "h-5 w-5 transition-colors",
                      (hoverRating || rating) >= star
                        ? "fill-sand-500 text-sand-500"
                        : "text-ink-600",
                    )}
                  />
                </button>
              ))}
            </span>
          </div>
          <Input
            label="Your review"
            placeholder="What was the experience like?"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="mt-3"
            maxLength={1000}
          />
          {error && <p className="mt-2 text-xs text-red-600 dark:text-red-300">{error}</p>}
          <Button type="submit" size="sm" loading={submitting} className="mt-3">
            Post review
          </Button>
        </form>
      )}

      {loading ? (
        <div className="flex min-h-32 items-center justify-center">
          <Loader />
        </div>
      ) : reviews.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ink-700 px-6 py-10 text-center text-sm text-paper-dim">
          No reviews yet{user ? " — be the first to share your experience." : "."}
        </p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li
              key={review._id}
              className="flex gap-3.5 rounded-lg border border-ink-800 bg-ink-850 p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-700 text-xs font-semibold text-paper">
                {review.user ? initials(review.user.name) : "?"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="text-sm font-semibold text-paper">
                    {review.user?.name ?? "Anonymous"}
                  </span>
                  <span className="text-xs text-paper-faint">{timeAgo(review.createdAt)}</span>
                  {user && review.user && review.user._id === user._id && (
                    <button
                      type="button"
                      onClick={() => void remove(review._id)}
                      className="ml-auto inline-flex items-center gap-1 text-xs text-paper-faint transition-colors hover:text-red-600 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
                    </button>
                  )}
                </div>
                <div className="mt-0.5">
                  <RatingStars rating={review.rating} showValue={false} size="sm" />
                </div>
                {review.comment && (
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-paper-dim">
                    {review.comment}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!user && (
        <p className="mt-6 text-sm text-paper-faint">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-medium text-ember-400 hover:text-ember-300"
          >
            Log in
          </button>{" "}
          to share your review.
        </p>
      )}
    </section>
  );
}