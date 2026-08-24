"use client";

import { motion } from "framer-motion";

import { PALETTE, displaySeatNumber, type FloorplanStatus } from "./SeatData";

export interface SeatProps {
  number: string;
  x: number;
  y: number;
  status: FloorplanStatus;
  girlsOnly?: boolean;
  selected?: boolean;
  onPick?: (number: string) => void;
}

export function Seat({ number, x, y, status, girlsOnly, selected = false, onPick }: SeatProps) {
  const size = 68;
  const sx = x - size / 2;
  const sy = y - size / 2;
  const ring = PALETTE.ring[status];
  const interactive = status === "available" || selected;

  return (
    <motion.g
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
      initial={false}
      animate={{ scale: selected ? 1.06 : 1 }}
      whileHover={interactive ? { scale: 1.05 } : undefined}
      onClick={() => {
        if (interactive) onPick?.(number);
      }}
      className={interactive ? "cursor-pointer" : "cursor-not-allowed"}
      role="button"
      aria-label={`Seat ${displaySeatNumber(number)}${girlsOnly ? " (girls only)" : ""}`}
      aria-disabled={!interactive}
    >
      {/* status ring */}
      <rect
        x={sx - 6}
        y={sy - 6}
        width={size + 12}
        height={size + 12}
        rx={12}
        fill="none"
        stroke={ring}
        strokeWidth={4}
        strokeDasharray={status === "locked" ? "6 5" : undefined}
        opacity={status === "available" && !selected ? 0.85 : 1}
      />

      {/* desk */}
      <rect
        x={sx}
        y={sy}
        width={size}
        height={size}
        rx={9}
        fill={PALETTE.desk}
        stroke={PALETTE.deskBorder}
        strokeWidth={3}
        filter="url(#seatShadow)"
        opacity={status === "occupied" || status === "locked" ? 0.75 : 1}
      />

      {/* seat number */}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={18}
        fontWeight={600}
        fill={PALETTE.ink}
        fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
      >
        {displaySeatNumber(number)}
      </text>

      {/* girls-only marker */}
      {girlsOnly && (
        <text
          x={sx + size - 7}
          y={sy + 12}
          fontSize={12}
          fontWeight={700}
          fill={PALETTE.girls}
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          ♀
        </text>
      )}
    </motion.g>
  );
}
