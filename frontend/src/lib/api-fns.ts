import { api, isNoResponseError } from "@/lib/api";
import type {
  AdminSummary,
  AvailableSeatsResponse,
  Booking,
  MemberAdminItem,
  Membership,
  MembershipAdminItem,
  PaymentOrder,
  PaymentStatusResponse,
  RecentMembership,
  RegisterPayload,
  Review,
  ReviewPayload,
  RevenuePoint,
  Seat,
  SeatMapResponse,
  Shift,
  User,
} from "@/lib/types";

function unwrap<T>(data: T | { results: T }): T {
  if (data && typeof data === "object" && "results" in data) {
    return (data as { results: T }).results;
  }
  return data as T;
}

// ------------------------------------------------------------------ Auth
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function register(payload: RegisterPayload) {
  const hasFile = Object.values(payload).some((v) => v instanceof File);
  const doPost = () => {
    if (hasFile) {
      // Send files as base64 data URLs in a plain JSON body instead of
      // multipart — mobile networks/browsers sometimes drop multipart POSTs
      // mid-flight (shows up as ERR_NETWORK) while plain JSON sails through.
      const body: Record<string, string> = {};
      return Promise.all(
        Object.entries(payload).map(async ([key, value]) => {
          if (value === undefined || value === null) return;
          body[key] = value instanceof File ? await fileToDataUrl(value) : String(value);
        })
      ).then(() => api.post("/auth/register/", body, { timeout: 120000 }));
    }
    return api.post("/auth/register/", payload, { timeout: 120000 });
  };

  try {
    const r = await doPost();
    return r.data;
  } catch (err) {
    // Free-tier PythonAnywhere sleeps the app after idle; the first request
    // while it boots can have its connection dropped before it is processed.
    // That arrives here as a "no response" error — retry with a short backoff
    // a few times so the wake-up window is covered.
    if (isNoResponseError(err)) {
      for (const wait of [1500, 3000, 5000, 7000]) {  // Added one more retry for FREE plan
        await new Promise((resolve) => setTimeout(resolve, wait));
        try {
          const r = await doPost();
          return r.data;
        } catch {
          // keep retrying while the backend wakes up
        }
      }
    }
    throw err;
  }
}

export function login(email: string, password: string) {
  return api.post("/auth/login/", { email, password }).then((r) => r.data);
}

export function logout(refresh: string) {
  return api.post("/auth/logout/", { refresh }).then((r) => r.data);
}

export function fetchProfile() {
  return api.get<User>("/auth/profile/").then((r) => r.data);
}

export function updateProfile(payload: Partial<User> | FormData) {
  return api.patch<User>("/auth/profile/", payload).then((r) => r.data);
}

export function changePassword(old_password: string, new_password: string) {
  return api.post("/auth/change-password/", { old_password, new_password }).then((r) => r.data);
}

export function requestOtp(email: string) {
  return api.post("/auth/otp/request/", { email }).then((r) => r.data);
}

export function verifyOtp(email: string, code: string, purpose: "verify_email" | "reset_password") {
  return api.post("/auth/otp/verify/", { email, code, purpose }).then((r) => r.data);
}

export function forgotPassword(email: string) {
  return api.post("/auth/forgot-password/", { email }).then((r) => r.data);
}

export function resetPassword(email: string, code: string, new_password: string) {
  return api.post("/auth/reset-password/", { email, code, new_password }).then((r) => r.data);
}

// ------------------------------------------------------------- Public catalog
const SHIFTS_CACHE_KEY = "libseat_shifts_cache";
const SHIFTS_CACHE_TTL = 24 * 60 * 60 * 1000;

export const DEFAULT_SHIFTS: Shift[] = [
  { id: -1, name: "06:00 AM – 10:00 AM", start_time: "06:00", end_time: "10:00", price: "250", is_active: true },
  { id: -2, name: "10:00 AM – 02:00 PM", start_time: "10:00", end_time: "14:00", price: "300", is_active: true },
  { id: -3, name: "02:00 PM – 06:00 PM", start_time: "14:00", end_time: "18:00", price: "300", is_active: true },
  { id: -4, name: "06:00 PM – 10:00 PM", start_time: "18:00", end_time: "22:00", price: "300", is_active: true },
  { id: -5, name: "06:00 AM – 02:00 PM", start_time: "06:00", end_time: "14:00", price: "500", is_active: true },
  { id: -6, name: "02:00 PM – 10:00 PM", start_time: "14:00", end_time: "22:00", price: "550", is_active: true },
  { id: -7, name: "06:00 AM – 10:00 PM", start_time: "06:00", end_time: "22:00", price: "1000", is_active: true },
];

function readShiftsCache(): Shift[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SHIFTS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: Shift[]; fetchedAt: number };
    if (Date.now() - parsed.fetchedAt > SHIFTS_CACHE_TTL) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeShiftsCache(data: Shift[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SHIFTS_CACHE_KEY,
      JSON.stringify({ data, fetchedAt: Date.now() })
    );
  } catch {
    // ignore quota/private-mode errors
  }
}

