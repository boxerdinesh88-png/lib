"use client";

import { motion } from "framer-motion";
import { Armchair, CalendarCheck, Wallet } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Choose a time block",
    description: "Pick the hours you need to study — from a 4-hour block to the full day — with a fixed price per block.",
  },
  {
    icon: Armchair,
    title: "Select your seat",
    description: "See live availability in your section, pick a seat or let the library auto-assign the best free one.",
  },
  {
    icon: CalendarCheck,
    title: "Pay & study",
    description: "Pay once with UPI on Razorpay. Your seat is locked for that block for 1–12 months — renew whenever you need it.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-gradient-to-b from-white/0 via-primary-600/5 to-white/0 py-24 dark:via-white/5">
      <div className="section-pad">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="badge">How it works</span>
          <h2 className="h-display mt-4 text-3xl font-bold sm:text-4xl">
            Your seat in <span className="text-gradient">3 steps</span>
          </h2>
        </motion.div>

        <div className="relative mt-16 grid gap-10 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-primary-500/30 via-accent/50 to-primary-500/30 md:block" />
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-600 to-accent text-white shadow-glow">
                <s.icon className="h-9 w-9" />
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-secondary-900 text-xs font-bold text-white dark:bg-white dark:text-secondary-900">
                  {i + 1}
                </span>
              </div>
              <h3 className="h-display mt-6 text-lg font-semibold">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {s.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
