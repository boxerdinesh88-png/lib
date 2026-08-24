export type FloorplanStatus = "available" | "occupied" | "reserved" | "selected" | "locked";

export interface SeatDef {
  number: string;
  x: number;
  y: number;
  girlsOnly?: boolean;
}

export const ROOM = { width: 1240, height: 1080, wall: 24 };
export const DESK = { size: 68, gap: 20, face: 36 };

export const PALETTE = {
  floor: "#E6E6E6",
  wall: "#555555",
  desk: "#CFCFCF",
  deskBorder: "#444444",
  ink: "#111111",
  girls: "#EC4899",
  shadow: "rgba(0,0,0,0.15)",
  ring: {
    available: "#10B981",
    occupied: "#EF4444",
    reserved: "#F59E0B",
    selected: "#2563EB",
    locked: "#94A3B8",
  } as Record<FloorplanStatus, string>,
};

export const SEATS: SeatDef[] = [
  // Left wall column — 1, 2, 3, 5 stacked bottom to top
  { number: "05", x: 96, y: 128 },
  { number: "03", x: 96, y: 216 },
  { number: "02", x: 96, y: 304 },
  { number: "01", x: 96, y: 392 },

  // Center upper block — two vertical columns 6–10 (left) and 15–11 (right), facing each other
  { number: "06", x: 540, y: 84 },
  { number: "07", x: 540, y: 172 },
  { number: "08", x: 540, y: 260 },
  { number: "09", x: 540, y: 348 },
  { number: "10", x: 540, y: 436 },
  { number: "15", x: 644, y: 84 },
  { number: "14", x: 644, y: 172 },
  { number: "13", x: 644, y: 260 },
  { number: "12", x: 644, y: 348 },
  { number: "11", x: 644, y: 436 },

  // Right upper wall column — 16..20
  { number: "16", x: 1100, y: 84 },
  { number: "17", x: 1100, y: 172 },
  { number: "18", x: 1100, y: 260 },
  { number: "19", x: 1100, y: 348 },
  { number: "20", x: 1100, y: 436 },

  // Right lower wall column — 21..26 (girls-only)
  { number: "21", x: 1100, y: 580, girlsOnly: true },
  { number: "22", x: 1100, y: 668, girlsOnly: true },
  { number: "23", x: 1100, y: 756, girlsOnly: true },
  { number: "24", x: 1100, y: 844, girlsOnly: true },
  { number: "25", x: 1100, y: 932, girlsOnly: true },
  { number: "26", x: 1100, y: 1020, girlsOnly: true },

  // Bottom center block — two vertical columns 32–36 (left) and 31–27 (right, girls-only)
  { number: "32", x: 540, y: 624 },
  { number: "33", x: 540, y: 712 },
  { number: "34", x: 540, y: 800 },
  { number: "35", x: 540, y: 888 },
  { number: "36", x: 540, y: 976 },
  { number: "31", x: 644, y: 624, girlsOnly: true },
  { number: "30", x: 644, y: 712, girlsOnly: true },
  { number: "29", x: 644, y: 800, girlsOnly: true },
  { number: "28", x: 644, y: 888, girlsOnly: true },
  { number: "27", x: 644, y: 976, girlsOnly: true },
];

export function displaySeatNumber(number: string): string {
  return String(Number(number));
}