export function getCachedShifts(): Shift[] {
  return readShiftsCache() ?? [];
}

export function fetchShifts() {
  return api
    .get<Shift[]>("/shifts/")
    .then((r) => unwrap<Shift[]>(r.data))
    .then((shifts) => {
      writeShiftsCache(shifts);
      return shifts;
    });
}

// ----------------------------------------------------------------- Seats
export function fetchAvailableSeats(params: {
  shift: number | string;
  gender?: string;
  start_date?: string;
  end_date?: string;
}) {
  return api.get<AvailableSeatsResponse>("/seats/available/", { params }).then((r) => r.data);
}

export function fetchSeatMap(params: {
  shift: number | string;
  start_date?: string;
  end_date?: string;
}) {
  return api.get<SeatMapResponse>("/seats/map/", { params }).then((r) => r.data);
}

// ----------------------------------------------------------------- Bookings
export function holdSeat(payload: {
  seat: number | string;
  shift: number | string;
  start_date?: string;
  end_date?: string;
}) {
  return api.post<Booking>("/bookings/hold/", payload).then((r) => r.data);
}

export function confirmBooking(bookingId: string) {
  return api.post<Booking>("/bookings/confirm/", { booking_id: bookingId }).then((r) => r.data);
}

export function cancelBooking(bookingId: string) {
  return api.post<Booking>("/bookings/cancel/", { booking_id: bookingId }).then((r) => r.data);
}

export function fetchMyBookings() {
  return api.get<Booking[]>("/bookings/my/").then((r) => r.data);
}

// ---------------------------------------------------------------- Reviews
export function fetchReviews() {
  return api.get<Review[]>("/reviews/").then((r) => r.data);
}

export function submitReview(payload: ReviewPayload) {
  return api.post<Review>("/reviews/", payload).then((r) => r.data);
}

// ------------------------------------------------------------- Memberships
export function createMembership(payload: {
  shift: number | string;
  seat?: number | string | null;
  duration_months?: number;
}) {
  return api.post<Membership>("/memberships/", payload).then((r) => r.data);
}

export function fetchMyMemberships() {
  return api.get<Membership[]>("/memberships/my/").then((r) => r.data);
}

export function fetchMembership(id: string) {
  return api.get<Membership>(`/memberships/${id}/`).then((r) => r.data);
}

export function createPaymentOrder(membershipId: string) {
  return api.post<PaymentOrder>(`/memberships/${membershipId}/create_payment_order/`).then((r) => r.data);
}

export function verifyPayment(
  membershipId: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  razorpay_order_id?: string
) {
  return api
    .post<{ membership: Membership; message: string }>(
      `/memberships/${membershipId}/verify_payment/`,
      { razorpay_payment_id, razorpay_signature, razorpay_order_id }
    )
    .then((r) => r.data);
}

export function fetchPaymentStatus(membershipId: string, refresh = false) {
  return api
    .get<PaymentStatusResponse>(`/memberships/${membershipId}/payment_status/`, {
      params: refresh ? { refresh: 1 } : undefined,
    })
    .then((r) => r.data);
}

export function requestCashPayment(membershipId: string) {
  return api
    .post<Membership>(`/memberships/${membershipId}/request_cash/`)
    .then((r) => r.data);
}

export function selectSeat(membershipId: string, seatId: number | string) {
  return api.post<Membership>(`/memberships/${membershipId}/select_seat/`, { seat_id: seatId }).then((r) => r.data);
}

// ------------------------------------------------------------- Admin
export function fetchAdminSummary() {
  return api.get<AdminSummary>("/admin/dashboard/").then((r) => r.data);
}

export function fetchRevenue() {
  return api.get<RevenuePoint[]>("/admin/dashboard/revenue/").then((r) => r.data);
}

export function fetchRecentMemberships() {
  return api.get<RecentMembership[]>("/admin/dashboard/recent/").then((r) => r.data);
}

export function fetchAdminMembers(params: Record<string, string> = {}) {
  return api.get<MemberAdminItem[]>("/admin/dashboard/members/", { params }).then((r) => unwrap<MemberAdminItem[]>(r.data));
}

export function fetchAdminMemberships(params: Record<string, string> = {}) {
  return api.get<MembershipAdminItem[]>("/admin/memberships/", { params }).then((r) => unwrap<MembershipAdminItem[]>(r.data));
}

export function adminUpdateMembership(
  id: string,
  payload: { status?: string; seat_id?: string | null } & Record<string, unknown>
) {
  return api.patch<MembershipAdminItem>(`/admin/memberships/${id}/`, payload).then((r) => r.data);
}

export function adminExportMemberships() {
  return api
    .get("/admin/memberships/export/", { responseType: "blob" })
    .then((r) => r.data as Blob);
}

export function fetchAdminSeats() {
  return api.get<Seat[]>("/admin/seats/").then((r) => unwrap<Seat[]>(r.data));
}

export function fetchAdminShifts() {
  return api.get<Shift[]>("/admin/shifts/").then((r) => unwrap<Shift[]>(r.data));
}
