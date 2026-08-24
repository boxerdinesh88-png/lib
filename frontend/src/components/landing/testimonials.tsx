"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Ananya Sharma",
    role: "CA Aspirant, Delhi",
    initials: "AS",
    gradient: "from-primary-500 to-violet-500",
    text: "I book the full-day block every morning and my seat by the window is always there. No more hunting around at 8am — just walk in and study.",
    rating: 5,
  },
  {
    name: "Rohan Mehta",
    role: "Engineering Student, Pune",
    initials: "RM",
    gradient: "from-accent to-emerald-500",
    text: "The evening block from 2 to 10 fits my class schedule perfectly. Paying ₹550 once on UPI and having the same corner seat locked is exactly what I needed.",
    rating: 5,
  },
  {
    name: "Ishita Verma",
    role: "UPSC Candidate, Hyderabad",
    initials: "IV",
    gradient: "from-amber-500 to-orange-500",
    text: "The 7-day expiry warning email saved me from losing my seat during revision week. Renewed in two minutes. Brilliant feature.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden py-24">
      <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />
      <div className="section-pad">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="badge">Loved by members</span>
          <h2 className="h-display mt-4 text-3xl font-bold sm:text-4xl">
            A seat you can <span className="text-gradient">count on</span>
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12 }}
              className="card relative p-7"
            >
              <Quote className="absolute right-6 top-6 h-8 w-8 text-primary-600/10 dark:text-white/10" />
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }, (_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-200/60 pt-5 dark:border-white/10">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-sm font-bold text-white`}>
                  {t.initials}
                </span>
                <div>
                  <p className="h-display text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
