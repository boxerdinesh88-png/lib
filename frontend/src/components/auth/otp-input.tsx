"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled,
  autoFocus,
  className,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [focused, setFocused] = useState<number | null>(autoFocus ? 0 : null);

  const chars = value.padEnd(length, " ").split("").slice(0, length);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  function handleChange(idx: number, raw: string) {
    const digit = raw.replace(/\D/g, "");
    const next = digit.slice(-1);
    const newValue = value.slice(0, idx) + next + value.slice(idx + 1);
    onChange(newValue.trim().slice(0, length));
    if (digit && idx < length - 1) refs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      onChange(value.slice(0, idx - 1));
      refs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < length - 1) refs.current[idx + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (text) {
      onChange(text);
      refs.current[Math.min(text.length, length - 1)]?.focus();
    }
  }

  return (
    <div className={cn("flex w-full justify-between gap-2 sm:gap-3", className)} role="group" aria-label="One-time password">
      {Array.from({ length }, (_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            refs.current[idx] = el;
          }}
          inputMode="numeric"
          autoComplete={idx === 0 ? "one-time-code" : "off"}
          maxLength={2}
          value={chars[idx]!.trim()}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={() => setFocused(idx)}
          onBlur={() => setFocused(null)}
          aria-label={`Digit ${idx + 1}`}
          className={cn(
            "h-12 w-10 rounded-xl border-2 bg-white/80 text-center text-lg font-bold text-secondary-900 outline-none transition-all dark:bg-secondary-800/60 dark:text-white sm:h-14 sm:w-12 sm:text-xl",
            focused === idx
              ? "border-primary-600 shadow-glow ring-4 ring-primary-500/20"
              : "border-slate-200 dark:border-white/10",
            disabled && "opacity-50"
          )}
        />
      ))}
    </div>
  );
}
