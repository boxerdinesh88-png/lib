"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Clock, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { DEFAULT_SHIFTS, fetchShifts, getCachedShifts } from "@/lib/api-fns";
import type { Shift } from "@/lib/types";
import { formatINR, timeToMinutes } from "@/lib/utils";

const BLOCK_LABELS: Record<string, string> = {
  "06:00-10:00": "Early morning",
  "06:00-14:00": "Morning + noon",
  "06:00-22:00": "Full day",
  "10:00-14:00": "Morning",
  "14:00-18:00": "Afternoon",
  "14:00-22:00": "Afternoon + evening",
  "18:00-22:00": "Evening",
};

const PERKS = [
  "Your seat locked for the whole month",
  "Pay once with UPI, study every single day",
  "Auto-renew option — never lose your seat",
];

export function Pricing() {
  const [shifts, setShifts] = useState<Shift[]>(DEFAULT_SHIFTS);

  useEffect(() => {
    let active = true;
    const cached = getCachedShifts();
    if (cached.length > 0 && active) setShifts(cached);
    fetchShifts()
      .then((s) => active && setShifts(s))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const sorted = useMemo(
    () =>
      [...shifts].sort(
        (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
      ),
    [shifts]
  );
  const featured = sorted.find((s) => s.start_time === "10:00" && s.end_time === "14:00");
  const featuredId = featured?.id;

  return (
    <section id="pricing" className="section-pad relative overflow-hidden py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-primary-500/10 blur-[120px]" />
        <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left: summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="lg:sticky lg:top-28"
        >
          <span className="badge">Pricing</span>
          <h2 className="h-display mt-4 text-2xl font-bold sm:text-3xl lg:text-4xl">
            One price per time block, <span className="text-gradient">per month</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-500 dark:text-slate-400">
            Pick the hours that suit you, pay once, and keep the same seat every day.
            A wider block simply costs a little more.
          </p>

          <ul className="mt-6 sm:mt-7 space-y-3 sm:space-y-3.5">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-500">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="leading-relaxed">{perk}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 sm:mt-9">
            <Link href="/membership" prefetch className="btn-primary group h-12 w-full sm:w-auto px-7 text-base">
              <Wallet className="h-5 w-5" /> Book your seat
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="mt-3.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Prices are per month for the selected time block. Final price confirmed at checkout.
            </p>
          </div>
        </motion.div>

        {/* Right: rate card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: 0.08 }}
          className="card p-2 sm:p-3"
        >
          {sorted.length === 0 ? (
            <div className="px-6 py-14 text-center text-sm text-slate-400">
              Loading live prices…
            </div>
          ) : (
            <div className="space-y-1.5">
              {sorted.map((shift) => {
                const isFeatured = shift.id === featuredId;
                const label =
                  BLOCK_LABELS[`${shift.start_time}-${shift.end_time}`];
                return (
                  <Link
                    key={shift.id}
                    href="/membership"
                    className={`group flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-300 sm:gap-6 ${
                      isFeatured
                        ? "border border-primary-500/40 bg-primary-500/[0.08] shadow-glow"
                        : "hover:bg-slate-500/5 dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-secondary-900 dark:text-white">
                          {shift.name}
                        </p>
                        {isFeatured && (
                          <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="h-3 w-3" />
                        {label ? `${label} · ` : ""}
                        {shift.start_time} – {shift.end_time}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="h-display text-lg font-bold text-secondary-900 sm:text-xl dark:text-white">
                        {formatINR(parseFloat(shift.price))}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">/ month</p>
                    </div>

                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200/70 bg-white/60 text-slate-500 transition-all duration-300 group-hover:border-primary-600 group-hover:bg-primary-600 group-hover:text-white dark:border-white/15 dark:bg-white/10 dark:text-slate-300">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
