"use client";

import { motion } from "framer-motion";
import { Armchair, Coins, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const bullets = [
  { icon: Armchair, text: "Interactive 3D seat maps — pick the exact spot" },
  { icon: Coins, text: "Fixed ₹250–₹1000 slots. No surge pricing." },
  { icon: ShieldCheck, text: "Wallet, memberships & instant refunds" },
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary-700 via-secondary-900 to-[#042F2E] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="bg-grid absolute inset-0 opacity-30" />
        <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-primary-500/25 blur-[110px] animate-float" />
        <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-accent/25 blur-[110px] animate-float [animation-delay:2s]" />

        <div className="relative">
          <Link href="/" prefetch className="flex items-center gap-3">
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/95 shadow-glow">
              <Image src="/logo.webp" alt="Phahendra Babu Library logo" fill sizes="44px" className="object-cover" priority />
            </span>
            <span className="h-display text-2xl font-bold text-white">Phahendra Babu Library</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <h1 className="h-display max-w-md text-4xl font-bold leading-tight text-white">
            Your perfect study seat, <span className="bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent">reserved in 3D.</span>
          </h1>
          <p className="mt-4 max-w-md text-slate-300">
            Join 12,000+ focused learners who never fight for a seat again.
          </p>
          <ul className="mt-8 space-y-3">
            {bullets.map((b) => (
              <li key={b.text} className="flex items-center gap-3 text-sm text-slate-200">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-accent-400 backdrop-blur-md">
                  <b.icon className="h-4 w-4" />
                </span>
                {b.text}
              </li>
            ))}
          </ul>
        </motion.div>

        <p className="relative text-xs text-slate-400">© {new Date().getFullYear()} Phahendra Babu Library</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-5 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <Link href="/" prefetch className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/95 shadow-glow">
              <Image src="/logo.webp" alt="Phahendra Babu Library logo" fill sizes="40px" className="object-cover" priority />
            </span>
            <span className="h-display text-lg font-bold text-secondary-900 dark:text-white">Phahendra Babu Library</span>
          </Link>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
