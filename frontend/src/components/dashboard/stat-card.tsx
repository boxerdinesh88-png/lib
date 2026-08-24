import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  gradient: string;
  sub?: string;
  delay?: number;
}

export function StatCard({ label, value, icon: Icon, gradient, sub, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card relative overflow-hidden p-5"
    >
      <div className={cn("absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br opacity-10", gradient)} />
      <div className="flex items-center justify-between">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-soft", gradient)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="h-display mt-4 text-2xl font-bold text-secondary-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>}
    </motion.div>
  );
}
