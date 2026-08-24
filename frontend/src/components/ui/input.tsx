import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, trailing, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-secondary-800 dark:text-slate-200">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "input-base",
              icon && "pl-11",
              trailing && "pr-11",
              error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10",
              className
            )}
            {...props}
          />
          {trailing && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</span>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>}
        {!error && hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
