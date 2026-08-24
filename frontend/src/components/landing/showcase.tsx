"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Armchair,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Expand,
  Users,
  Volume2,
  VolumeX,
  Wallet,
  Wifi,
  X,
  Zap,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const PHOTOS = [
  "/lib/WhatsApp%20Image%202026-08-20%20at%203.36.37%20PM.jpeg",
  "/lib/WhatsApp%20Image%202026-08-20%20at%203.36.37%20PM%20(1).jpeg",
  "/lib/WhatsApp%20Image%202026-08-20%20at%203.36.38%20PM.jpeg",
  "/lib/WhatsApp%20Image%202026-08-20%20at%203.36.38%20PM%20(1).jpeg",
  "/lib/WhatsApp%20Image%202026-08-20%20at%203.36.39%20PM.jpeg",
  "/lib/WhatsApp%20Image%202026-08-20%20at%203.36.39%20PM%20(1).jpeg",
  "/lib/WhatsApp%20Image%202026-08-20%20at%203.36.40%20PM.jpeg",
  "/lib/WhatsApp%20Image%202026-08-20%20at%203.36.40%20PM%20(1).jpeg",
  "/lib/WhatsApp%20Image%202026-08-20%20at%203.36.41%20PM.jpeg",
  "/lib/WhatsApp%20Image%202026-08-20%20at%203.36.41%20PM%20(1).jpeg",
  "/lib/WhatsApp%20Image%202026-08-20%20at%203.36.42%20PM.jpeg",
  "/lib/WhatsApp%20Image%202026-08-20%20at%203.36.42%20PM%20(1).jpeg",
  "/lib/WhatsApp%20Image%202026-08-20%20at%203.36.44%20PM.jpeg",
  "/lib/WhatsApp%20Image%202026-08-20%20at%203.36.45%20PM.jpeg",
  "/lib/WhatsApp%20Image%202026-08-20%20at%203.36.46%20PM.jpeg",
];

const HIGHLIGHTS = [
  { icon: Armchair, label: "Dedicated seats for every member" },
  { icon: Users, label: "Separate male & female sections" },
  { icon: Wifi, label: "High-speed Wi-Fi & power at every desk" },
  { icon: BookOpen, label: "Silent, distraction-free reading hall" },
];

