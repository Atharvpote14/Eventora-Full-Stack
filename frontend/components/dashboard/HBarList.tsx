import { cn } from "@/lib/utils";

export function HBarList({
  items,
  className,
}: {
  items: {
    label: string;
    value: number;
    valueLabel: string;
    sub?: string;
  }[];
  className?: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="truncate text-sm font-medium text-paper">{item.label}</span>
            <span className="shrink-0 text-sm font-semibold text-paper-dim">
              {item.valueLabel}
            </span>
          </div>
          {item.sub && <p className="mb-1 text-xs text-paper-faint">{item.sub}</p>}
          <div className="h-2 overflow-hidden rounded-full bg-ink-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ember-700 to-ember-500 transition-all duration-500"
              style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
