"use client";

import { ToastProvider } from "@/components/ui/toast";

import { ThemeProvider } from "../components/theme-provider";

/**
 * Client-side providers. <html>/<body> and fonts live in the root layout
 * (server component) — rendering them here would break SSR hydration.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
