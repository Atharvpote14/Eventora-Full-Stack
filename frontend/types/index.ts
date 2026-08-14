export type Role = "user" | "organizer" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  city?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  image?: string;
  eventCount: number;
}

export interface TicketType {
  _id: string;
  name: string;
  price: number;
  capacity: number;
  sold: number;
  perks?: string[];
  description?: string;
}

export interface EventListItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: string | { _id: string; name: string; slug: string } | null;
  eventType: "physical" | "online" | "hybrid";
  city: string;
  venue: string;
  date: string;
  startTime: string;
  coverImage: string;
  minPrice: number;
  maxPrice: number;
  status: string;
}

export interface RatingSummary {
  averageRating: number;
  reviewCount: number;
}

export interface EventDetail extends EventListItem {
  organizer: string;
  address?: string;
  endTime?: string;
  registrationDeadline?: string;
  gallery: string[];
  ticketTypes: TicketType[];
  capacity: number;
  rules?: string[];
  requirements?: string[];
  faqs?: { question: string; answer: string }[];
  featured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventDetailResponse {
  event: EventDetail;
  ratingSummary: RatingSummary;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface BookingEventLite {
  _id: string;
  title: string;
  slug: string;
  coverImage: string;
  date: string;
  city: string;
  venue: string;
  startTime?: string;
  address?: string;
  organizer?: string;
}

export interface Booking {
  _id: string;
  reference: string;
  event: BookingEventLite;
  ticketType: { _id: string; name: string; price: number };
  quantity: number;
  unitPrice: number;
  subtotal: number;
  fees: number;
  total: number;
  bookingStatus: "pending" | "confirmed" | "cancelled" | "expired" | "refunded";
  paymentStatus:
    | "pending"
    | "created"
    | "paid"
    | "failed"
    | "refunded"
    | "refund_requested";
  expiresAt: string | null;
  bookingDate?: string;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  ticketNumber: string;
  bookingReference: string | null;
  event: {
    _id: string;
    title: string;
    date: string;
    time?: string;
    venue: string;
    city: string;
    slug: string;
  } | null;
  ticketType: string;
  user: { name: string; email: string } | null;
  status: "active" | "used" | "cancelled" | "expired";
  checkedInAt: string | null;
  qrCode: string;
  qrCodeImage: string;
}

export interface Review {
  _id: string;
  event: string;
  rating: number;
  comment: string;
  user: { _id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "booking" | "payment" | "event" | "system";
  isRead: boolean;
  referenceId?: string;
  createdAt: string;
}

export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  paymentId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}

export interface WishlistItem {
  _id: string;
  event: {
    _id: string;
    title: string;
    slug: string;
    date: string;
    city: string;
    venue: string;
    coverImage: string;
  };
  createdAt: string;
}

export interface EventQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  city?: string;
  date?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}