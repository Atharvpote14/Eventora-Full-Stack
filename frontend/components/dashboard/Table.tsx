import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Table({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-ink-800", className)}>
      <table className="w-full min-w-[560px] text-sm">
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "whitespace-nowrap bg-ink-900/60 px-3.5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-paper-faint",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-3.5 py-3 align-middle text-paper-dim", className)}>
      {children}
    </td>
  );
}
