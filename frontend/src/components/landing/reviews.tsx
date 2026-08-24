"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Armchair,
  MessageSquarePlus,
  PenLine,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { fetchReviews, submitReview } from "@/lib/api-fns";
import type { Review } from "@/lib/types";
import { apiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

// Shown until the first real reviews arrive via the public survey.
const SEED_REVIEWS: Review[] = [
  {
    id: "seed-1",
    name: "Ananya Sharma",
    display_name: "Ananya Sharma",
    rating: 5,
    atmosphere: 5,
    facilities: 4,
    liked_most:
      "I book the full-day block every morning and my seat by the window is always there. No more hunting around at 8am.",
    suggestion: "",
    created_at: "",
  },
  {
    id: "seed-2",
    name: "Rohan Mehta",
    display_name: "Rohan Mehta",
    rating: 5,
    atmosphere: 4,
    facilities: 5,
    liked_most:
      "The evening block fits my class schedule perfectly. Paying once on UPI and having the same corner seat locked is exactly what I needed.",
    suggestion: "",
    created_at: "",
  },
  {
    id: "seed-3",
    name: "Ishita Verma",
    display_name: "Ishita Verma",
    rating: 5,
    atmosphere: 5,
    facilities: 5,
    liked_most:
      "The expiry warning email saved me from losing my seat during revision week. Renewed in two minutes. Brilliant feature.",
    suggestion: "",
    created_at: "",
  },
];

const SURVEY_QUESTIONS = [
  {
    key: "rating",
    label: "Overall experience",
    hint: "How would you rate your time with us?",
    icon: Star,
    required: true,
  },
  {
    key: "atmosphere",
    label: "Reading environment & cleanliness",
    hint: "Quietness, lighting, hygiene",
    icon: Sparkles,
    required: false,
  },
  {
    key: "facilities",
    label: "Seat comfort & facilities",
    hint: "Desk, chair, wifi, charging",
    icon: Armchair,
    required: false,
  },
] as const;

const SENTIMENT = ["", "Poor", "Fair", "Good", "Very good", "Excellent"] as const;

type SurveyKey = (typeof SURVEY_QUESTIONS)[number]["key"];

const GRADIENTS = [
  "from-primary-500 to-violet-500",
  "from-accent to-emerald-500",
  "from-amber-500 to-orange-500",
  "from-sky-500 to-primary-600",
  "from-pink-500 to-rose-500",
];

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${size} ${
            i <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200 dark:fill-white/15 dark:text-white/15"
          }`}
        />
      ))}
    </div>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;
  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.button
          key={i}
          type="button"
          aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
          aria-pressed={i <= value}
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          whileTap={{ scale: 0.82 }}
          className="rounded-lg p-1 transition-transform duration-150 hover:scale-110"
        >
          <Star
            className={`h-6 w-6 transition-colors duration-150 ${
              i <= shown
                ? "fill-amber-400 text-amber-400 drop-shadow-[0_1px_2px_rgba(245,158,11,0.35)]"
                : "text-slate-300 dark:text-white/25"
            }`}
          />
        </motion.button>
      ))}
      {shown > 0 && (
        <motion.span
          key={`${shown}-${hovered > 0}`}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-1.5 min-w-[64px] text-left text-xs font-semibold text-amber-600 dark:text-amber-400"
        >
          {SENTIMENT[shown]}
        </motion.span>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="card relative mx-3 w-[320px] shrink-0 p-6 sm:w-[360px]">
      <Quote className="absolute right-5 top-5 h-7 w-7 text-primary-600/10 dark:text-white/10" />
      <div className="flex items-center justify-between gap-3">
        <Stars value={review.rating} />
        {!review.created_at ? null : (
          <span className="text-[11px] text-slate-400">{formatDate(review.created_at)}</span>
        )}
      </div>
      {review.liked_most && (
        <blockquote className="mt-3 line-clamp-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          &ldquo;{review.liked_most}&rdquo;
        </blockquote>
      )}
      {(review.atmosphere || review.facilities) && (
        <div className="mt-3 space-y-1.5">
          {review.atmosphere != null && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              Cleanliness <Stars value={review.atmosphere} size="h-3 w-3" />
            </div>
          )}
          {review.facilities != null && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              Facilities <Stars value={review.facilities} size="h-3 w-3" />
            </div>
          )}
        </div>
      )}
      <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-200/60 pt-4 dark:border-white/10">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${
            GRADIENTS[Math.abs(hashCode(review.display_name)) % GRADIENTS.length]
          }`}
        >
          {initialsOf(review.display_name)}
        </span>
        <span className="h-display truncate text-sm font-semibold">{review.display_name}</span>
      </figcaption>
    </figure>
  );
}

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

