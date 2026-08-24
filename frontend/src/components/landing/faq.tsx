"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "How does a monthly pass work?",
    a: "You pick a time block and a duration from 1 to 12 months. One payment locks a specific seat for that block for the whole duration. The pass renews nothing automatically — it stays active until its end date.",
  },
  {
    q: "Which time blocks can I choose from?",
    a: "Four 4-hour blocks (06:00–10:00, 10:00–14:00, 14:00–18:00, 18:00–22:00), two half-day blocks (06:00–14:00, 14:00–22:00) and the full day (06:00–22:00). Each has a fixed monthly price.",
  },
  {
    q: "Can I pick my exact seat?",
    a: "Yes. You'll see live availability across the seats in your section (male, female or common). Choose one, or let the library auto-assign the best free seat for you.",
  },
  {
    q: "When is my seat actually locked?",
    a: "A seat is previewed at checkout but only locked once your UPI payment is verified successfully. Until then it can still be taken by someone else.",
  },
  {
    q: "Can seats overlap between blocks?",
    a: "No. A seat is booked for one block at a time. Wider blocks like the full day cover the same seat, so overlapping bookings are rejected automatically.",
  },
  {
    q: "Which payment methods do you support?",
    a: "UPI through Razorpay at launch. You'll also get an email confirmation with your seat number as soon as payment is verified.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section-pad py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-2xl text-center"
      >
        <span className="badge">FAQ</span>
        <h2 className="h-display mt-4 text-3xl font-bold sm:text-4xl">Questions? <span className="text-gradient">Answered.</span></h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto mt-12 max-w-3xl space-y-3"
      >
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div
              key={f.q}
              className={`overflow-hidden rounded-2xl border transition-colors ${isOpen ? "border-primary-600/30 bg-primary-600/5" : "border-slate-200/70 bg-white/60 dark:border-white/10 dark:bg-secondary-900/40"}`}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                aria-expanded={isOpen}
              >
                <span className="h-display text-sm font-semibold sm:text-base">{f.q}</span>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${isOpen ? "rotate-45 bg-primary-600 text-white" : "bg-secondary-900/5 dark:bg-white/10"}`}>
                  <Plus className="h-4 w-4" />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="px-6 pb-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}
