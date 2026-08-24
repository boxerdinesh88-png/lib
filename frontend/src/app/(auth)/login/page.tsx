"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage } from "@/lib/api";
import { safeNext } from "@/lib/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuthStore } from "@/store/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const redirected = searchParams.get("next");
    if (redirected) toast("Please sign in to continue", "info");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push(safeNext(searchParams.get("next")));
      router.refresh();
    } catch (err) {
      setError(apiErrorMessage(err, "Sign in failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="h-display text-2xl font-bold text-secondary-900 dark:text-white">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Sign in to manage your membership and seat.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <Input
          label="Email address"
          type="email"
          name="email"
          icon={<Mail className="h-4 w-4" />}
          placeholder="you@college.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          icon={<Lock className="h-4 w-4" />}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          error={error}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-slate-400 transition-colors hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        <div className="flex items-center justify-end text-sm">
          <Link href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        New to the library?{" "}
        <Link href="/register" prefetch className="font-semibold text-primary-600 hover:underline dark:text-primary-400">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
