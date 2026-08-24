"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Armchair,
  Banknote,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Hourglass,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
  Sun,
  SunMedium,
  Sunrise,
  Sunset,
  Wallet,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, memo, useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { LibraryLayout } from "@/components/floorplan/LibraryLayout";
import { Sidebar } from "@/components/floorplan/Sidebar";
import type { FloorplanStatus } from "@/components/floorplan/SeatData";
import { seatStatusOf, type MapSeat } from "@/lib/seat-status";
import {
  createMembership,
  createPaymentOrder,
  fetchMembership,
  fetchPaymentStatus,
  fetchSeatMap,
  fetchShifts,
  getCachedShifts,
  holdSeat,
  requestCashPayment,
  verifyPayment,
} from "@/lib/api-fns";
import { apiErrorCode, apiErrorMessage } from "@/lib/api";
import { loadRazorpay, openRazorpay } from "@/lib/razorpay";
import type { Membership, PaymentOrder, Seat, Shift } from "@/lib/types";
import { cn, formatDate, formatINR, formatTime, hoursBetween, timeToMinutes } from "@/lib/utils";
import { useMembershipStore } from "@/store/membership";
import { useAuthStore } from "@/store/auth";

type Step = "plan" | "seat" | "pay" | "done";

const EASE = [0.22, 1, 0.36, 1] as const;
const STEP_ORDER: Step[] = ["plan", "seat", "pay"];

const STEPS = [
  { key: "plan" as Step, label: "Plan", icon: CalendarClock },
  { key: "seat" as Step, label: "Seat", icon: Armchair },
  { key: "pay" as Step, label: "Pay", icon: CreditCard },
];

const DURATION_GROUPS = [
  { label: "Monthly", from: 1, to: 3 },
  { label: "Flexible", from: 4, to: 6 },
  { label: "Semester", from: 7, to: 9 },
  { label: "Yearly", from: 10, to: 12 },
] as const;

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function byStartTime(a: Shift, b: Shift): number {
  return timeToMinutes(a.start_time) - timeToMinutes(b.start_time);
}

function shiftIcon(startTime: string) {
  const h = Number(startTime.split(":")[0]);
  if (h <= 7) return Sunrise;
  if (h <= 11) return Sun;
  if (h <= 15) return SunMedium;
  return Sunset;
}

function shiftMeta(shift: Shift): { label: string; variant: "gold" | "primary" } | null {
  if (shift.start_time === "06:00" && shift.end_time === "22:00") return { label: "Best value", variant: "gold" };
  if (shift.start_time === "10:00" && shift.end_time === "14:00") return { label: "Most popular", variant: "primary" };
  return null;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-secondary-900 dark:text-white">{value}</dd>
    </div>
  );
}

const Stepper = memo(function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <Fragment key={s.key}>
            {i > 0 && (
              <div
                className={cn(
                  "h-0.5 w-10 rounded-full transition-colors sm:w-16",
                  done ? "bg-primary-500" : "bg-slate-300 dark:bg-white/15"
                )}
              />
            )}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                  done
                    ? "border-primary-500 bg-primary-600 text-white shadow-glow"
                    : active
                      ? "border-primary-500 bg-primary-600/10 text-primary-600 dark:bg-primary-400/10 dark:text-primary-300"
                      : "border-slate-300 text-slate-400 dark:border-white/15"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold transition-colors",
                  active ? "text-secondary-900 dark:text-white" : "text-slate-400"
                )}
              >
                {s.label}
              </span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
});

