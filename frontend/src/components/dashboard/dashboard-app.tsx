"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { changePassword, fetchMyMemberships, fetchProfile, updateProfile } from "@/lib/api-fns";
import { apiErrorMessage } from "@/lib/api";
import type { Membership } from "@/lib/types";
import { formatDate, formatINR, formatTime } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { CalendarDays, Camera, CheckCircle2, Clock, KeyRound, LogOut, ShieldCheck, Ticket, User2, Wallet } from "lucide-react";

const STATUS_VARIANT: Record<Membership["status"], "success" | "warning" | "neutral" | "danger"> = {
  active: "success",
  pending_payment: "warning",
  pending_cash: "warning",
  expired: "neutral",
  cancelled: "danger",
};

export function DashboardApp() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Membership | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const [ms, profile] = await Promise.all([fetchMyMemberships(), fetchProfile()]);
      setMemberships(ms);
      setUser(profile);
      setActive(ms.find((m) => m.status === "active") ?? ms[0] ?? null);
    } catch (err) {
      toast("Could not load your account", "error", apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [setUser, toast]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      toast("Password changed", "success");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      toast("Could not change password", "error", apiErrorMessage(err));
    } finally {
      setPwLoading(false);
    }
  }

  async function handlePhotoUpload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Invalid file", "error", "Please choose an image file.");
      return;
    }
    setPhotoLoading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const updated = await updateProfile(formData);
      setUser(updated);
      toast("Photo updated", "success");
    } catch (err) {
      toast("Could not update photo", "error", apiErrorMessage(err));
    } finally {
      setPhotoLoading(false);
    }
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="section-pad py-24">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-8 w-56 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
          <div className="h-40 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10" />
          <div className="h-40 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="section-pad py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="h-display text-3xl font-bold sm:text-4xl">My membership</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Welcome back, {user?.name ?? "student"}.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push("/membership")}>
              <Ticket className="h-4 w-4" /> New membership
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {active?.status === "pending_cash" && (
              <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-300/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">Cash request pending — seat held</p>
                  <p className="mt-0.5 text-xs opacity-90">
                    Pay {formatINR(Number(active.amount))} in cash at the library desk to confirm.
                    The request auto-expires if not approved within 3 days.
                  </p>
                </div>
              </div>
            )}
            {active?.status === "active" && active.payment_method === "cash" && (
              <div className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-300/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">Seat booked!</p>
                  <p className="mt-0.5 text-xs opacity-90">
                    The library confirmed your cash payment. Seat {active.seat ? `#${active.seat.seat_number}` : "assigned"} is
                    active until {formatDate(active.end_date ?? "")}.
                  </p>
                </div>
              </div>
            )}
            {active ? <ActiveMembershipCard m={active} onRenew={() => router.push("/membership")} /> : <EmptyMembershipCard onBuy={() => router.push("/membership")} />}

            {memberships.length > 0 && (
              <GlassCard className="mt-6 p-6">
                <h2 className="h-display mb-4 text-lg font-semibold">Membership history</h2>
                <div className="space-y-3">
                  {memberships.map((m) => (
                    <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-secondary-900 dark:text-white">{m.shift.name}</span>
                          <Badge variant={STATUS_VARIANT[m.status]}>{m.status.replace("_", " ")}</Badge>
                          {m.payment_method === "cash" && (
                            <Badge variant="warning">Cash</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(m.start_date ?? "")} · seat {m.seat?.seat_number ?? "—"}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold text-secondary-900 dark:text-white">₹{m.amount}</p>
                        <p className="text-xs text-slate-500">
                          {m.start_date ? `${formatDate(m.start_date)} → ${formatDate(m.end_date!)}` : "Not started"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>

          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="h-display mb-4 flex items-center gap-2 text-lg font-semibold">
                <User2 className="h-4 w-4 text-slate-400" /> Profile
              </h2>
              <div className="mb-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-slate-400 transition-colors hover:border-primary-400 dark:border-white/10 dark:bg-white/5"
                >
                  {user?.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- API-served avatar, host varies by deployment
                    <img src={user.photo_url} alt="Profile" width={80} height={80} decoding="async" className="h-full w-full object-cover" />
                  ) : (
                    <User2 className="h-8 w-8" />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity hover:opacity-100">
                    <Camera className="h-5 w-5" />
                  </span>
                </button>
                <div className="text-sm">
                  <p className="font-medium text-secondary-900 dark:text-white">{user?.name ?? "—"}</p>
                  <p className="mt-0.5 text-xs text-slate-400">Click photo to change</p>
                  {photoLoading && <p className="mt-1 text-xs font-medium text-primary-600">Uploading…</p>}
                </div>
              </div>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
              />
              <dl className="space-y-3 text-sm">
                <Row label="Name" value={user?.name ?? "—"} />
                <Row label="Email" value={user?.email ?? "—"} />
                <Row label="Phone" value={user?.phone ?? "—"} />
                <Row label="Gender" value={user?.gender ?? "—"} />
                <Row label="Aadhaar" value={user?.aadhar_document ? "Uploaded" : "Not uploaded"} />
                <Row label="Class" value={user?.class_name || "—"} />
                <Row label="Purpose" value={user?.purpose || "—"} />
                <Row label="Wi-Fi device" value={user?.wifi_device_name ?? "—"} />
                <Row label="Status" value={user?.is_email_verified ? "Verified" : "Unverified"} />
              </dl>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="h-display mb-4 flex items-center gap-2 text-lg font-semibold">
                <KeyRound className="h-4 w-4 text-slate-400" /> Change password
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-3" noValidate>
                <Input
                  label="Current password"
                  type="password"
                  name="old_password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <Input
                  label="New password"
                  type="password"
                  name="new_password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="8+ chars, A-Z, a-z, 0-9"
                />
                <Button type="submit" className="w-full" loading={pwLoading}>Update password</Button>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-secondary-900 dark:text-white">{value}</dd>
    </div>
  );
}

function ActiveMembershipCard({ m, onRenew }: { m: Membership; onRenew: () => void }) {
  const days = m.days_left ?? 0;
  return (
    <GlassCard className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent text-white shadow-glow">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-slate-500">Current membership</p>
              <p className="h-display text-xl font-bold text-secondary-900 dark:text-white">
                {m.shift.name} shift
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            {formatDate(m.start_date ?? "")} · {m.payment_method === "cash" ? "Booked · Cash" : "Paid"}{" "}
            <span className="font-semibold text-secondary-900 dark:text-white">₹{m.amount}</span>
          </p>
        </div>
        {m.status === "active" ? (
          <Badge variant={days <= 7 ? "warning" : "success"}>
            <CheckCircle2 className="h-3.5 w-3.5" /> {days > 0 ? `${days} day${days === 1 ? "" : "s"} left` : "Ending today"}
          </Badge>
        ) : (
          <Badge variant={STATUS_VARIANT[m.status]}>{m.status.replace("_", " ")}</Badge>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <MiniStat icon={<CalendarDays className="h-4 w-4" />} label="Valid from" value={m.start_date ? formatDate(m.start_date) : "—"} />
        <MiniStat icon={<Clock className="h-4 w-4" />} label="Shift hours" value={`${formatTime(m.shift.start_time)} – ${formatTime(m.shift.end_time)}`} />
        <MiniStat icon={<ShieldCheck className="h-4 w-4" />} label="Seat" value={m.seat ? `${m.seat.seat_number} (${m.seat.section})` : "To be assigned"} />
      </div>

      {m.status === "active" && (
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onRenew}>Renew / extend</Button>
        </div>
      )}
    </GlassCard>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        {icon} {label}
      </div>
      <p className="mt-1.5 text-sm font-semibold text-secondary-900 dark:text-white">{value}</p>
    </div>
  );
}

function EmptyMembershipCard({ onBuy }: { onBuy: () => void }) {
  return (
    <GlassCard className="p-8 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent text-white shadow-glow">
        <Ticket className="h-7 w-7" />
      </span>
      <h2 className="h-display mt-5 text-xl font-bold">You don&apos;t have a membership yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        Pick a time block, choose a seat and pay in a couple of minutes.
      </p>
      <Button size="lg" className="mt-6" onClick={onBuy}>Get started</Button>
    </GlassCard>
  );
}
