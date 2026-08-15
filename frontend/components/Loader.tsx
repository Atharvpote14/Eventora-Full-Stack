import { cn } from "@/lib/utils";

export function Loader({ className }: { className?: string }) {
  return (
    <div
      className={cn("relative h-24 w-full", className)}
      role="status"
      aria-label="Loading"
    >
      <div className="loader">
        <div className="justify-content-center jimu-primary-loading" />
      </div>
    </div>
  );
}
