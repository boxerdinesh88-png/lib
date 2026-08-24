"use client";

import { motion } from "framer-motion";
import { Armchair, Bell, Clock, ShieldCheck, Users, Wallet } from "lucide-react";

const features = [
  {
    icon: Armchair,
    gradient: "from-primary-600 to-primary-400",
    title: "Your seat, reserved",
    description:
      "One payment locks a dedicated seat for your time block for the whole month. Walk in, sit at your usual spot — no race to find a place.",
  },
  {
    icon: Users,
    gradient: "from-accent to-emerald-500",
    title: "Sectioned seating",
    description:
      "Separate male, female and common sections. You only ever see seats you're actually allowed to book.",
  },
  {
    icon: Clock,
    gradient: "from-amber-500 to-orange-500",
    title: "Flexible time blocks",
    description:
      "Four-hour blocks up to the full day, each with a fixed price. Study exactly the hours you need.",
  },
  {
    icon: Wallet,
    gradient: "from-violet-500 to-fuchsia-500",
    title: "UPI payments",
    description:
      "Pay securely through Razorpay UPI. The seat is only locked after your payment is verified — no holds before checkout.",
  },
  {
    icon: Bell,
    gradient: "from-sky-500 to-blue-500",
    title: "Booking confirmations",
    description:
      "Get an email the moment your payment verifies, with your seat number and time block — so there's never any confusion.",
  },
  {
    icon: ShieldCheck,
    gradient: "from-rose-500 to-pink-500",
    title: "Admin supervision",
    description:
      "The library team tracks occupancy, revenue and memberships on a live dashboard and can manage seats centrally.",
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Features() {
  return (
    <section id="features" className="section-pad py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-2xl text-center"
      >
        <span className="badge">Features</span>
        <h2 className="h-display mt-4 text-3xl font-bold sm:text-4xl">
          Everything you need to <span className="text-gradient">study smarter</span>
        </h2>
        <p className="mt-4 text-slate-500 dark:text-slate-400">
          A calm, predictable way to keep your study seat — without booking it every day.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-12 sm:mt-14 grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {features.map((f) => (
          <motion.div key={f.title} variants={item}>
            <div className="card group h-full p-5 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg dark:hover:border-white/20">
              <div className={`inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} text-white shadow-glow transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                <f.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="h-display mt-4 sm:mt-5 text-base sm:text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
