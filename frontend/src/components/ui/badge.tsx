import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        primary: "bg-primary-600/10 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300",
        accent: "bg-accent/10 text-accent-600 dark:bg-accent/15 dark:text-accent-400",
        success: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
        warning: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
        danger: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
        neutral: "bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300",
        gold: "bg-gradient-to-r from-amber-400/20 to-yellow-500/20 text-amber-600 dark:text-amber-300 border border-amber-400/30",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