const ShiftCard = memo(function ShiftCard({
  shift,
  selected,
  onSelect,
  index,
}: {
  shift: Shift;
  selected: boolean;
  onSelect: (shift: Shift) => void;
  index: number;
}) {
  const Icon = shiftIcon(shift.start_time);
  const hours = Math.max(hoursBetween(shift.start_time, shift.end_time), 1);
  const meta = shiftMeta(shift);
  const perHour = Math.round(parseFloat(shift.price) / hours);

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(shift)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: EASE }}
      className={cn(
        "group relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200",
        selected
          ? "border-primary-500 bg-primary-600/10 ring-2 ring-primary-500/30 dark:bg-primary-900/25"
          : "border-slate-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-soft dark:border-white/10"
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
          selected
            ? "bg-primary-600 text-white"
            : "bg-primary-600/10 text-primary-600 dark:bg-white/10 dark:text-primary-300"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-secondary-900 dark:text-white">{shift.name}</span>
          {meta && <Badge variant={meta.variant}>{meta.label}</Badge>}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
          <span>{formatTime(shift.start_time)} – {formatTime(shift.end_time)}</span>
          <span className="text-slate-300 dark:text-white/15">•</span>
          <span>{hours}h block</span>
          <span className="text-slate-300 dark:text-white/15">•</span>
          <span>≈ ₹{perHour}/hr</span>
        </span>
      </span>

      <span className="shrink-0 text-right">
        <span className="block text-lg font-bold text-primary-700 dark:text-primary-300">
          {formatINR(parseFloat(shift.price))}
        </span>
        <span className="text-[10px] text-slate-400">/ month</span>
      </span>

      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          selected
            ? "border-primary-600 bg-primary-600 text-white"
            : "border-slate-300 dark:border-white/25"
        )}
      >
        {selected && <Check className="h-3 w-3" />}
      </span>
    </motion.button>
  );
});

