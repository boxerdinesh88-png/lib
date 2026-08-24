import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  hover = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "card",
        hover && "transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg dark:hover:border-white/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
