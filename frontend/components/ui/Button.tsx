import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ember-500 text-white hover:bg-ember-400 active:bg-ember-600 disabled:bg-ember-700 disabled:text-white/60",
  secondary:
    "bg-ink-800 text-paper hover:bg-ink-700 active:bg-ink-600 border border-ink-700",
  outline:
    "border border-ink-600 text-paper hover:border-ember-500 hover:text-ember-300 bg-transparent",
  ghost: "text-paper-dim hover:text-paper hover:bg-ink-800",
  danger:
    "bg-ink-800 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-300 dark:text-red-300 dark:hover:bg-red-950/40 dark:hover:text-red-200 dark:border-red-900/50",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-7 text-base gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", loading, className, children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-500 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";