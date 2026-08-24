"use client";

import { create } from "zustand";

import type { Membership, Seat, Shift } from "@/lib/types";

interface MembershipState {
  shifts: Shift[];
  selectedShift: Shift | null;
  durationMonths: number;
  seats: Seat[];
  selectedSeat: Seat | null;
  current: Membership | null;
  loading: boolean;

  setShifts: (shifts: Shift[]) => void;
  setSelectedShift: (shift: Shift) => void;
  setDurationMonths: (months: number) => void;
  setSeats: (seats: Seat[]) => void;
  setSelectedSeat: (seat: Seat | null) => void;
  setCurrent: (membership: Membership | null) => void;
  setLoading: (loading: boolean) => void;
  resetPurchase: () => void;
}

export const useMembershipStore = create<MembershipState>((set) => ({
  shifts: [],
  selectedShift: null,
  durationMonths: 1,
  seats: [],
  selectedSeat: null,
  current: null,
  loading: false,

  setShifts: (shifts) => set({ shifts }),
  setSelectedShift: (shift) =>
    set({ selectedShift: shift, selectedSeat: null }),
  setDurationMonths: (durationMonths) => set({ durationMonths }),
  setSeats: (seats) =>
    set((state) => {
      if (state.seats === seats) return state;
      const identical =
        state.seats.length === seats.length &&
        state.seats.every(
          (s, i) =>
            s.id === seats[i].id &&
            s.available === seats[i].available &&
            s.held === seats[i].held
        );
      return identical ? state : { seats };
    }),
  setSelectedSeat: (seat) => set({ selectedSeat: seat }),
  setCurrent: (membership) => set({ current: membership }),
  setLoading: (loading) => set({ loading }),
  resetPurchase: () =>
    set({
      selectedShift: null,
      selectedSeat: null,
      durationMonths: 1,
      current: null,
      seats: [],
    }),
}));
