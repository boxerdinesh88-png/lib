"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password/", { email });
      setSent(true);
      toast("Reset link sent", "success", "Check your inbox for a 6-digit code.");
    } catch {
      setSent(true);
      toast("Reset link sent", "success", "If that email exists, you'll receive a reset code.");
    } finally {
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
      <h1 className="h-display text-2xl font-bold text-secondary-900 dark:text-white">Forgot your password?</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Enter the email linked to your account and we&apos;ll send you a reset code.
      </p>

      {sent ? (
        <div className="mt-8 rounded-2xl border border-accent/30 bg-accent/10 p-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent-600 dark:text-accent-400">
            <Send className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-medium text-secondary-900 dark:text-white">Check your inbox</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            We sent a reset code to <span className="font-semibold">{email}</span>.
          </p>
          <Button
            size="lg"
            className="mt-6 w-full"
            onClick={() =>
              router.push(
                `/verify-email?email=${encodeURIComponent(email)}&purpose=reset_password`
              )
            }
          >
            Enter the reset code
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <Input
            label="Email address"
            type="email"
            name="email"
            icon={<Mail className="h-4 w-4" />}
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            error={error}
            required
            autoComplete="email"
          />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Send reset code
          </Button>
        </form>
      )}
    </div>
  );
}
