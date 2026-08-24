"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface RequireAuthProps {
  children: React.ReactNode;
  role?: "admin" | "member";
}

export function RequireAuth({ children, role }: RequireAuthProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isHydrated) return;
    if (!getAccessToken()) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (role && user && user.role !== role) {
      router.replace(role === "admin" ? "/dashboard" : "/admin");
    }
  }, [mounted, isHydrated, user, role, router]);

  if (!mounted || !isHydrated) return null;
  if (!getAccessToken()) return null;
  if (role && user && user.role !== role) return null;
  return <>{children}</>;
}
