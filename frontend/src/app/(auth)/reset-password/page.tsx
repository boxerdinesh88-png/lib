"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock } from "lucide-react";
import { api, apiErrorCode, apiErrorMessage } from "@/lib/api";

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const email = searchParams.get("email") ?? "";
  const code = searchParams.get("code") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [codeInvalid, setCodeInvalid] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !code) {
      setError("This link is incomplete. Please restart the reset process.");
      return;
    }
    if (!PASSWORD_RE.test(password)) {
      setError("Password must be 8+ characters with uppercase, lowercase and a number.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setCodeInvalid(false);
    try {
      await api.post("/auth/reset-password/", { email, code, new_password: password });
      toast("Password reset", "success", "You can now sign in with your new password.");
      router.push("/login");
    } catch (err) {
      if (apiErrorCode(err) === "invalid_otp") {
        setCodeInvalid(true);
        setError("This code is invalid or has expired. Please request a new one.");
      } else {
        setError(apiErrorMessage(err, "Reset failed. Please try again."));
      }
      setLoading(false);
    }
  }

  return (
    <div>
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent text-white shadow-glow">
        <KeyRound className="h-7 w-7" />
      </span>
      <h1 className="h-display mt-6 text-center text-2xl font-bold text-secondary-900 dark:text-white">Set a new password</h1>
      <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
        {email ? (
          <>
            Creating a new password for{" "}
            <span className="font-semibold text-secondary-900 dark:text-white">{email}</span>
          </>
        ) : (
          "Enter a new password for your account."
        )}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <Input
          label="New password"
          type={show ? "text" : "password"}
          name="new_password"
          icon={<Lock className="h-4 w-4" />}
          placeholder="8+ chars, A-Z, a-z, 0-9"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
            setCodeInvalid(false);
          }}
          error={error}
          required
          autoComplete="new-password"
          trailing={
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="text-slate-400 transition-colors hover:text-slate-600"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
        <Input
          label="Confirm new password"
          type={show ? "text" : "password"}
          name="confirm_password"
          icon={<Lock className="h-4 w-4" />}
          placeholder="Re-enter your new password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            setError("");
            setCodeInvalid(false);
          }}
          error={password && confirm && password !== confirm ? "Passwords do not match." : undefined}
          required
          autoComplete="new-password"
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Reset password
        </Button>
      </form>
      {codeInvalid && (
        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          Stuck?{" "}
          <Link href="/forgot-password" className="font-semibold text-primary-600 hover:underline dark:text-primary-400">
            Request a new code
          </Link>
        </p>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl bg-slate-100 dark:bg-white/5" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
