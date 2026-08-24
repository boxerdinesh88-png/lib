"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/components/ui/toast";
import {
  adminExportMemberships,
  adminUpdateMembership,
  fetchAdminMembers,
  fetchAdminMemberships,
  fetchAdminSeats,
  fetchAdminSummary,
  fetchRecentMemberships,
  fetchRevenue,
} from "@/lib/api-fns";
import { apiErrorMessage } from "@/lib/api";
import type { AdminSummary, MemberAdminItem, MembershipAdminItem, RecentMembership, Seat } from "@/lib/types";
import { formatINR, formatDate, relativeTime } from "@/lib/utils";
import { CalendarClock, Download, FileText, Globe, Users, Wallet, Wifi } from "lucide-react";

const RevenueChart = dynamic(() => import("./revenue-chart").then((m) => m.RevenueChart), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-slate-200/70 dark:bg-white/5" />,
});

export function AdminApp() {
  const { toast } = useToast();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [revenue, setRevenue] = useState<{ month: string; revenue: number }[]>([]);
  const [recent, setRecent] = useState<RecentMembership[]>([]);
  const [members, setMembers] = useState<MemberAdminItem[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberships, setMemberships] = useState<MembershipAdminItem[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [aadharView, setAadharView] = useState<MembershipAdminItem["member"] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [sum, rev, rec] = await Promise.all([
        fetchAdminSummary(),
        fetchRevenue(),
        fetchRecentMemberships(),
      ]);
      setSummary(sum);
      setRevenue(rev);
      setRecent(rec);
    } catch (err) {
      toast("Could not load dashboard", "error", apiErrorMessage(err));
    }
  }, [toast]);

  const loadMemberships = useCallback(async () => {
    try {
      const [ms, st, mem] = await Promise.all([
        fetchAdminMemberships(statusFilter ? { status: statusFilter } : {}),
        fetchAdminSeats(),
        fetchAdminMembers(memberSearch ? { search: memberSearch } : {}),
      ]);
      setMemberships(ms);
      setSeats(st);
      setMembers(mem);
    } catch (err) {
      toast("Could not load memberships", "error", apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, memberSearch, toast]);

  useEffect(() => {
    load();
    loadMemberships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Only reload when the filter actually changes; the mount-time load above
    // already fetches the unfiltered list, so this avoids a duplicate request.
    if (statusFilter === "") return;
    loadMemberships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    if (memberSearch === "") return;
    const t = setTimeout(() => loadMemberships(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberSearch]);

  async function handleSetStatus(m: MembershipAdminItem, status: string) {
    try {
      await adminUpdateMembership(m.id, { status });
      toast("Membership updated", "success", `${m.member_name} → ${status}`);
      load();
      loadMemberships();
    } catch (err) {
      toast("Update failed", "error", apiErrorMessage(err));
    }
  }

  async function handleExport() {
    try {
      const blob = await adminExportMemberships();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "memberships.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast("Export failed", "error", apiErrorMessage(err));
    }
  }

  const chartData = useMemo(
    () => revenue.map((r) => ({ name: r.month, revenue: r.revenue })),
    [revenue]
  );

  if (loading && !summary) {
    return (
      <div className="section-pad py-24">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-pad py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="h-display text-3xl font-bold sm:text-4xl">Admin dashboard</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Library overview, occupancy and membership management.
            </p>
          </div>
          <Button variant="ghost" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={<Users className="h-5 w-5" />} label="Total members" value={String(summary.total_members)} />
            <StatCard icon={<Wallet className="h-5 w-5" />} label="Revenue (month)" value={formatINR(Number(summary.revenue.month))} accent />
            <StatCard icon={<CalendarClock className="h-5 w-5" />} label="Active memberships" value={String(summary.active_memberships)} />
            <StatCard label="Expiring in 7 days" value={String(summary.expiring_soon)} />
          </div>
        )}

        {summary && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Occupancy */}
            <GlassCard className="p-6">
              <h2 className="h-display mb-4 text-lg font-semibold">Seat occupancy</h2>
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-secondary-900 dark:text-white">{summary.seats.occupied}</p>
                  <p className="text-xs text-slate-500">of {summary.seats.total} seats occupied</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-emerald-500">{summary.seats.free} free</p>
                </div>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-600 to-accent"
                  style={{ width: `${summary.seats.total ? (summary.seats.occupied / summary.seats.total) * 100 : 0}%` }}
                />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                {(["male", "female", "common"] as const).map((s) => (
                  <div key={s} className="rounded-2xl border border-slate-200 p-3 dark:border-white/10">
                    <p className="text-lg font-bold capitalize text-secondary-900 dark:text-white">{s}</p>
                    <p className="text-xs text-slate-500">
                      {summary.seats[s].occupied}/{summary.seats[s].total} occupied
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Revenue chart */}
            <GlassCard className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="h-display text-lg font-semibold">Revenue (12 months)</h2>
                <span className="text-sm font-bold text-secondary-900 dark:text-white">
                  {formatINR(Number(summary.revenue.total))} total
                </span>
              </div>
              <div className="h-52">
                <RevenueChart data={chartData} />
              </div>
            </GlassCard>
          </div>
        )}

        {/* Recent memberships */}
        {recent.length > 0 && (
          <GlassCard className="mt-6 p-6">
            <h2 className="h-display mb-4 text-lg font-semibold">Recent memberships</h2>
            <div className="divide-y divide-slate-200 dark:divide-white/10">
              {recent.map((m) => (
                <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-secondary-900 dark:text-white">{m.member_name}</p>
                    <p className="text-xs text-slate-500">{m.email} · {relativeTime(m.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-500">{m.shift}</span>
                    <span className="font-semibold">{formatINR(m.amount)}</span>
                    <MembershipStatusBadge status={m.status} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Memberships table */}
        <GlassCard className="mt-6 p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="h-display text-lg font-semibold">All memberships</h2>
            <div className="flex gap-2">
              {["", "active", "pending_payment", "pending_cash", "expired", "cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    statusFilter === s
                      ? "bg-primary-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"
                  }`}
                >
                  {s === "" ? "All" : s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {(summary?.pending_cash_requests ?? 0) > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-300/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                <Wallet className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold">
                  {summary?.pending_cash_requests} cash request{summary?.pending_cash_requests === 1 ? "" : "s"} awaiting approval
                </p>
                <p className="text-xs opacity-80">
                  Approve to book the seat. Requests auto-expire after 3 days.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => setStatusFilter("pending_cash")}
              >
                Review
              </Button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                  <th className="py-2 pr-4 font-medium">Member</th>
                  <th className="py-2 pr-4 font-medium">Shift</th>
                  <th className="py-2 pr-4 font-medium">Seat</th>
                  <th className="py-2 pr-4 font-medium">Valid</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">Payment</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {memberships.map((m) => (
                  <tr key={m.id}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">{m.member_name}</p>
                          <p className="text-xs text-slate-500">{m.member.email}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                            <Wifi className="h-3 w-3" />
                            {m.member.wifi_device_name || "—"}
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            <Globe className="h-3 w-3" />
                            {m.member.ip_address || "—"}
                          </p>
                        </div>
                        {m.member.aadhar_document_url && (
                          <button
                            onClick={() => setAadharView(m.member)}
                            className="ml-1 flex shrink-0 items-center gap-1 rounded-lg bg-primary-600/10 px-2 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-600/20 dark:text-primary-400"
                          >
                            <FileText className="h-3.5 w-3.5" /> Aadhaar
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{m.shift.name}</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{m.seat?.seat_number ?? "—"}</td>
                    <td className="py-3 pr-4 text-xs text-slate-500">
                      {m.start_date ? `${formatDate(m.start_date)} → ${formatDate(m.end_date!)}` : "—"}
                    </td>
                    <td className="py-3 pr-4 font-semibold">₹{m.amount}</td>
                    <td className="py-3 pr-4">
                      {m.payment_method === "cash" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-300">
                          Cash
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-600/10 px-2.5 py-0.5 text-xs font-semibold text-primary-600 dark:text-primary-300">
                          UPI
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4"><MembershipStatusBadge status={m.status} /></td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        {m.status !== "active" && (
                          <button onClick={() => handleSetStatus(m, "active")} className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20">
                            {m.status === "pending_cash" ? "Approve" : "Activate"}
                          </button>
                        )}
                        {m.status === "active" && (
                          <>
                            <button onClick={() => handleSetStatus(m, "expired")} className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-500/20">
                              Expire
                            </button>
                            <button onClick={() => handleSetStatus(m, "cancelled")} className="rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-500/20">
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {memberships.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">No memberships match this filter.</p>
            )}
          </div>
        </GlassCard>

        {/* Registered members */}
        <GlassCard className="mt-6 p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="h-display text-lg font-semibold">Registered members</h2>
              <p className="text-xs text-slate-500">IP address and Wi-Fi device captured at account creation.</p>
            </div>
            <input
              type="search"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search name or email…"
              className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary-500 dark:border-white/10 dark:bg-white/5"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                  <th className="py-2 pr-4 font-medium">Member</th>
                  <th className="py-2 pr-4 font-medium">Gender</th>
                  <th className="py-2 pr-4 font-medium">Wi-Fi device</th>
                  <th className="py-2 pr-4 font-medium">IP address</th>
                  <th className="py-2 pr-4 font-medium">Email verified</th>
                  <th className="py-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-secondary-900 dark:text-white">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-slate-600 capitalize dark:text-slate-300">{m.gender}</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <Wifi className="h-3.5 w-3.5 text-primary-500" />
                        {m.wifi_device_name || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-primary-500" />
                        {m.ip_address || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {m.is_email_verified ? (
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                          Verified
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-xs text-slate-500">{formatDate(m.date_joined)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {members.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">No members found.</p>
            )}
          </div>
        </GlassCard>

        {/* Seats */}
        <GlassCard className="mt-6 p-6">
          <h2 className="h-display mb-4 text-lg font-semibold">Seats</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {seats.map((seat) => (
              <div
                key={seat.id}
                className={`rounded-xl border p-3 text-center ${
                  seat.is_active
                    ? "border-slate-200 dark:border-white/10"
                    : "border-dashed border-slate-300 opacity-60 dark:border-white/20"
                }`}
              >
                <p className="text-sm font-bold text-secondary-900 dark:text-white">{seat.seat_number}</p>
                <p className="text-xs capitalize text-slate-500">{seat.section}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Aadhaar viewer */}
      {aadharView && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setAadharView(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Aadhaar document of ${aadharView.name}`}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl dark:bg-secondary-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="h-display text-lg font-bold text-secondary-900 dark:text-white">{aadharView.name}</h3>
                <p className="text-xs text-slate-500">{aadharView.email}</p>
              </div>
              <button
                onClick={() => setAadharView(null)}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"
              >
                Close
              </button>
            </div>
            {aadharView.aadhar_document_url?.match(/\.pdf($|\?)/i) ? (
              <div className="flex flex-col items-center gap-4 py-10">
                <FileText className="h-16 w-16 text-primary-600" />
                <p className="text-sm text-slate-500">This Aadhaar is a PDF.</p>
                <a
                  href={aadharView.aadhar_document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary h-11 px-6"
                >
                  Open PDF
                </a>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element -- API-served document, host varies by deployment */}
                <img
                  src={aadharView.aadhar_document_url ?? ""}
                  alt={`Aadhaar document of ${aadharView.name}`}
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon?: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <GlassCard className="p-5">
      {icon && (
        <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${accent ? "bg-accent/15 text-accent-600" : "bg-primary-600/10 text-primary-600"} dark:text-current`}>
          {icon}
        </span>
      )}
      <p className="text-2xl font-bold text-secondary-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </GlassCard>
  );
}

function MembershipStatusBadge({ status }: { status: MembershipAdminItem["status"] }) {
  const map: Record<string, "success" | "warning" | "neutral" | "danger"> = {
    active: "success",
    pending_payment: "warning",
    pending_cash: "warning",
    expired: "neutral",
    cancelled: "danger",
  };
  return <Badge variant={map[status]}>{status.replace("_", " ")}</Badge>;
}
