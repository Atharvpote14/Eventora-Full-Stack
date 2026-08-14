import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  default: "bg-ink-800 text-paper-dim",
  accent: "bg-ember-500/15 text-ember-300",
  success: "bg-moss-500/10 text-moss-500",
  warning: "bg-sand-500/10 text-sand-500",
  danger: "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300",
};

export function StatCard({
  icon,
  label,
  value,
  sub,
  tone = "default",
  className,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "accent" | "success" | "warning" | "danger";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border border-ink-800 bg-ink-850 p-4",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-md",
          toneClasses[tone],
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-paper-faint">
          {label}
        </p>
        <p className="mt-0.5 truncate text-xl font-bold text-paper">{value}</p>
        {sub && <p className="mt-0.5 truncate text-xs text-paper-faint">{sub}</p>}
      </div>
    </div>
  );
}
