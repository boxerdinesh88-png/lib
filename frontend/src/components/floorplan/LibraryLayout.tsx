"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { Seat } from "./Seat";
import { PALETTE, ROOM, SEATS, type FloorplanStatus } from "./SeatData";

export interface LibraryLayoutProps {
  seats: Array<{ number: string; status: FloorplanStatus }>;
  selectedNumber: string | null;
  onPick: (number: string) => void;
}

const HAND = '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive';
const LABEL = "Inter, ui-sans-serif, system-ui, sans-serif";

function PlanViewport({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef<number | null>(null);
  const moved = useRef(false);
  const suppressClick = useRef(false);

  const handleMove = useCallback((e: PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved.current = true;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 1) {
      setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    } else if (pointers.current.size === 2 && pinchDist.current != null) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      setView((v) => {
        const k = Math.min(4, Math.max(1, v.k * (d / (pinchDist.current ?? 1))));
        const f = k / v.k;
        return { x: mx - (mx - v.x) * f, y: my - (my - v.y) * f, k };
      });
      pinchDist.current = d;
    }
  }, []);

  const handleUp = useCallback(
    (e: PointerEvent) => {
      if (moved.current) suppressClick.current = true;
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) pinchDist.current = null;
      if (pointers.current.size === 0) {
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
        window.removeEventListener("pointercancel", handleUp);
      }
    },
    [handleMove]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved.current = false;
      if (pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()];
        pinchDist.current = Math.hypot(a.x - b.x, a.y - b.y);
      }
      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
      window.addEventListener("pointercancel", handleUp);
    },
    [handleMove, handleUp]
  );

  // suppress accidental seat clicks right after a drag
  useEffect(() => {
    const onCapture = (e: Event) => {
      if (suppressClick.current) {
        e.stopPropagation();
        e.preventDefault();
        suppressClick.current = false;
      }
    };
    window.addEventListener("click", onCapture, true);
    return () => window.removeEventListener("click", onCapture, true);
  }, []);

  // wheel zoom (non-passive so we can preventDefault)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      setView((v) => {
        const k = Math.min(4, Math.max(1, v.k * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
        const f = k / v.k;
        return { x: px - (px - v.x) * f, y: py - (py - v.y) * f, k };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onBlur = () => {
      pointers.current.clear();
      pinchDist.current = null;
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [handleMove, handleUp]);

  const zoomBy = useCallback((factor: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setView((v) => {
      const k = Math.min(4, Math.max(1, v.k * factor));
      const f = k / v.k;
      return { x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f, k };
    });
  }, []);

  const reset = useCallback(() => {
    pointers.current.clear();
    pinchDist.current = null;
    setView({ x: 0, y: 0, k: 1 });
  }, []);

  return (
    <div className="relative">
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        className="relative h-[420px] w-full touch-none select-none overflow-hidden bg-[#EEF1F5] sm:h-[520px]"
      >
        <div
          className="absolute inset-0 flex origin-center items-center justify-center will-change-transform"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` }}
        >
          {children}
        </div>

        <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => zoomBy(1.2)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-600 shadow ring-1 ring-slate-200 transition hover:text-primary-700 dark:bg-secondary-800/90 dark:text-slate-300 dark:ring-white/10"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.2)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-600 shadow ring-1 ring-slate-200 transition hover:text-primary-700 dark:bg-secondary-800/90 dark:text-slate-300 dark:ring-white/10"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-600 shadow ring-1 ring-slate-200 transition hover:text-primary-700 dark:bg-secondary-800/90 dark:text-slate-300 dark:ring-white/10"
            aria-label="Reset view"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-slate-400 sm:hidden">
          Pinch to zoom · Drag to pan
        </p>
      </div>
    </div>
  );
}

function LegendChip({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-3 w-3 rounded-full border border-slate-300/60 dark:border-white/20"
        style={{ backgroundColor: color, ...(dashed ? { backgroundImage: "repeating-linear-gradient(45deg, transparent 0 2px, #fff 2px 3.5px)" } : {}) }}
      />
      {label}
    </span>
  );
}

export function LibraryLayout({ seats, selectedNumber, onPick }: LibraryLayoutProps) {
  const byNumber = useMemo(() => new Map(seats.map((s) => [s.number, s.status])), [seats]);

  return (
    <div>
      <PlanViewport>
        <svg
          viewBox={`0 0 ${ROOM.width} ${ROOM.height}`}
          className="h-auto max-h-full w-auto max-w-full"
          role="img"
          aria-label="2D architectural floor plan of the reading hall"
        >
          <defs>
            <filter id="seatShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.15" />
            </filter>
            <pattern id="grill" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect width="16" height="16" fill={PALETTE.floor} />
              <line x1="8" y1="0" x2="8" y2="16" stroke={PALETTE.wall} strokeWidth="3" />
            </pattern>
            <pattern id="terrazzo" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="7" cy="9" r="1.4" fill="#C9C9C9" />
              <circle cx="19" cy="20" r="1.2" fill="#D2D2D2" />
              <circle cx="24" cy="6" r="1" fill="#CECECE" />
              <circle cx="11" cy="24" r="1.1" fill="#D6D6D6" />
            </pattern>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#EC4899" />
            </marker>
          </defs>

          {/* walls */}
          <rect x="0" y="0" width={ROOM.width} height={ROOM.height} fill={PALETTE.wall} />
          {/* floor */}
          <rect x="24" y="24" width={ROOM.width - 48} height={ROOM.height - 48} fill={PALETTE.floor} />
          <rect x="24" y="24" width={ROOM.width - 48} height={ROOM.height - 48} fill="url(#terrazzo)" />
          <rect x="24" y="24" width={ROOM.width - 48} height={ROOM.height - 48} fill="none" stroke="#3F3F3F" strokeWidth="2" />

          {/* door 1 — left wall, at water-station level */}
          <rect x="0" y="860" width="24" height="120" fill="url(#grill)" />
          <rect x="0" y="860" width="24" height="120" fill="none" stroke="#3F3F3F" strokeWidth="2" />
          <text
            transform="rotate(-90 46 920)"
            x={46}
            y={920}
            textAnchor="middle"
            fontSize={14}
            fontWeight={600}
            fill={PALETTE.wall}
            fontFamily={LABEL}
            letterSpacing="2"
          >
            DOOR
          </text>

          {/* divide wall — splits upper and lower halves (passage doors on both sides) */}
          <rect x="220" y="512" width="800" height="16" fill="#C3C8CF" stroke="#98A0A8" strokeWidth="1.5" />
          <text
            x="620"
            y="496"
            textAnchor="middle"
            fontSize={14}
            fontWeight={600}
            fill={PALETTE.wall}
            fontFamily={LABEL}
            letterSpacing="2"
          >
            DIVIDE WALL
          </text>

          {/* title block */}
          <text
            x="130"
            y="70"
            textAnchor="middle"
            fontSize={14}
            fontWeight={600}
            fill={PALETTE.wall}
            fontFamily={LABEL}
            letterSpacing="2"
          >
            READING HALL · 36 SEATS
          </text>

          {/* girls-only zones */}
          <rect x="1050" y="540" width="100" height="512" rx="8" fill="#FDF2F8" opacity="0.35" stroke="#EC4899" strokeWidth="2" strokeDasharray="7 5" />
          <rect x="594" y="574" width="100" height="456" rx="8" fill="#FDF2F8" opacity="0.35" stroke="#EC4899" strokeWidth="2" strokeDasharray="7 5" />

          {/* handwritten note near seats 21–31 */}
          <g transform="rotate(-4 945 795)">
            <text
              x={945}
              y={776}
              textAnchor="middle"
              fontFamily={HAND}
              fontStyle="italic"
              fontSize={24}
              fontWeight={700}
              fill="#BE185D"
            >
              Seat 21–31
            </text>
            <text
              x={945}
              y={806}
              textAnchor="middle"
              fontFamily={HAND}
              fontStyle="italic"
              fontSize={24}
              fontWeight={700}
              fill="#BE185D"
            >
              For Girls Only
            </text>
            <path d="M855 822 q 22 -6 44 0 q 22 6 44 0 q 22 -6 44 0 q 22 6 44 0" fill="none" stroke="#EC4899" strokeWidth="2" />
          </g>
          <path d="M1005 795 L1066 762" stroke="#EC4899" strokeWidth="2.5" strokeDasharray="1 0" markerEnd="url(#arrow)" />

          {/* water station — bottom left */}
          <g>
            <rect x="130" y="880" width="56" height="40" rx="8" fill="#FFFFFF" stroke={PALETTE.wall} strokeWidth="2.5" />
            <rect x="140" y="888" width="36" height="20" rx="4" fill="#DDE3EA" stroke="#8A919B" strokeWidth="1.5" />
            <line x1="158" y1="888" x2="158" y2="878" stroke={PALETTE.wall} strokeWidth="2.5" />
            <path d="M158 878 h10 l3 6" fill="none" stroke={PALETTE.wall} strokeWidth="2" />
            <line x1="158" y1="908" x2="158" y2="914" stroke="#60A5FA" strokeWidth="2.5" />
            <rect x="200" y="874" width="30" height="46" rx="8" fill="#FFFFFF" stroke={PALETTE.wall} strokeWidth="2.5" />
            <rect x="208" y="882" width="14" height="22" rx="3" fill="#DDE3EA" stroke="#8A919B" strokeWidth="1.5" />
            <rect x="203" y="866" width="24" height="8" rx="4" fill={PALETTE.wall} />
            <path d="M215 866 v-6" stroke={PALETTE.wall} strokeWidth="2" />
            <text
              x="185"
              y="952"
              textAnchor="middle"
              fontSize={16}
              fontWeight={500}
              fill={PALETTE.ink}
              fontFamily={LABEL}
            >
              Water
            </text>
          </g>

          {/* compass — clear of the seat rings, in the right-hand aisle;
              north faces the plan's right edge */}
          <g>
            <circle cx="1180" cy="88" r="17" fill="#FFFFFF" stroke={PALETTE.wall} strokeWidth="2" />
            <path d="M1197 88 L1181 92 L1184 88 L1181 84 Z" fill="#1D4ED8" />
            <path d="M1163 88 L1179 84 L1176 88 L1179 92 Z" fill="#C7CDD6" />
            <text x="1180" y="132" textAnchor="middle" fontSize={13} fontWeight={700} fill={PALETTE.wall} fontFamily={LABEL}>
              N
            </text>
          </g>

          {/* seats */}
          {SEATS.map((def) => (
            <Seat
              key={def.number}
              number={def.number}
              x={def.x}
              y={def.y}
              status={byNumber.get(def.number) ?? "locked"}
              girlsOnly={def.girlsOnly}
              selected={selectedNumber === def.number}
              onPick={onPick}
            />
          ))}
        </svg>
      </PlanViewport>

      {/* legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
        <LegendChip color="#10B981" label="Available" />
        <LegendChip color="#EF4444" label="Occupied" />
        <LegendChip color="#F59E0B" label="Reserved" />
        <LegendChip color="#2563EB" label="Selected" />
        <LegendChip color="#94A3B8" label="Locked" dashed />
        <span className="inline-flex items-center gap-1.5">
          <span className="flex h-3 w-3 items-center justify-center rounded-full border border-rose-300 bg-pink-100 text-[8px] font-bold text-rose-500">
            ♀
          </span>
          Girls-only
        </span>
      </div>
    </div>
  );
}
