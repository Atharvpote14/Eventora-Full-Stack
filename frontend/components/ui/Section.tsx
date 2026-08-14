import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function SectionHeader({
  title,
  subtitle,
  action,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-paper-dim">{subtitle}</p>}
      </div>
      {action && (
        <Button variant="ghost" size="sm" onClick={onAction} className="shrink-0">
          {actionLabel ?? "See all"}
          <span aria-hidden>→</span>
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  actionHref,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-ink-700 px-6 py-14 text-center",
        className,
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-800 text-paper-dim">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-paper">{title}</h3>
      {description && <p className="max-w-sm text-sm text-paper-dim">{description}</p>}
      {action &&
        (actionHref ? (
          <Link
            href={actionHref}
            className="mt-2 inline-flex h-9 items-center rounded-md border border-ink-600 px-3 text-sm text-paper transition-colors hover:border-ember-500 hover:text-ember-300"
          >
            {actionLabel ?? action}
          </Link>
        ) : (
          <Button variant="outline" size="sm" onClick={onAction} className="mt-2">
            {actionLabel ?? action}
          </Button>
        ))}
    </div>
  );
}

export function BadgeDot({ label, tone }: { label: string; tone: "success" | "danger" | "warning" | "neutral" }) {
  const dot = {
    success: "bg-moss-500",
    danger: "bg-red-400",
    warning: "bg-sand-500",
    neutral: "bg-ink-600",
  }[tone];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-paper-dim">
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} aria-hidden />
      {label}
    </span>
  );
}