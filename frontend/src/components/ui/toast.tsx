"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (title: string, kind?: ToastKind, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (title: string, kind: ToastKind = "success", message?: string) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, kind, title, message }]);
      window.setTimeout(() => remove(id), 4200);
    },
    [remove]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: push,
      success: (t, m) => push(t, "success", m),
      error: (t, m) => push(t, "error", m),
      info: (t, m) => push(t, "info", m),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex w-[min(92vw,380px)] flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: "spring", damping: 24, stiffness: 320 }}
              className="glass-strong flex items-start gap-3 rounded-2xl p-4 shadow-soft-lg"
            >
              {t.kind === "success" && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />}
              {t.kind === "error" && <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />}
              {t.kind === "info" && <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-secondary-900 dark:text-white">{t.title}</p>
                {t.message && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t.message}</p>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
