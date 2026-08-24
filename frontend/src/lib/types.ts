export type UserRole = "member" | "admin";
export type Gender = "male" | "female" | "other";
export type SeatSection = "male" | "female" | "common";
export type MembershipStatus = "pending_payment" | "pending_cash" | "active" | "expired" | "cancelled";
export type PaymentStatus = "created" | "authorized" | "paid" | "failed" | "refunded";

export interface PaymentStatusResponse {
  payment_status: PaymentStatus;
  membership_status: MembershipStatus;
  activated: boolean;
}

export interface Review {
  id: string;
  name: string;
  display_name: string;
  rating: number;
  atmosphere: number | null;
  facilities: number | null;
  liked_most: string;
  suggestion: string;
  created_at: string;
}

export interface ReviewPayload {
  name?: string;
  rating: number;
  atmosphere?: number | null;
  facilities?: number | null;
  liked_most?: string;
  suggestion?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  aadhar_document?: string | null;
  aadhar_document_url?: string | null;
  photo?: string | null;
  photo_url?: string | null;
  purpose: string;
  class_name: string;
  wifi_device_name: string;
  ip_address?: string;
  role: UserRole;
  is_email_verified: boolean;
  date_joined: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
  message?: string;
}

export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  price: string;
  is_active: boolean;
}

export interface SeatZone {
  id: number;
  code: string;
  name: string;
  description: string;
  sort_order: number;
}

export interface Seat {
  id: number;
  seat_number: string;
  section: SeatSection;
  zone: SeatZone | null;
  grid_col?: number | null;
  grid_row?: number | null;
  is_girls_only?: boolean;
  is_active: boolean;
  available?: boolean;
  selectable?: boolean;
  held?: boolean;
}

export type BookingStatus = "held" | "confirmed" | "cancelled" | "expired";

export interface Booking {
  id: string;
  seat: Seat;
  shift: Shift;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  held_until: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface SeatMapResponse {
  shift: Shift;
  sections: SeatZone[];
  seats: Seat[];
}

export interface Payment {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  amount: string;
  method: string;
  status: PaymentStatus;
  created_at: string;
  paid_at: string | null;
}

export interface Membership {
  id: string;
  shift: Shift;
  seat: Seat | null;
  duration_months: number;
  start_date: string | null;
  end_date: string | null;
  status: MembershipStatus;
  payment_method: "upi" | "cash";
  cash_request_expires_at: string | null;
  amount: string;
  days_left: number | null;
  created_at: string;
  payment: Payment | null;
}

export interface MembershipAdminItem extends Membership {
  member: {
    id: string;
    name: string;
    email: string;
    phone: string;
    gender: Gender;
    aadhar_document_url?: string | null;
    wifi_device_name: string;
    ip_address?: string | null;
  };
  member_name: string;
}

export interface MemberAdminItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  purpose: string;
  class_name: string;
  wifi_device_name: string;
  ip_address?: string | null;
  is_email_verified: boolean;
  date_joined: string;
}

export interface PaymentOrder {
  membership_id: string;
  order_id: string;
  key_id?: string;
  amount: number;
  currency: string;
  requires_remote: boolean;
  mock: boolean;
  already_paid?: boolean;
}

export interface AvailableSeatsResponse {
  shift: Shift;
  seats: Seat[];
}

export interface AdminSummary {
  total_members: number;
  active_memberships: number;
  active_members: number;
  expiring_soon: number;
  pending_payments: number;
  pending_cash_requests: number;
  seats: {
    total: number;
    occupied: number;
    free: number;
    male: { total: number; occupied: number };
    female: { total: number; occupied: number };
    common: { total: number; occupied: number };
  };
  revenue: { today: number; month: number; total: number };
  memberships_by_status: Record<string, number>;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface RecentMembership {
  id: string;
  member_name: string;
  email: string;
  shift: string;
  seat: string | null;
  status: MembershipStatus;
  amount: number;
  created_at: string;
}

export interface ApiError {
  detail?: string;
  code?: string;
  status?: number;
  message?: string;
  fields?: Record<string, string[]>;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  aadhar_document?: File | null;
  photo?: File | null;
  purpose: string;
  class_name: string;
  wifi_device_name: string;
  password: string;
  confirm_password: string;
}
