"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

export function Modal({ open, onClose, title, description, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-secondary-950/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className={cn("glass-strong relative w-full rounded-3xl p-6 sm:p-8", sizes[size])}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-500/10 hover:text-secondary-900 dark:hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            {title && <h2 className="h-display text-xl font-bold sm:text-2xl">{title}</h2>}
            {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
            <div className="mt-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
