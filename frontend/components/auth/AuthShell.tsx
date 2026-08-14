import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-14">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-paper">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-paper-dim">{subtitle}</p>}
      </div>
      <div className="rounded-lg border border-ink-700 bg-ink-850 p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}