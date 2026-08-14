import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-paper-dim"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(
            "h-11 w-full rounded-md border bg-ink-900 px-3.5 text-sm text-paper placeholder:text-paper-faint transition-colors focus:outline-none focus:ring-2",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-800/70 dark:focus:border-red-700 dark:focus:ring-red-900/40"
              : "border-ink-700 focus:border-ember-600 focus:ring-ember-900/30",
            className,
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-300">{error}</p>
        ) : helper ? (
          <p className="mt-1.5 text-xs text-paper-faint">{helper}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";