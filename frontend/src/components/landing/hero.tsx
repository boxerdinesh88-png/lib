"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Armchair, CalendarCheck, MapPin, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const LogoShowcase = dynamic(() => import("@/components/three/logo-showcase").then((m) => m.LogoShowcase), {
  ssr: false,
  loading: () => null,
});

const EASE = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const TRUST = [
  { icon: CalendarCheck, label: "Easy Seat Booking" },
  { icon: Zap, label: "Real-Time Availability" },
  { icon: Armchair, label: "Comfortable Study Space" },
];

export function Hero() {
  const prefersReduced = useReducedMotion();
  const reduced = prefersReduced ?? false;

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-24">
      {/* ==== Background ==== */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-cyan-50" />
      <div className="bg-grid absolute inset-0 opacity-[0.07]" aria-hidden />

      {/* soft blue gradient shapes */}
      <div className="absolute -left-40 top-24 h-[28rem] w-[28rem] rounded-full bg-blue-200/30 blur-[120px]" aria-hidden />
      <div className="absolute -right-24 top-1/3 h-[26rem] w-[26rem] rounded-full bg-cyan-200/30 blur-[120px]" aria-hidden />
      <div className="absolute bottom-0 left-1/3 h-64 w-[28rem] rounded-full bg-sky-100/70 blur-[110px]" aria-hidden />

      <div className="section-pad relative z-10 grid items-center gap-8 sm:gap-12 lg:gap-14 pb-20 sm:pb-24 pt-4 sm:pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        {/* ==== Right: 3D brand logo ==== */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="order-first h-[280px] sm:h-[320px] lg:order-last lg:h-[560px]"
        >
          <LogoShowcase reduced={reduced} />
        </motion.div>

        {/* ==== Left: copy ==== */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="order-last space-y-6 sm:space-y-7 text-center lg:order-first lg:space-y-8 lg:text-left"
        >
          {/* brand pill */}
          <motion.div variants={fadeUp} className="flex justify-center lg:justify-start">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-blue-200/70 bg-white/70 px-3 sm:px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-soft backdrop-blur-md">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Phahendra Babu Library · Seat Booking
            </span>
          </motion.div>

          {/* heading */}
          <motion.h1
            variants={fadeUp}
            className="h-display text-3xl font-bold leading-[1.08] text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.1rem]"
          >
            Find Your Perfect{" "}
            <span
              className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent animate-gradient"
              style={{ backgroundSize: "200% 200%" }}
            >
              Study Seat
            </span>
          </motion.h1>

          {/* description */}
          <motion.p
            variants={fadeUp}
            className="mx-auto max-w-xl text-sm sm:text-base leading-relaxed text-slate-600 lg:mx-0"
          >
            Book your preferred seat at Phahendra Babu Library and enjoy a focused, comfortable
            and productive study environment.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:justify-start"
          >
            <Link
              href="/membership"
              prefetch
              className="group relative inline-flex h-12 sm:h-14 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 sm:px-8 text-sm sm:text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
            >
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              Book Your Seat
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" />
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>
            <Link
              href="/#features"
              className="inline-flex h-12 sm:h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white/70 px-6 sm:px-8 text-sm sm:text-base font-semibold text-slate-700 shadow-soft backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-slate-900"
            >
              <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              Explore Library
            </Link>
          </motion.div>

          {/* trust row */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 gap-y-2 pt-2 lg:justify-start"
          >
            {TRUST.map((item, i) => {
              const Icon = item.icon;
              return (
                <span
                  key={item.label}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/70 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-600 shadow-soft backdrop-blur-md"
                >
                  <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" />
                  {item.label}
                  {i < TRUST.length - 1 && <span className="ml-1 hidden text-slate-300 sm:inline">•</span>}
                </span>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