export function Reviews() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings] = useState<Record<SurveyKey, number>>({
    rating: 0,
    atmosphere: 0,
    facilities: 0,
  });
  const [likedMost, setLikedMost] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    fetchReviews()
      .then((data) => setReviews(data))
      .catch(() => setReviews([]))
      .finally(() => setLoaded(true));
  }, []);

  // Real reviews when available; friendly seeds before launch.
  const display = loaded && reviews.length > 0 ? reviews : SEED_REVIEWS;
  const isLiveData = loaded && reviews.length > 0;

  const average = useMemo(() => {
    if (display.length === 0) return null;
    const sum = display.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / display.length) * 10) / 10;
  }, [display]);

  // One seamless row drifting right → left: cards exit on the left while new
  // ones keep arriving from the right. Repeat the list enough times that the
  // track always overflows the viewport — keeps the loop gapless even when
  // there are only a handful of reviews yet.
  const MIN_CARDS = 14;
  const reps = Math.ceil(MIN_CARDS / Math.max(display.length, 1));
  const seq = Array.from({ length: reps }, () => display).flat();
  const track = [...seq, ...seq];

  async function openForm() {
    setFormOpen(true);
  }

  function resetForm() {
    setRatings({ rating: 0, atmosphere: 0, facilities: 0 });
    setLikedMost("");
    setSuggestion("");
    setName("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ratings.rating) {
      toast("Please rate your overall experience", "info");
      return;
    }
    setSubmitting(true);
    try {
      await submitReview({
        name: name.trim(),
        rating: ratings.rating,
        atmosphere: ratings.atmosphere || null,
        facilities: ratings.facilities || null,
        liked_most: likedMost.trim(),
        suggestion: suggestion.trim(),
      });
      setFormOpen(false);
      resetForm();
      toast("Thank you for your review!", "success", "It's now live on our site.");
      const fresh = await fetchReviews().catch(() => [] as Review[]);
      if (fresh.length > 0) setReviews(fresh);
    } catch (err) {
      toast("Could not submit review", "error", apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="reviews" className="relative overflow-hidden py-24">
      <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />
      <div className="absolute left-0 bottom-0 h-64 w-64 rounded-full bg-primary-500/10 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ ease: EASE }}
        className="section-pad mx-auto max-w-2xl text-center"
      >
        <span className="badge">Loved by members</span>
        <h2 className="h-display mt-4 text-3xl font-bold sm:text-4xl">
          What readers <span className="text-gradient">say about us</span>
        </h2>
        <div className="mt-4 flex items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          {average != null && (
            <span className="inline-flex items-center gap-1.5">
              <Stars value={average} />
              <strong className="font-semibold text-secondary-900 dark:text-white">{average}</strong>/5
            </span>
          )}
          <span>·</span>
          <span>{isLiveData ? `${reviews.length}+ recent reviews` : "Real reviews from real readers"}</span>
        </div>
        <Button variant="outline" className="mt-6" onClick={openForm}>
          <MessageSquarePlus className="h-4 w-4" /> Write a review
        </Button>
      </motion.div>

      {/* scrolling review wall */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ ease: EASE, delay: 0.1 }}
        className="relative mt-12"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-slate-50 to-transparent dark:from-secondary-950 sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-slate-50 to-transparent dark:from-secondary-950 sm:w-28" />
        <div className="marquee-wrap overflow-hidden py-2">
          <div
            className="marquee-track flex w-max"
            style={{ ["--marquee-duration" as string]: "60s" }}
          >
            {track.map((r, i) => (
              <ReviewCard key={`${r.id}-${i}`} review={r} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* public survey */}
      <Modal
        open={formOpen}
        onClose={() => !submitting && setFormOpen(false)}
        title="Share your experience"
        description="Rate us on 3 quick questions, add your thoughts if you like — takes less than a minute."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* star questions */}
          <div className="space-y-2.5">
            {SURVEY_QUESTIONS.map((q, idx) => (
              <div
                key={q.key}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/60 px-4 py-3.5 transition-colors focus-within:border-primary-400/60 hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-accent text-white shadow-glow">
                    <q.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold leading-snug text-secondary-900 dark:text-white">
                      <span className="mr-1.5 text-xs font-bold text-primary-500">{idx + 1}.</span>
                      {q.label}
                      {!q.required && (
                        <span className="ml-1.5 text-[11px] font-normal text-slate-400">optional</span>
                      )}
                      {q.required && <span className="ml-1 text-accent">*</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{q.hint}</p>
                  </div>
                </div>
                <div className="pl-11 sm:pl-0">
                  <StarPicker
                    value={ratings[q.key]}
                    onChange={(v) => setRatings((prev) => ({ ...prev, [q.key]: v }))}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* text answers */}
          <div className="grid gap-4">
            {(
              [
                {
                  label: "What did you like most?",
                  placeholder: "A sentence or two about your experience…",
                  value: likedMost,
                  set: setLikedMost,
                },
                {
                  label: "Any suggestions for us?",
                  placeholder: "Anything we can do better…",
                  value: suggestion,
                  set: setSuggestion,
                },
              ] as const
            ).map((field) => (
              <div key={field.label}>
                <label className="mb-1.5 block text-sm font-medium text-secondary-900 dark:text-white">
                  {field.label}
                  <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>
                </label>
                <div className="relative">
                  <textarea
                    className="input-base min-h-[72px] resize-none pb-6"
                    maxLength={400}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                  />
                  <span className="pointer-events-none absolute bottom-2 right-3 text-[10px] tabular-nums text-slate-300 dark:text-white/25">
                    {field.value.length}/400
                  </span>
                </div>
              </div>
            ))}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-secondary-900 dark:text-white">
                Your name
                <span className="ml-1 text-xs font-normal text-slate-400">
                  (optional — shows as Anonymous)
                </span>
              </label>
              <input
                className="input-base"
                maxLength={60}
                placeholder="e.g. Rahul S."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* actions */}
          <div className="border-t border-slate-200/70 pt-4 dark:border-white/10">
            {!ratings.rating && (
              <p className="mb-2.5 text-center text-xs text-amber-600 dark:text-amber-400">
                Please rate your overall experience to post.
              </p>
            )}
            <div className="flex items-center gap-2">
              <Button type="submit" className="flex-1" loading={submitting} disabled={!ratings.rating}>
                <PenLine className="h-4 w-4" /> Post review
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setFormOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Public review · no account needed · appears instantly on our site
            </p>
          </div>
        </form>
      </Modal>
    </section>
  );
}
