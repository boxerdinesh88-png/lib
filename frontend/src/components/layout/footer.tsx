import { Github, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const footerCols = [
  {
    title: "Product",
    links: [
      { label: "Our Library", href: "/#gallery" },
      { label: "About Us", href: "/#about" },
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Reviews", href: "/#reviews" },
      { label: "FAQ", href: "/#faq" },
      { label: "Membership planner", href: "/membership" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help centre", href: "/help" },
      { label: "Terms of service", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Refund policy", href: "/refund" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-slate-200/70 bg-white/50 py-14 backdrop-blur-xl dark:border-white/10 dark:bg-secondary-950/60">
      <div className="section-pad">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl">
                <Image src="/logo.jpg" alt="Phahendra Babu Library logo" fill sizes="40px" className="object-cover" />
              </span>
              <span className="h-display text-lg font-bold">Phahendra Babu <span className="text-gradient">Library</span></span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Reserve a dedicated study seat for any time block — 4 hours to the full day.
              Pay monthly with UPI and keep the same seat all month.
            </p>
            <div className="mt-5 space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                <span>
                  Vill- Kharhat, P.O.- Phulmallik, P.S:- Sahebpur Kamal,
                  Dist:- Begusarai, 851217, Ward No. 11, Near Phahendra Babu Library
                </span>
              </p>
              <a href="tel:+918804162854" className="flex items-center gap-2 transition hover:text-primary-600 dark:hover:text-primary-400">
                <Phone className="h-4 w-4 shrink-0 text-primary-500" /> +91 8804162854
              </a>
              <a href="mailto:PhahendraBabulibrary@gmail.com" className="flex items-center gap-2 transition hover:text-primary-600 dark:hover:text-primary-400">
                <Mail className="h-4 w-4 shrink-0 text-primary-500" /> PhahendraBabulibrary@gmail.com
              </a>
            </div>
            <div className="mt-5 flex gap-2">
              {[Twitter, Instagram, Linkedin, Youtube, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-primary-500 hover:text-primary-500 dark:border-white/10 dark:text-slate-400"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {footerCols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-secondary-900 dark:text-white">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-slate-500 transition hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/70 pt-6 text-xs text-slate-400 sm:flex-row dark:border-white/10">
          <p>© {new Date().getFullYear()} Phahendra Babu Library. All rights reserved. Managed by Akash Kumar.</p>
          <div className="flex items-center gap-4">
            <span>Made with care for students &amp; professionals</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
