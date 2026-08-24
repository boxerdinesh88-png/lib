"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  LayoutGrid,
  LogOut,
  Menu,
  Moon,
  Shield,
  Sun,
  User as UserIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/store/auth";
import { cn, initials } from "@/lib/utils";
import type { User } from "@/lib/types";

const NAV_LINKS = [
  { href: "/#gallery", label: "Our Library" },
  { href: "/#about", label: "About Us" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/membership", label: "Membership" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuthStore();
  const toast = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out", "See you soon!");
    router.push("/");
    router.refresh();
  };

  const isLanding = pathname === "/";
  const onHero = isLanding && !scrolled;

  // Scroll-spy: highlight the nav link whose section is currently in view.
  useEffect(() => {
    if (!isLanding) return;
    const els = NAV_LINKS.filter((l) => l.href.startsWith("/#"))
      .map((l) => document.getElementById(l.href.slice(2)))
      .filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActiveId(top.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isLanding]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 py-3 transition-all duration-300",
        scrolled
          ? "glass-strong shadow-[0_10px_36px_-16px_rgba(15,23,42,0.25)] dark:shadow-[0_10px_36px_-16px_rgba(0,0,0,0.6)]"
          : "bg-transparent"
      )}
    >
      <nav className="section-pad flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl shadow-glow">
            <Image src="/logo.jpg" alt="Phahendra Babu Library logo" fill sizes="40px" priority className="object-cover" />
          </span>
          <span className={cn("h-display whitespace-nowrap text-sm font-bold tracking-tight sm:text-lg", onHero && "text-slate-900 dark:text-slate-900")}>
            Phahendra Babu <span className="text-gradient">Library</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((link) => {
            const targetId = link.href.startsWith("/#") ? link.href.slice(2) : "";
            const isActive = isLanding && targetId
              ? activeId === targetId
              : link.href === "/membership" && pathname === "/membership";
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary-600 dark:text-primary-300"
                    : onHero
                      ? "text-slate-700 hover:text-primary-600 dark:text-slate-700 dark:hover:text-primary-500"
                      : "text-secondary-800 hover:text-primary-600 dark:text-slate-200 dark:hover:text-primary-300"
                )}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-underline"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-primary-600 to-accent"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className={cn("btn-ghost h-10 w-10 p-0", onHero && "border-slate-200/80 bg-white/70 text-slate-700 hover:bg-white shadow-soft dark:border-slate-200/80 dark:bg-white/70 dark:text-slate-700 dark:hover:bg-white")}
            aria-label="Toggle dark mode"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {mounted ? (
                  theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
                ) : (
                  <span className="block h-5 w-5" />
                )}
              </motion.span>
            </AnimatePresence>
          </button>

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              {user.role === "admin" && (
                <Link href="/admin" className={cn("btn-ghost h-10 px-4", onHero && "border-slate-200/80 bg-white/70 text-slate-700 hover:bg-white shadow-soft dark:border-slate-200/80 dark:bg-white/70 dark:text-slate-700 dark:hover:bg-white")}>
                  <Shield className="h-4 w-4" /> Admin
                </Link>
              )}
              <Link href="/dashboard" className={cn("btn-ghost h-10 px-4", onHero && "border-slate-200/80 bg-white/70 text-slate-700 hover:bg-white shadow-soft dark:border-slate-200/80 dark:bg-white/70 dark:text-slate-700 dark:hover:bg-white")}>
                <LayoutGrid className="h-4 w-4" /> Dashboard
              </Link>
              <ProfileMenu user={user} onLogout={handleLogout} />
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
                <Link href="/login" prefetch className={cn("btn-ghost h-10 px-4", onHero && "border-slate-200/80 bg-white/70 text-slate-700 hover:bg-white shadow-soft dark:border-slate-200/80 dark:bg-white/70 dark:text-slate-700 dark:hover:bg-white")}>
                <UserIcon className="h-4 w-4" /> Sign in
              </Link>
              <Link href="/register" prefetch className="btn-primary h-10 px-5">
                Get started
              </Link>
            </div>
          )}

          <button
            className={cn("btn-ghost h-12 w-12 p-0 lg:hidden", onHero && "border-slate-200/80 bg-white/70 text-slate-700 hover:bg-white shadow-soft dark:border-slate-200/80 dark:bg-white/70 dark:text-slate-700 dark:hover:bg-white")}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-strong mx-4 mt-2 overflow-hidden rounded-3xl lg:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl px-4 py-4 text-base font-medium hover:bg-secondary-900/5 dark:hover:bg-white/10 active:bg-secondary-900/10"
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-slate-200 dark:bg-white/10" />
              {user ? (
                <>
                  {user.role === "admin" && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-4 text-base font-medium hover:bg-secondary-900/5 dark:hover:bg-white/10">
                      <Shield className="h-5 w-5" /> Admin
                    </Link>
                  )}
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-4 text-base font-medium bg-primary-600 text-white hover:bg-primary-700">
                    <LayoutGrid className="h-5 w-5" /> Dashboard
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-3 rounded-2xl px-4 py-4 text-base font-medium text-rose-500 hover:bg-rose-500/10">
                    <LogOut className="h-5 w-5" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" prefetch onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-4 text-base font-medium hover:bg-secondary-900/5 dark:hover:bg-white/10">
                    <UserIcon className="h-5 w-5" /> Sign in
                  </Link>
                  <Link href="/register" prefetch onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-4 text-base font-medium bg-primary-600 text-white hover:bg-primary-700">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function ProfileMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const items = [
    { href: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
    ...(user.role === "admin" ? [{ href: "/admin", icon: Shield, label: "Admin panel" }] : []),
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Profile menu for ${user.name}`}
        className="flex cursor-pointer items-center gap-1.5 rounded-full p-1 transition-colors hover:bg-secondary-900/5 dark:hover:bg-white/10"
      >
        <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-600 to-accent text-sm font-bold text-white shadow-glow">
          {user.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- API-served avatar, host varies by deployment
            <img src={user.photo_url} alt="" width={40} height={40} decoding="async" className="h-full w-full object-cover" />
          ) : (
            initials(user.name)
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            role="menu"
            className="glass-strong absolute right-0 top-full z-50 mt-3 w-60 origin-top-right rounded-2xl p-2 shadow-soft-lg"
          >
            <Link
              href="/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 border-b border-slate-200/60 px-3 py-2.5 transition-colors hover:bg-primary-600/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-600 to-accent text-xs font-bold text-white">
                {user.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- API-served avatar, host varies by deployment
                  <img src={user.photo_url} alt="" width={36} height={36} decoding="async" className="h-full w-full object-cover" />
                ) : (
                  initials(user.name)
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-secondary-900 dark:text-white">{user.name}</span>
                <span className="block truncate text-xs text-slate-400">{user.email}</span>
              </span>
            </Link>
            <div className="pt-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-secondary-700 transition-colors hover:bg-primary-600/10 hover:text-primary-700 dark:text-slate-200 dark:hover:text-primary-300"
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </Link>
              ))}
              <button
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="mt-1 flex w-full items-center gap-2.5 rounded-xl border-t border-slate-200/60 px-3 py-2.5 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-500/10 dark:border-white/10"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
