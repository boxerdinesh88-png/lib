import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20 whitespace-nowrap",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/25",
        secondary: "bg-secondary-900 text-white hover:bg-secondary-800 dark:bg-white dark:text-secondary-900 dark:hover:bg-slate-100",
        accent: "bg-accent text-secondary-950 hover:bg-accent-400",
        ghost: "border border-slate-200 bg-white/60 text-secondary-900 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10",
        danger: "bg-rose-600 text-white hover:bg-rose-700",
        outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-600/5 dark:text-primary-400 dark:border-primary-400",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-7 py-3.5 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
      aria-hidden
    />
  );
}

export { buttonVariants };
