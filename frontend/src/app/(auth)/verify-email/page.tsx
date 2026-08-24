"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { OtpInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Mail, RefreshCw } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { safeNext } from "@/lib/navigation";
import type { AuthResponse } from "@/lib/types";
import { useAuthStore } from "@/store/auth";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const authUser = useAuthStore((s) => s.user);

  const email = useMemo(
    () => searchParams.get("email") ?? authUser?.email ?? "",
    [searchParams, authUser]
  );
  const purpose = useMemo(
    () => (searchParams.get("purpose") === "reset_password" ? "reset_password" : "verify_email"),
    [searchParams]
  );
  const isReset = purpose === "reset_password";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(30);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn, loading]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length < 6) {
      setError("Please enter all 6 digits");
      return;
    }
    setError("");
    setLoading(true);
    if (isReset) {
      router.push(`/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
      return;
    }
    try {
      const { data } = await api.post<AuthResponse>("/auth/otp/verify/", { email, code, purpose });
      useAuthStore.getState().setSession(data);
      toast("Email verified", "success", "You're signed in — pick your seat and continue.");
      router.push(safeNext(searchParams.get("next"), "/membership"));
    } catch (err) {
      setError(apiErrorMessage(err));
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) {
      setError("We need your email address to send a code.");
      return;
    }
    setResending(true);
    try {
      if (isReset) {
        await api.post("/auth/forgot-password/", { email });
      } else {
        await api.post("/auth/otp/request/", { email });
      }
      toast("Code resent", "success", "A fresh 6-digit code is on its way.");
      setResendIn(30);
    } catch (err) {
      toast("Could not resend", "error", apiErrorMessage(err));
    } finally {
      setResending(false);
    }
  }

  return (
    <div>
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent text-white shadow-glow">
        <Mail className="h-7 w-7" />
      </span>
      <h1 className="h-display mt-6 text-center text-2xl font-bold text-secondary-900 dark:text-white">
        {isReset ? "Reset your password" : "Verify your email"}
      </h1>
      <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
        {email ? (
          <>
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-secondary-900 dark:text-white">{email}</span>
          </>
        ) : (
          "Sign in first, then we can send a code to your inbox."
        )}
      </p>

      <form onSubmit={handleVerify} className="mt-8">
        <OtpInput length={6} value={code} onChange={(v) => { setCode(v); setError(""); }} autoFocus disabled={loading} />
        {error && <p className="mt-3 text-center text-xs font-medium text-rose-500">{error}</p>}

        <Button type="submit" size="lg" className="mt-8 w-full" loading={loading} disabled={!email}>
          Verify & continue
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        Didn&apos;t receive it?
        <button
          onClick={handleResend}
          disabled={resendIn > 0 || resending}
          className="inline-flex items-center gap-1.5 font-semibold text-primary-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 dark:text-primary-400"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl bg-slate-100 dark:bg-white/5" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