function Lightbox({
  index,
  onClose,
  onNavigate,
}: {
  index: number;
  onClose: () => void;
  onNavigate: (dir: 1 | -1) => void;
}) {
  const [direction, setDirection] = useState(1);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const go = useCallback(
    (dir: 1 | -1) => {
      setDirection(dir);
      onNavigate(dir);
    },
    [onNavigate]
  );

  // close on Escape + arrow-key navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // keep active thumbnail visible
  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [index]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-label="Library photo gallery"
      className="fixed inset-0 z-[100] flex flex-col bg-secondary-950/95 backdrop-blur-md"
      onClick={onClose}
    >
      {/* top bar */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md sm:text-sm">
          {index + 1} / {PHOTOS.length}
        </span>
        <button
          type="button"
          aria-label="Close gallery"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* main stage */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 sm:px-20">
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -60, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) go(1);
              else if (info.offset.x > 70) go(-1);
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative h-full w-full cursor-grab touch-pan-y overflow-hidden rounded-2xl active:cursor-grabbing"
          >
            <Image
              src={PHOTOS[index]}
              alt={`Phahendra Babu Library — photo ${index + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* prev / next */}
        <button
          type="button"
          aria-label="Previous photo"
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-black/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:scale-95 sm:left-4 sm:h-12 sm:w-12"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <button
          type="button"
          aria-label="Next photo"
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-black/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:scale-95 sm:right-4 sm:h-12 sm:w-12"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      {/* thumbnail strip */}
      <div
        className="shrink-0 overflow-x-auto px-4 py-4 sm:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex w-max gap-2">
          {PHOTOS.map((photo, i) => (
            <button
              key={photo}
              ref={(el) => {
                thumbRefs.current[i] = el;
              }}
              type="button"
              aria-label={`View photo ${i + 1}`}
              aria-current={i === index}
              onClick={() => {
                if (i === index) return;
                setDirection(i > index ? 1 : -1);
                onNavigate(i > index ? 1 : -1);
              }}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 sm:h-16 sm:w-16 ${
                i === index
                  ? "border-blue-400 ring-2 ring-blue-400/40"
                  : "border-white/15 opacity-50 hover:opacity-90"
              }`}
            >
              <Image src={photo} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Gallery() {
  const [selected, setSelected] = useState<number | null>(null);

  const navigate = useCallback((dir: 1 | -1) => {
    setSelected((current) =>
      current === null ? current : (current + dir + PHOTOS.length) % PHOTOS.length
    );
  }, []);

  return (
    <section id="gallery" className="section-pad py-20 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE }}
        className="mx-auto max-w-2xl text-center"
      >
        <span className="badge">Our Library</span>
        <h2 className="h-display mt-4 text-3xl font-bold sm:text-4xl">
          Glimpses of your <span className="text-gradient">study home</span>
        </h2>
        <p className="mt-4 text-slate-500 dark:text-slate-400">
          A calm, well-lit space designed for long, focused study hours — click any photo to view
          the full gallery.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5"
      >
        {PHOTOS.map((photo, i) => (
          <motion.button
            key={photo}
            type="button"
            aria-label={`View photo ${i + 1} in full screen`}
            onClick={() => setSelected(i)}
            variants={{
              hidden: { opacity: 0, y: 28 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
            }}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200/70 shadow-soft outline-none transition-shadow duration-300 hover:shadow-glass-lg focus-visible:ring-4 focus-visible:ring-blue-500/30 dark:border-white/10 dark:shadow-none"
          >
            <Image
              src={photo}
              alt={`Phahendra Babu Library — photo ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-secondary-950/55 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <span className="absolute bottom-2.5 right-2.5 inline-flex h-8 w-8 translate-y-2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <Expand className="h-3.5 w-3.5" />
            </span>
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence>
        {selected !== null && (
          <Lightbox
            index={selected}
            onClose={() => setSelected(null)}
            onNavigate={(dir) => navigate(dir)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

const atContainer = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const atFadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

function AboutTour() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [muted, setMuted] = useState(true);
  const [touched, setTouched] = useState(false);
  const [flash, setFlash] = useState<"on" | "off" | null>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = true;
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  // Auto-mute whenever the phone scrolls out of view.
  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !video.muted) {
          video.muted = true;
          setMuted(true);
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  const toggleSound = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    if (!nextMuted) {
      video.volume = 1;
      void video.play().catch(() => {});
    }

    setMuted(nextMuted);
    setTouched(true);
    setFlash(nextMuted ? "off" : "on");
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 1400);
  }, []);

  return (
    <section id="about" className="relative overflow-hidden py-20 sm:py-24">
      {/* background */}
      <div className="bg-grid absolute inset-0 opacity-[0.05]" aria-hidden />
      <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-200/30 blur-[120px]" aria-hidden />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-200/30 blur-[120px]" aria-hidden />

      <div className="section-pad relative grid items-center gap-14 sm:gap-16 lg:grid-cols-2 lg:gap-10 xl:gap-16">
        {/* ==== Left: content ==== */}
        <motion.div
          variants={atContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center lg:text-left"
        >
          <motion.div variants={atFadeUp} className="flex justify-center lg:justify-start">
            <span className="badge">About Us</span>
          </motion.div>

          <motion.h2
            variants={atFadeUp}
            className="h-display mt-4 text-3xl font-bold leading-tight sm:text-4xl"
          >
            Built for <span className="text-gradient">serious aspirants</span>
          </motion.h2>

          <motion.p
            variants={atFadeUp}
            className="mx-auto mt-4 max-w-xl leading-relaxed text-slate-600 dark:text-slate-400 lg:mx-0"
          >
            Phahendra Babu Library offers a quiet, air-conditioned study environment with a
            reserved seat for every member. Book online in seconds, walk in and start studying —
            no daily rush to find a place.
          </motion.p>

          <motion.ul variants={atFadeUp} className="mx-auto mt-8 max-w-md space-y-3 lg:mx-0">
            {HIGHLIGHTS.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3 text-left shadow-soft backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:shadow-none"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-glow">
                  <item.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {item.label}
                </span>
              </li>
            ))}
          </motion.ul>

          <motion.div variants={atFadeUp} className="mt-8 flex justify-center lg:justify-start">
            <Link
              href="/membership"
              prefetch
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40 sm:h-14 sm:px-8 sm:text-base focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
            >
              Book Your Seat
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        {/* ==== Right: phone with live video ==== */}
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.85, ease: EASE }}
          className="relative flex justify-center"
        >
          {/* glow */}
          <div
            className="absolute left-1/2 top-1/2 h-[70%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-blue-500/25 via-cyan-400/20 to-violet-500/25 blur-3xl"
            aria-hidden
          />

          {/* floating chip — seats */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-2 right-0 z-20 hidden items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-3.5 py-2.5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-secondary-900/80 sm:flex lg:-right-6"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Live seat availability
            </span>
          </motion.div>

          {/* floating chip — payments */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="absolute -bottom-3 left-0 z-20 hidden items-center gap-2.5 rounded-2xl border border-slate-200/70 bg-white/80 px-3.5 py-2.5 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-secondary-900/80 sm:flex lg:-left-6"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
              <Wallet className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Easy UPI booking
            </span>
          </motion.div>

          {/* phone mockup */}
          <div ref={wrapRef} className="relative z-10">
            {/* side buttons */}
            <span className="absolute -left-[2.5px] top-24 h-9 w-[3px] rounded-l-md bg-slate-600 dark:bg-slate-500" aria-hidden />
            <span className="absolute -left-[2.5px] top-36 h-12 w-[3px] rounded-l-md bg-slate-600 dark:bg-slate-500" aria-hidden />
            <span className="absolute -right-[2.5px] top-28 h-16 w-[3px] rounded-r-md bg-slate-600 dark:bg-slate-500" aria-hidden />

            <div
              role="button"
              tabIndex={0}
              aria-label={muted ? "Unmute library tour video" : "Mute library tour video"}
              onClick={toggleSound}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleSound();
                }
              }}
              className="w-[280px] cursor-pointer select-none rounded-[3rem] bg-gradient-to-b from-slate-600 via-slate-900 to-slate-700 p-[10px] shadow-2xl shadow-blue-900/30 ring-1 ring-white/10 outline-none transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-blue-500/30 sm:w-[320px] lg:w-[370px]"
            >
              {/* screen */}
              <div className="relative overflow-hidden rounded-[2.4rem] bg-black">
                <video
                  ref={videoRef}
                  src="/lib/VN20260820_150331.mp4"
                  poster="/lib/WhatsApp%20Image%202026-08-20%20at%203.36.37%20PM.jpeg"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="aspect-[9/16] w-full touch-pan-y object-cover"
                />

                {/* cinematic gradients */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                {/* dynamic island */}
                <div className="pointer-events-none absolute left-1/2 top-2.5 z-20 h-[22px] w-[92px] -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10" />

                {/* top label */}
                <div className="pointer-events-none absolute left-1/2 top-9 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                  <BookOpen className="mr-1 inline h-3 w-3" />
                  Library Tour
                </div>

                {/* first-time hint */}
                <AnimatePresence>
                  {!touched && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                    >
                      <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/30 bg-black/50 px-3 py-2 text-xs font-medium text-white backdrop-blur-md">
                        <VolumeX className="h-3.5 w-3.5 animate-pulse" />
                        Tap for sound
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* sound flash feedback */}
                <AnimatePresence>
                  {flash && (
                    <motion.div
                      key={flash}
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="pointer-events-none absolute bottom-14 left-1/2 z-10 -translate-x-1/2"
                    >
                      <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/25 bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
                        {flash === "on" ? (
                          <>
                            <Volume2 className="h-3 w-3 text-emerald-400" /> Sound on
                          </>
                        ) : (
                          <>
                            <VolumeX className="h-3 w-3" /> Muted
                          </>
                        )}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* caption */}
                <div className="pointer-events-none absolute inset-x-4 bottom-9 z-10 text-center">
                  <p className="text-[11px] font-medium text-white/85">
                    Walk through our reading halls
                  </p>
                </div>

                {/* mute / unmute control */}
                <button
                  type="button"
                  aria-label={muted ? "Unmute video" : "Mute video"}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSound();
                  }}
                  className="absolute bottom-2.5 right-2.5 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-black/65 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:scale-95"
                >
                  {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* small hint under phone */}
          <motion.span
            variants={atFadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="absolute -bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap text-xs text-slate-400 dark:text-slate-500"
          >
            <Zap className="h-3.5 w-3.5" />
            Tap the screen for sound · auto-mutes on scroll away
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}

export function Showcase() {
  return (
    <>
      <Gallery />
      <AboutTour />
    </>
  );
}
