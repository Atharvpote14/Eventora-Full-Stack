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
  heroImage?: string;
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
  user?: { name: string; email: string } | null;
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

export interface EventPerformance {
  _id: string;
  title: string;
  slug: string;
  date: string;
  status: string;
  ticketsSold: number;
  capacity: number;
  revenue: number;
  bookingsCount: number;
  fillRate: number;
}

export interface OrganizerDashboard {
  totalEvents: number;
  publishedEvents: number;
  pendingEvents: number;
  totalBookings: number;
  ticketsSold: number;
  totalRevenue: number;
  availableCapacity: number;
  upcomingEvents: number;
  recentBookings: Booking[];
  recentEvents: {
    _id: string;
    title: string;
    slug: string;
    date: string;
    city: string;
    status: string;
  }[];
  eventPerformance: EventPerformance[];
}

export interface AnalyticsSeries {
  labels: string[];
  values: number[];
}

export interface OrganizerAnalytics {
  revenue: AnalyticsSeries;
  bookings: AnalyticsSeries;
  ticketsSold: AnalyticsSeries;
  topEvents: { _id: string; title: string; revenue: number; bookings: number }[];
}

export interface OrganizerEventBookings {
  event: {
    _id: string;
    title: string;
    slug: string;
    date: string;
    city: string;
    venue: string;
    ticketTypes: TicketType[];
  };
  bookings: Booking[];
}

export interface AdminDashboard {
  users: number;
  organizers: number;
  events: number;
  bookings: number;
  payments: number;
  revenue: number;
  pendingEvents: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface AdminEvent {
  _id: string;
  title: string;
  slug: string;
  status: string;
  city: string;
  date: string;
  coverImage: string;
  minPrice: number;
  maxPrice: number;
  organizer: { _id: string; name: string; email: string } | null;
  createdAt: string;
}

export interface AdminPayment {
  _id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
  createdAt: string;
}

export interface AdminAnalytics {
  totals: {
    users: number;
    organizers: number;
    events: number;
    bookings: number;
    revenue: number;
  };
  eventsByStatus: { _id: string; count: number }[];
  topCategories: { name: string; slug: string; count: number }[];
}

export interface VerifyResult {
  verified: boolean;
  ticketNumber: string;
  eventTitle: string;
  ticketType: string;
  attendee: string | null;
  checkedInAt: string;
}

export interface EventPayload {
  title: string;
  description: string;
  category: string;
  eventType: string;
  date: string;
  startTime: string;
  endTime?: string;
  registrationDeadline?: string;
  venue: string;
  address: string;
  city: string;
  ticketTypes: { name: string; price: number; capacity: number; description?: string }[];
  coverImage?: string;
  heroImage?: string;
  featured?: boolean;
  gallery?: string[];
  rules?: string[];
  requirements?: string[];
  faqs?: { question: string; answer: string }[];
}