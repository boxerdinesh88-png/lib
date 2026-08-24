"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Cta() {
  return (
    <section className="section-pad py-24">
      <div className="section-pad">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-600 via-primary-700 to-accent px-5 sm:px-6 py-12 sm:py-16 text-center shadow-glow"
        >
          <div className="bg-grid absolute inset-0 opacity-30" />
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />

          <div className="relative">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="h-display mx-auto max-w-2xl text-2xl font-bold text-white sm:text-3xl lg:text-4xl"
            >
              Your seat is waiting. Reserve it today.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-slate-200"
            >
              Pick a time block, choose your seat and pay once with UPI. Monthly passes start at ₹250 —
              sign up in under a minute.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <Link
                href="/membership"
                prefetch
                className="group inline-flex h-12 sm:h-13 items-center gap-2 rounded-full bg-white px-6 sm:px-8 text-sm sm:text-base font-semibold text-primary-700 shadow-soft-lg transition-all hover:-translate-y-0.5 hover:bg-primary-50 hover:shadow-soft-xl"
              >
                Book a seat
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/register"
                className="inline-flex h-12 sm:h-13 items-center rounded-full border border-white/30 bg-white/10 px-6 sm:px-8 text-sm sm:text-base font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                Create free account
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
