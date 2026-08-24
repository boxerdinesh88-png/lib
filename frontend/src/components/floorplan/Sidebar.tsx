"use client";

import { Armchair, ChevronLeft, ChevronRight, Clock, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { cn, formatINR, formatTime } from "@/lib/utils";
import type { Seat, Shift, User } from "@/lib/types";

export interface SidebarProps {
  user: User;
  seat: Seat | null;
  shift: Shift | null;
  durationMonths: number;
  total: number | null;
  holdRemaining: number | null;
  loading?: boolean;
  onBook: () => void;
  onCancel: () => void;
  onBack: () => void;
  onAutoToggle: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-secondary-900 dark:text-white">{value}</dd>
    </div>
  );
}

export function Sidebar({
  user,
  seat,
  shift,
  durationMonths,
  total,
  holdRemaining,
  loading,
  onBook,
  onCancel,
  onBack,
  onAutoToggle,
}: SidebarProps) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <GlassCard hover={false} className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600/10 text-sm font-bold text-primary-700 dark:bg-white/10 dark:text-primary-300">
          <Wallet className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="h-display text-base font-semibold">Booking details</h3>
          <p className="truncate text-xs text-slate-500">{user.name}</p>
        </div>
      </div>

      <div className="p-5">
        <div
          className={cn(
            "flex items-center gap-4 rounded-2xl border p-4",
            seat
              ? "border-primary-500/60 bg-primary-600/10 dark:bg-primary-900/25"
              : "border-dashed border-slate-300 dark:border-white/15"
          )}
        >
          <span
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold",
              seat ? "bg-primary-600 text-white shadow-glow" : "bg-slate-100 text-slate-400 dark:bg-white/10"
            )}
          >
            {seat ? seat.seat_number : "AUTO"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-secondary-900 dark:text-white">
              {seat ? `Seat ${seat.seat_number}` : "Best free seat"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {seat
                ? `${seat.section.charAt(0).toUpperCase() + seat.section.slice(1)}${seat.zone ? ` · Zone ${seat.zone.code}` : ""}${seat.is_girls_only ? " · Girls-only" : ""}`
                : "We'll assign the best available seat."}
            </p>
          </div>
        </div>

        {holdRemaining != null && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-300/50 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-300">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="font-semibold">Reserved for you</span>
            <span className="ml-auto font-mono tabular-nums">
              {`${String(Math.floor(holdRemaining / 60)).padStart(2, "0")}:${String(holdRemaining % 60).padStart(2, "0")}`}
            </span>
          </div>
        )}

        <dl className="mt-5 space-y-3 border-t border-slate-200/70 pt-4 dark:border-white/10">
          <Row label="Student" value={user.name} />
          <Row label="Seat" value={seat ? `Seat ${seat.seat_number}` : "Auto-assign"} />
          <Row label="Date" value={today} />
          <Row label="Start time" value={shift ? formatTime(shift.start_time) : "—"} />
          <Row label="End time" value={shift ? formatTime(shift.end_time) : "—"} />
          <Row label="Duration" value={`${durationMonths} month${durationMonths === 1 ? "" : "s"}`} />
          <Row label="Price" value={total != null ? formatINR(total) : "—"} />
        </dl>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-slate-300/80 pt-4 dark:border-white/15">
          <div>
            <p className="text-sm font-medium text-secondary-900 dark:text-white">Auto-assign seat</p>
            <p className="text-xs text-slate-500">Skip manual selection</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={!seat}
            onClick={onAutoToggle}
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition-colors",
              !seat ? "bg-primary-600" : "bg-slate-300 dark:bg-white/20"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                !seat ? "left-[22px]" : "left-0.5"
              )}
            />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm text-slate-500">Total</span>
          <span className="text-xl font-bold text-secondary-900 dark:text-white">{formatINR(total ?? 0)}</span>
        </div>

        <Button size="lg" className="mt-4 w-full" onClick={onBook} loading={loading}>
          <Armchair className="h-4 w-4" /> Book seat
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" className="mt-2 w-full" onClick={onCancel}>
          Cancel selection
        </Button>
        <Button variant="ghost" className="mt-1 w-full" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back to plan
        </Button>
      </div>
    </GlassCard>
  );
}
