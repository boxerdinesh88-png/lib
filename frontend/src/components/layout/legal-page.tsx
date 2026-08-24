import type { LucideIcon } from "lucide-react";

interface LegalPageProps {
  icon: LucideIcon;
  badge: string;
  title: string;
  subtitle: string;
  updated: string;
  children: React.ReactNode;
}

export function LegalPage({ icon: Icon, badge, title, subtitle, updated, children }: LegalPageProps) {
  return (
    <main className="relative overflow-hidden pb-24 pt-28 sm:pt-32">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-primary-500/10 blur-[120px]" />
      </div>

      <div className="section-pad relative">
        <div className="mx-auto max-w-3xl">
          <header className="text-center">
            <span className="badge">{badge}</span>
            <h1 className="h-display mt-5 text-3xl font-bold sm:text-4xl">{title}</h1>
            <p className="mt-3 text-slate-500 dark:text-slate-400">{subtitle}</p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-white/5 dark:text-slate-400">
              <Icon className="h-3.5 w-3.5" />
              Last updated: {updated}
            </p>
          </header>

          <div className="mt-10 space-y-6">{children}</div>
        </div>
      </div>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white/60 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-8">
      <h2 className="h-display text-lg font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="ml-1 list-inside space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
