"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollTop}
          aria-label="Scroll to top"
          title="Back to top"
          initial={{ opacity: 0, y: 24, scale: 0.6, rotate: -8 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, y: 24, scale: 0.6, rotate: 8 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          whileHover={{ scale: 1.08, rotate: -4, y: -3 }}
          whileTap={{ scale: 0.9 }}
          className="group fixed bottom-6 right-6 z-50"
        >
          <motion.span
            className="relative flex h-12 w-9 items-center justify-center overflow-hidden rounded-r-lg rounded-l-md bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 text-white shadow-glow ring-1 ring-white/20 transition-shadow group-hover:shadow-2xl"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          >
            <span className="absolute inset-y-0 left-0 w-1.5 rounded-l-md bg-black/25" />
            <span className="absolute inset-y-0 right-0 w-px bg-white/30" />
            <span className="absolute inset-y-1.5 left-1/2 w-px -translate-x-1/2 bg-white/25" />
            <span className="absolute right-[3px] top-1 bottom-1 w-[2px] space-y-0.5 rounded-sm bg-white/40">
              <span className="block h-1 w-full rounded bg-white/40" />
              <span className="block h-1 w-full rounded bg-white/40" />
              <span className="block h-1 w-full rounded bg-white/40" />
            </span>
            <ArrowUp className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </motion.span>
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-r-lg rounded-l-md bg-primary-400/40 blur-md"
            animate={{ opacity: [0.25, 0.6, 0.25] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
