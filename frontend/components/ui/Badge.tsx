import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "danger" | "neutral";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-ink-800 text-paper-dim border border-ink-700",
  accent: "bg-ember-500/15 text-ember-300 border border-ember-500/30",
  success: "bg-moss-500/10 text-moss-500 border border-moss-500/25",
  warning: "bg-sand-500/10 text-sand-500 border border-sand-500/25",
  danger:
    "bg-red-100 text-red-600 border border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60",
  neutral: "bg-ink-700/60 text-paper-faint border border-ink-600",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}