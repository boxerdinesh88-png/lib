export type SeatStatus = "selected" | "available" | "held" | "occupied" | "locked";

export interface MapSeat {
  id: number;
  number: string;
  zone: string;
  gridCol: number;
  gridRow: number;
  isGirlsOnly: boolean;
  status: SeatStatus;
}

export function seatStatusOf(
  seat: { available?: boolean; selectable?: boolean; held?: boolean },
  selectedId: number | null
): SeatStatus {
  if (seat.available === false) {
    return seat.held ? "held" : "occupied";
  }
  if (seat.selectable === false) return "locked";
  if (selectedId != null && "id" in seat && (seat as { id: number }).id === selectedId) {
    return "selected";
  }
  return "available";
}