const DurationPicker = memo(function DurationPicker({
  months,
  selected,
  onSelect,
}: {
  months: number;
  selected: number;
  onSelect: (m: number) => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-2 sm:gap-2.5">
      {DURATION_GROUPS.map((group) => {
        const values = Array.from(
          { length: group.to - group.from + 1 },
          (_, i) => group.from + i
        ).filter((m) => m <= months);
        return (
          <div key={group.label} className="col-span-3 flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-1 px-0.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {group.label}
              </span>
              <span className="text-[10px] font-medium text-slate-300 dark:text-white/20">
                {group.from}–{Math.min(group.to, months)}m
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {values.map((m) => {
                const active = selected === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onSelect(m)}
                    aria-pressed={active}
                    className={cn(
                      "relative flex h-10 items-center justify-center rounded-lg border text-sm font-bold transition-all duration-200",
                      active
                        ? "border-primary-500 bg-primary-600 text-white shadow-glow"
                        : "border-slate-200 text-secondary-700 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-soft dark:border-white/10 dark:text-slate-200"
                    )}
                  >
                    {m}m
                    {active && (
                      <Check
                        className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 rounded-full bg-primary-600 p-0.5 text-white ring-2 ring-white dark:ring-secondary-900"
                        aria-hidden
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
});

function HoldTimer({
  expiresAt,
  children,
}: {
  expiresAt: string | null;
  children: (remaining: number | null) => React.ReactNode;
}) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setRemaining(null);
      return;
    }
    const tick = () =>
      setRemaining(
        Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      );
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  return <>{children(remaining)}</>;
}

export function MembershipApp() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);

  const shifts = useMembershipStore((s) => s.shifts);
  const setShifts = useMembershipStore((s) => s.setShifts);
  const selectedShift = useMembershipStore((s) => s.selectedShift);
  const setSelectedShift = useMembershipStore((s) => s.setSelectedShift);
  const durationMonths = useMembershipStore((s) => s.durationMonths);
  const setDurationMonths = useMembershipStore((s) => s.setDurationMonths);
  const seats = useMembershipStore((s) => s.seats);
  const setSeats = useMembershipStore((s) => s.setSeats);
  const loading = useMembershipStore((s) => s.loading);
  const setLoading = useMembershipStore((s) => s.setLoading);

  const [step, setStep] = useState<Step>("plan");
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [cashLoading, setCashLoading] = useState(false);
  const [seatsLoading, setSeatsLoading] = useState(false);

  const sortedShifts = useMemo(() => [...shifts].sort(byStartTime), [shifts]);

  useEffect(() => {
    if (shifts.length === 0) {
      const cached = getCachedShifts();
      if (cached.length > 0) setShifts(cached);
    }
    fetchShifts()
      .then(setShifts)
      .catch(() => toast("Could not load shifts", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedShift && sortedShifts.length > 0) {
      const preferred =
        sortedShifts.find((s) => s.start_time === "10:00" && s.end_time === "14:00") ?? sortedShifts[0];
      if (preferred) setSelectedShift(preferred);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedShifts, selectedShift]);

  const price = selectedShift ? parseFloat(selectedShift.price) : null;
  const total = price != null ? price * durationMonths : null;

  const mapSeats = useMemo<MapSeat[]>(
    () =>
      seats.map((s) => ({
        id: s.id,
        number: s.seat_number,
        zone: s.zone?.code ?? "",
        gridCol: s.grid_col ?? 0,
        gridRow: s.grid_row ?? 0,
        isGirlsOnly: !!s.is_girls_only,
        status: seatStatusOf(s, selectedSeat?.id ?? null),
      })),
    [seats, selectedSeat]
  );

  const fpSeats = useMemo(
    () =>
      mapSeats.map((s) => ({
        number: s.number,
        status: (s.status === "held" ? "reserved" : s.status) as FloorplanStatus,
      })),
    [mapSeats]
  );

  function bookingRange() {
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 30 * durationMonths);
    return { start: isoDate(today), end: isoDate(end) };
  }

  const loadSeats = useCallback(async () => {
    if (!selectedShift) return;
    setSeatsLoading(true);
    try {
      const res = await fetchSeatMap({
        shift: selectedShift.id,
        start_date: bookingRange().start,
        end_date: bookingRange().end,
      });
      setSeats(res.seats);
    } catch (err) {
      toast("Could not load seats", "error", apiErrorMessage(err));
    } finally {
      setSeatsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShift, durationMonths, setSeats, toast]);

  // Live-poll the seat map so holds/occupancy stay fresh without rebuilding
  // the 3D scene (the canvas only re-renders seats whose status changed).
  // Skip ticks while the tab is hidden to save battery/bandwidth.
  useEffect(() => {
    if (step !== "seat") return;
    loadSeats();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") loadSeats();
    }, 8000);
    return () => window.clearInterval(timer);
  }, [step, loadSeats]);

  async function handlePickSeat(seat: Seat) {
    const status = seatStatusOf(seat, selectedSeat?.id ?? null);
    if (status === "locked") {
      toast("This seat is in the girls-only zone", "info");
      return;
    }
    if (status !== "available") {
      toast("That seat is no longer free", "info");
      await loadSeats();
      return;
    }
    if (!selectedShift) return;
    try {
      const booking = await holdSeat({
        seat: seat.id,
        shift: selectedShift.id,
        start_date: bookingRange().start,
        end_date: bookingRange().end,
      });
      setSelectedSeat(seat);
      setHoldExpiresAt(booking.expires_at);
    } catch (err) {
      if (apiErrorCode(err) === "email_unverified") {
        toast("Verify your email first", "info", "Reserve a seat once your account is verified.");
        router.push(`/verify-email?email=${encodeURIComponent(user?.email ?? "")}`);
        return;
      }
      toast("Could not reserve this seat", "error", apiErrorMessage(err));
      await loadSeats();
    }
  }

  function handleToggleSeat(seat: Seat) {
    if (selectedSeat?.id === seat.id) {
      setSelectedSeat(null);
      setHoldExpiresAt(null);
      return;
    }
    void handlePickSeat(seat);
  }

  async function handleContinue() {
    if (!user) {
      router.push("/login?next=/membership");
      return;
    }
    if (!selectedShift || !price) {
      toast("Select a time block", "info");
      return;
    }
    setSelectedSeat(null);
    setHoldExpiresAt(null);
    setStep("seat");
  }

  async function handleCreateMembership() {
    if (!selectedShift) return;
    setLoading(true);
    try {
      const created = await createMembership({
        shift: selectedShift.id,
        seat: selectedSeat?.id ?? null,
        duration_months: durationMonths,
      });
      setMembership(created);
      setStep("pay");
    } catch (err) {
      toast("Could not create membership", "error", apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleStartPayment() {
    if (!membership || orderLoading) return;
    setOrderLoading(true);
    try {
      const created = await createPaymentOrder(membership.id);
      setOrder(created);
      setPayModalOpen(true);
    } catch (err) {
      const message = apiErrorMessage(err);
      toast(
        "Could not start payment",
        "error",
        apiErrorCode(err) === "payment_gateway_error"
          ? `${message} Please check the Razorpay settings and try again.`
          : message
      );
    } finally {
      setOrderLoading(false);
    }
  }

  async function handleCashRequest() {
    if (!membership) return;
    setCashLoading(true);
    try {
      const updated = await requestCashPayment(membership.id);
      setMembership(updated);
      setStep("done");
      toast("Cash request sent", "success", "Your seat is held for 3 days.");
    } catch (err) {
      toast("Could not send cash request", "error", apiErrorMessage(err));
    } finally {
      setCashLoading(false);
    }
  }

  function finishPaymentSuccess(updated: Membership) {
    setMembership(updated);
    setPayModalOpen(false);
    setStep("done");
    toast("Payment successful", "success", "Your seat is reserved.");
  }

  async function pollUntilResolved(
    membershipId: string
  ): Promise<"paid" | "failed" | "unknown"> {
    // The backend asks Razorpay for live order state on every tick (?refresh=1),
    // so a payment that succeeded despite a dropped callback self-heals here.
    for (let attempt = 0; attempt < 6; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 3000));
      try {
        const report = await fetchPaymentStatus(membershipId, true);
        if (report.activated) return "paid";
        if (report.payment_status === "failed") return "failed";
      } catch {
        // Transient network error — keep polling.
      }
    }
    return "unknown";
  }

  async function resolvePayment(
    membershipId: string,
    response?: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    } | null
  ) {
    if (response) {
      try {
        const result = await verifyPayment(
          membershipId,
          response.razorpay_payment_id,
          response.razorpay_signature,
          response.razorpay_order_id
        );
        finishPaymentSuccess(result.membership);
        return;
      } catch {
        // Verify was slow/dropped — never assume failure; recover via polling.
      }
    }
    setConfirming(true);
    const outcome = await pollUntilResolved(membershipId);
    setConfirming(false);
    setPaying(false);
    if (outcome === "paid") {
      let updated: Membership | null = null;
      try {
        updated = await fetchMembership(membershipId);
      } catch {
        updated = null;
      }
      finishPaymentSuccess(updated ?? membership!);
      return;
    }
    if (outcome === "failed") {
      toast(
        "Payment did not go through",
        "error",
        "No amount was captured. You can safely try again."
      );
    } else {
      // Still unsettled — the webhook may confirm it any moment. Never lie.
      toast(
        "We're still confirming your payment",
        "info",
        "If it succeeded, your pass activates automatically in a minute."
      );
    }
  }

  async function handleDismiss() {
    setPaying(false);
    if (!membership) return;
    // User closed the checkout — maybe right after paying. One quiet check
    // catches that race; otherwise stay silent.
    try {
      const report = await fetchPaymentStatus(membership.id, true);
      if (report.activated) finishPaymentSuccess(await fetchMembership(membership.id));
    } catch {
      /* ignore */
    }
  }

  async function handleMockPay() {
    if (!membership || paying || confirming) return;
    setPaying(true);
    await resolvePayment(membership.id, {
      razorpay_payment_id: `pay_mock_${membership.id.slice(0, 8)}`,
      razorpay_order_id: order?.order_id ?? "",
      razorpay_signature: "mock_signature",
    });
  }

  async function handleRazorpay() {
    if (!membership || !order || !user || paying || confirming) return;
    setPaying(true);
    try {
      await loadRazorpay();
      openRazorpay({
        key: order.key_id ?? "",
        amount: order.amount,
        currency: order.currency,
        name: "Phahendra Babu Library Pass",
        description: `${membership.shift.name} · ${formatDate(membership.start_date ?? "")}`,
        order_id: order.order_id,
        prefill: { name: user.name, email: user.email, contact: user.phone },
        modal: { ondismiss: () => void handleDismiss() },
        handler: async (response) => {
          await resolvePayment(membership.id, response);
        },
        theme: { color: "#2563EB" },
      });
    } catch (err) {
      setPaying(false);
      toast("Razorpay error", "error", apiErrorMessage(err));
    }
  }

  if (!user) {
    return (
      <div className="section-pad py-24">
        <GlassCard className="mx-auto max-w-lg p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent text-white shadow-glow">
            <Wallet className="h-7 w-7" />
          </span>
          <h2 className="h-display mt-5 text-2xl font-bold">Sign in to book a seat</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            You need an account to reserve a seat and pay for your shift pass.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => router.push("/login?next=/membership")}>Sign in</Button>
            <Button variant="ghost" onClick={() => router.push("/register")}>Create account</Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  const stepIndex = step === "done" ? STEP_ORDER.length : STEP_ORDER.indexOf(step);

  return (
    <div className={cn("section-pad py-16 sm:py-24", step === "plan" && "pb-32 lg:pb-24")}>
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <Badge variant="accent">Pass planner</Badge>
          <h1 className="h-display mt-3 text-3xl font-bold sm:text-4xl">Book your study seat</h1>
          <p className="mx-auto mt-2 max-w-xl text-slate-500 dark:text-slate-400">
            Pick a time block, choose how long (1–12 months), select your seat, and pay with UPI or in cash at the library.
          </p>
        </header>

        <div className="mb-10">
          <Stepper current={stepIndex} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {step === "plan" && (
              <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
                <div className="space-y-6">
                  {/* Time block */}
                  <GlassCard hover={false} className="overflow-hidden">
                    <div className="flex items-center gap-3 border-b border-slate-200/70 px-6 py-4 dark:border-white/10">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600/10 text-sm font-bold text-primary-700 dark:bg-white/10 dark:text-primary-300">
                        1
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="h-display text-base font-semibold">Choose your time block</h2>
                        <p className="text-xs text-slate-500">
                          One price per block, billed monthly. Lock the same seat every day.
                        </p>
                      </div>
                      <Clock className="h-5 w-5 shrink-0 text-slate-300 dark:text-white/20" />
                    </div>
                    <div className="p-5">
                      {sortedShifts.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          No time blocks available right now. Refresh the page to try again.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {sortedShifts.map((shift, i) => (
                            <ShiftCard
                              key={shift.id}
                              shift={shift}
                              index={i}
                              selected={selectedShift?.id === shift.id}
                              onSelect={setSelectedShift}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </GlassCard>

                  {/* Duration */}
                  <GlassCard hover={false} className="overflow-hidden">
                    <div className="flex items-center gap-3 border-b border-slate-200/70 px-6 py-4 dark:border-white/10">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600/10 text-sm font-bold text-primary-700 dark:bg-white/10 dark:text-primary-300">
                        2
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="h-display text-base font-semibold">Choose your duration</h2>
                        <p className="text-xs text-slate-500">
                          The block price is per month — 6 months = 6 × the monthly price.
                        </p>
                      </div>
                      <Badge variant="primary">{durationMonths} month{durationMonths === 1 ? "" : "s"}</Badge>
                    </div>
                    <div className="p-5">
                      <DurationPicker months={12} selected={durationMonths} onSelect={setDurationMonths} />
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primary-600/5 px-4 py-3 text-sm dark:bg-white/5">
                        <span className="text-slate-500">
                          {formatINR(price ?? 0)}<span className="text-slate-400">/month</span>
                        </span>
                        <span className="font-semibold text-secondary-900 dark:text-white">
                          Total · {formatINR(total ?? 0)}
                          <span className="font-normal text-slate-400">
                            {" "}for {durationMonths} month{durationMonths === 1 ? "" : "s"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* Booking summary */}
                <aside className="lg:sticky lg:top-24">
                  <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-soft-lg dark:border-white/10 dark:bg-secondary-900/60">
                    <div className="flex items-center gap-2.5 bg-gradient-to-r from-primary-600 via-primary-700 to-accent px-5 py-4">
                      <Wallet className="h-4 w-4 text-white" />
                      <p className="text-sm font-bold text-white">Booking summary</p>
                      <span className="ml-auto flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                        LIVE
                      </span>
                    </div>

                    {selectedShift ? (
                      <>
                        <div className="p-5">
                          <dl className="space-y-3">
                            <Row label="Time block" value={selectedShift.name} />
                            <Row label="Duration" value={`${durationMonths} month${durationMonths === 1 ? "" : "s"}`} />
                            <Row label="Valid until" value={formatDate(bookingRange().end)} />
                          </dl>

                          <div className="my-5 border-t border-dashed border-slate-300/80 dark:border-white/15" />

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Monthly price</span>
                            <span className="font-semibold text-secondary-900 dark:text-white">{formatINR(price ?? 0)}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-slate-500">Months</span>
                            <span className="font-semibold text-secondary-900 dark:text-white">× {durationMonths}</span>
                          </div>

                          <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary-600/10 to-accent/10 px-4 py-3.5 dark:from-primary-500/15 dark:to-accent/15">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-semibold text-secondary-900 dark:text-white">Total payable</span>
                              <span className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                                {formatINR(total ?? 0)}
                              </span>
                            </div>
                            <p className="mt-0.5 text-right text-[11px] text-slate-400">
                              ≈ {formatINR(price ?? 0)} / month
                            </p>
                          </div>

                          <Button size="lg" className="mt-5 hidden w-full lg:flex" onClick={handleContinue}>
                            Continue to seat selection
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="border-t border-slate-200/70 bg-slate-50/60 px-5 py-4 dark:border-white/10 dark:bg-white/5">
                          <ul className="space-y-2 text-[11px] text-slate-500">
                            <li className="flex items-center gap-2">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Secure UPI payments via Razorpay
                            </li>
                            <li className="flex items-center gap-2">
                              <Zap className="h-3.5 w-3.5 text-amber-500" /> Instant confirmation
                            </li>
                            <li className="flex items-center gap-2">
                              <Lock className="h-3.5 w-3.5 text-primary-500" /> Change or cancel anytime
                            </li>
                          </ul>
                        </div>
                      </>
                    ) : (
                      <div className="p-5 text-sm text-slate-500">
                        Pick a time block and duration to see your total.
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            )}

            {step === "seat" && (
              <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
                <div className="space-y-6">
                  <GlassCard hover={false} className="overflow-hidden">
                    <div className="flex items-center gap-3 border-b border-slate-200/70 px-6 py-4 dark:border-white/10">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600/10 text-sm font-bold text-primary-700 dark:bg-white/10 dark:text-primary-300">
                        3
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="h-display text-base font-semibold">Pick your seat</h2>
                        <p className="truncate text-xs text-slate-500">
                          {selectedShift?.name} · {durationMonths} month{durationMonths === 1 ? "" : "s"} · {formatINR(total ?? 0)}
                        </p>
                      </div>
                      <Badge variant="success">{seats.filter((s) => s.available).length} free</Badge>
                    </div>

                    <div className="p-4 sm:p-6">
                      {seatsLoading && seats.length === 0 ? (
                        <div className="skeleton h-[420px] w-full rounded-2xl sm:h-[520px]" />
                      ) : mapSeats.length === 0 ? (
                        <p className="py-12 text-center text-sm text-slate-400">
                          No seats in this reading hall right now.
                        </p>
                      ) : (
                        <LibraryLayout
                          seats={fpSeats}
                          selectedNumber={selectedSeat?.seat_number ?? null}
                          onPick={(number) => {
                            const seat = seats.find((s) => s.seat_number === number);
                            if (seat) handleToggleSeat(seat);
                          }}
                        />
                      )}
                    </div>
                  </GlassCard>
                </div>

                {/* Selection panel */}
                <aside className="lg:sticky lg:top-24">
                  <HoldTimer expiresAt={holdExpiresAt}>
                    {(holdRemaining) => (
                      <Sidebar
                        user={user}
                        seat={selectedSeat}
                        shift={selectedShift}
                        durationMonths={durationMonths}
                        total={total}
                        holdRemaining={holdRemaining}
                        loading={loading}
                        onBook={handleCreateMembership}
                        onCancel={() => {
                          setSelectedSeat(null);
                          setHoldExpiresAt(null);
                        }}
                        onBack={() => setStep("plan")}
                        onAutoToggle={() => {
                          setSelectedSeat(null);
                          setHoldExpiresAt(null);
                        }}
                      />
                    )}
                  </HoldTimer>
                </aside>
              </div>
            )}

            {step === "pay" && membership && (
              <div className="mx-auto max-w-lg">
                <GlassCard hover={false} className="p-8">
                  <div className="flex items-center justify-between">
                    <Badge variant="accent">Pending payment</Badge>
                    <span className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {formatINR(parseFloat(membership.amount))}
                    </span>
                  </div>
                  <dl className="mt-6 space-y-3 text-sm">
                    <Row label="Time block" value={membership.shift.name} />
                    <Row label="Duration" value={`${membership.duration_months} month${membership.duration_months === 1 ? "" : "s"}`} />
                    <Row label="Valid until" value={formatDate(membership.end_date ?? "")} />
                    <Row label="Seat" value={membership.seat?.seat_number ?? "To be assigned"} />
                  </dl>
                  <div className="mt-8 flex flex-col gap-3">
                    <Button size="lg" onClick={handleStartPayment} loading={orderLoading}>
                      <CreditCard className="h-5 w-5" /> Pay via UPI
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-x-0 -top-2.5 flex justify-center">
                        <span className="bg-white px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:bg-secondary-900">
                          or
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleCashRequest}
                        loading={cashLoading}
                      >
                        <Banknote className="h-5 w-5" /> Pay by Cash
                      </Button>
                    </div>

                    <p className="rounded-xl border border-amber-300/50 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                      <Hourglass className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
                      Choose <span className="font-semibold">Pay by Cash</span> and your seat is held for 3 days.
                      Visit the library desk to pay and the admin approves it — no card or UPI needed.
                    </p>

                    <Button variant="ghost" onClick={() => setStep("seat")}>Change selection</Button>
                  </div>
                </GlassCard>
              </div>
            )}

            {step === "done" && membership && (
              <GlassCard hover={false} className="mx-auto max-w-lg p-10 text-center">
                {membership.payment_method === "cash" && membership.status === "pending_cash" ? (
                  <>
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", damping: 14, stiffness: 240 }}
                      className="relative mx-auto h-20 w-20"
                    >
                      <span className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl" />
                      <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-amber-500 text-white shadow-glow">
                        <Hourglass className="h-10 w-10" />
                      </span>
                    </motion.div>
                    <h2 className="h-display mt-6 text-2xl font-bold">Cash request submitted!</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {membership.shift.name} · {membership.duration_months} month{membership.duration_months === 1 ? "" : "s"}
                      {" "}· {formatINR(parseFloat(membership.amount))}
                    </p>
                    <p className="mt-1 text-sm">
                      Seat:{" "}
                      <span className="font-semibold text-secondary-900 dark:text-white">
                        {membership.seat?.seat_number ?? "To be assigned"}
                      </span>
                    </p>
                    <div className="mt-6 rounded-2xl border border-amber-300/50 bg-amber-500/10 px-5 py-4 text-left text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                      <p className="flex items-center gap-2 font-semibold">
                        <Hourglass className="h-4 w-4 shrink-0" /> Your seat is held for 3 days
                      </p>
                      <ul className="mt-2 list-inside list-disc space-y-1">
                        <li>Visit the library desk and pay {formatINR(parseFloat(membership.amount))} in cash within 3 days.</li>
                        <li>Once the admin approves your request, your pass activates automatically.</li>
                        <li>If not approved within 3 days, the request expires and your seat is released.</li>
                      </ul>
                    </div>
                    <div className="mt-8 flex justify-center gap-3">
                      <Button onClick={() => router.push("/dashboard")}>Track request</Button>
                      <Button variant="ghost" onClick={() => router.push("/")}>Back home</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", damping: 14, stiffness: 240 }}
                      className="relative mx-auto h-20 w-20"
                    >
                      <span className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl" />
                      <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-glow">
                        <CheckCircle2 className="h-10 w-10" />
                      </span>
                    </motion.div>
                    <h2 className="h-display mt-6 text-2xl font-bold">Pass activated!</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {membership.shift.name} · {membership.duration_months} month{membership.duration_months === 1 ? "" : "s"} · until {formatDate(membership.end_date ?? "")}
                    </p>
                    <p className="mt-1 text-sm">
                      Seat:{" "}
                      <span className="font-semibold text-secondary-900 dark:text-white">
                        {membership.seat?.seat_number ?? "To be assigned"}
                      </span>
                    </p>
                    <div className="mt-8 flex justify-center gap-3">
                      <Button onClick={() => router.push("/dashboard")}>Go to dashboard</Button>
                      <Button variant="ghost" onClick={() => router.push("/")}>Back home</Button>
                    </div>
                  </>
                )}
              </GlassCard>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile sticky CTA */}
      {step === "plan" && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 bg-white/90 p-4 backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-secondary-900/90">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">Total</p>
              <p className="truncate text-lg font-bold text-secondary-900 dark:text-white">
                {formatINR(total ?? 0)}
              </p>
            </div>
            <Button onClick={handleContinue} disabled={!selectedShift}>
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Payment modal */}
      <Modal
        open={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Complete your payment"
        description={order?.requires_remote ? "You'll be redirected to Razorpay to pay with UPI." : "Mock payment mode — the Razorpay keys aren't configured, so payment is simulated."}
      >
        <div className="space-y-4">
          {confirming ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center" role="status" aria-live="polite">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              <p className="text-sm font-semibold text-secondary-900 dark:text-white">
                Confirming your payment…
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This usually takes a few seconds. Please keep this window open.
              </p>
            </div>
          ) : order?.requires_remote ? (
            <>
              <Button size="lg" className="w-full" onClick={handleRazorpay} loading={paying}>
                <MapPin className="h-5 w-5" /> Pay {order.currency} {order.amount / 100}
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-amber-300/50 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
                Dev mode: <span className="font-mono">ALLOW_MOCK_PAYMENTS</span> is on because Razorpay keys are not set.
                Clicking below marks the payment as paid.
              </div>
              <Button size="lg" className="w-full" onClick={handleMockPay} loading={paying}>
                <CreditCard className="h-5 w-5" /> Complete mock payment
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setPayModalOpen(false)}
            disabled={paying || confirming}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
