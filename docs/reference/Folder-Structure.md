# Eventora — Project Folder Structure

## Full-Stack Event & Ticket Management Platform

**Project:** Eventora
**Architecture:** Full Stack
**Frontend:** Next.js + TypeScript
**Backend:** Node.js + Express
**Database:** MongoDB Atlas + Mongoose
**Authentication:** JWT + HTTP-only Cookies
**Payments:** Razorpay
**Email:** EmailJS
**QR Tickets:** QR Code generation
**Deployment:** Vercel + Render

---

# 1. Overall Architecture

Eventora should use a separated frontend/backend architecture.

```text
Eventora/
│
├── frontend/
│
└── backend/
```

The frontend and backend must communicate through REST APIs.

```text
Next.js Frontend
       │
       │ HTTP / REST API
       ▼
Express Backend
       │
       ├── Authentication
       ├── Users
       ├── Events
       ├── Bookings
       ├── Tickets
       ├── Payments
       ├── Reviews
       ├── Notifications
       └── Admin
              │
              ▼
        MongoDB Atlas
```

---

# 2. Root Structure

```text
Eventora/
│
├── frontend/
│
├── backend/
│
├── README.md
├── .gitignore
└── documentation/
```

---

# 3. Frontend Structure

The frontend should use the Next.js App Router.

```text
frontend/
│
├── app/
│
├── components/
│
├── features/
│
├── hooks/
│
├── lib/
│
├── services/
│
├── types/
│
├── utils/
│
├── public/
│
├── styles/
│
├── middleware.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

---

# 4. Next.js App Router

```text
frontend/app/
│
├── layout.tsx
├── page.tsx
├── globals.css
│
├── (public)/
│   ├── events/
│   ├── categories/
│   ├── search/
│   └── organizers/
│
├── (auth)/
│   ├── login/
│   ├── register/
│   ├── verify-otp/
│   ├── forgot-password/
│   └── reset-password/
│
├── (user)/
│   ├── dashboard/
│   ├── bookings/
│   ├── tickets/
│   ├── wishlist/
│   ├── reviews/
│   └── profile/
│
├── (organizer)/
│   └── organizer/
│       ├── dashboard/
│       ├── events/
│       ├── bookings/
│       ├── attendees/
│       └── analytics/
│
├── (admin)/
│   └── admin/
│       ├── dashboard/
│       ├── users/
│       ├── organizers/
│       ├── events/
│       ├── categories/
│       ├── bookings/
│       ├── payments/
│       ├── tickets/
│       ├── reports/
│       └── analytics/
│
├── checkout/
│
├── booking/
│
├── confirmation/
│
├── ticket/
│
└── verify-ticket/
```

---

# 5. Public Event Routes

```text
app/(public)/
│
├── events/
│   ├── page.tsx
│   │
│   └── [slug]/
│       └── page.tsx
│
├── categories/
│   ├── page.tsx
│   │
│   └── [slug]/
│       └── page.tsx
│
├── search/
│   └── page.tsx
│
└── organizers/
    ├── page.tsx
    │
    └── [id]/
        └── page.tsx
```

Example URLs:

```text
/events
/events/future-tech-summit
/categories/technology
/search?q=technology
/organizers/65abc123
```

---

# 6. Authentication Routes

```text
app/(auth)/
│
├── login/
│   └── page.tsx
│
├── register/
│   └── page.tsx
│
├── verify-otp/
│   └── page.tsx
│
├── forgot-password/
│   └── page.tsx
│
└── reset-password/
    └── page.tsx
```

Authentication UI should share reusable components.

---

# 7. User Routes

```text
app/(user)/
│
├── dashboard/
│   └── page.tsx
│
├── bookings/
│   ├── page.tsx
│   │
│   └── [id]/
│       └── page.tsx
│
├── tickets/
│   ├── page.tsx
│   │
│   └── [id]/
│       └── page.tsx
│
├── wishlist/
│   └── page.tsx
│
├── reviews/
│   └── page.tsx
│
└── profile/
    └── page.tsx
```

---

# 8. Organizer Routes

```text
app/(organizer)/organizer/
│
├── layout.tsx
│
├── dashboard/
│   └── page.tsx
│
├── events/
│   ├── page.tsx
│   │
│   ├── create/
│   │   └── page.tsx
│   │
│   └── [id]/
│       ├── page.tsx
│       └── edit/
│           └── page.tsx
│
├── bookings/
│   └── page.tsx
│
├── attendees/
│   └── page.tsx
│
└── analytics/
    └── page.tsx
```

---

# 9. Admin Routes

```text
app/(admin)/admin/
│
├── layout.tsx
│
├── dashboard/
│   └── page.tsx
│
├── users/
│   └── page.tsx
│
├── organizers/
│   └── page.tsx
│
├── events/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
│
├── categories/
│   └── page.tsx
│
├── bookings/
│   └── page.tsx
│
├── payments/
│   └── page.tsx
│
├── tickets/
│   └── page.tsx
│
├── reports/
│   └── page.tsx
│
└── analytics/
    └── page.tsx
```

---

# 10. Frontend Components

Reusable UI components should be placed inside:

```text
frontend/components/
```

Structure:

```text
components/
│
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── Select.tsx
│   ├── Skeleton.tsx
│   ├── Spinner.tsx
│   └── Toast.tsx
│
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Sidebar.tsx
│   ├── MobileNav.tsx
│   └── PageContainer.tsx
│
├── events/
│   ├── EventCard.tsx
│   ├── FeaturedEvent.tsx
│   ├── EventRail.tsx
│   ├── EventFilters.tsx
│   ├── EventSearch.tsx
│   ├── EventMeta.tsx
│   ├── TicketSelector.tsx
│   └── EventGallery.tsx
│
├── booking/
│   ├── BookingSummary.tsx
│   ├── BookingForm.tsx
│   ├── BookingCard.tsx
│   └── BookingStatus.tsx
│
├── ticket/
│   ├── DigitalTicket.tsx
│   ├── TicketQRCode.tsx
│   └── TicketStatus.tsx
│
├── payment/
│   ├── PaymentButton.tsx
│   ├── PaymentSummary.tsx
│   └── PaymentStatus.tsx
│
├── auth/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── OTPForm.tsx
│   └── PasswordResetForm.tsx
│
├── dashboard/
│   ├── StatCard.tsx
│   ├── DashboardHeader.tsx
│   └── RecentActivity.tsx
│
└── charts/
    ├── RevenueChart.tsx
    ├── BookingChart.tsx
    └── EventPerformanceChart.tsx
```

---

# 11. Feature Components

For larger features, use:

```text
frontend/features/
```

Structure:

```text
features/
│
├── auth/
├── events/
├── bookings/
├── tickets/
├── payments/
├── wishlist/
├── reviews/
├── organizer/
├── admin/
└── notifications/
```

Feature-specific components, schemas, helpers and state should stay close to their feature where practical.

---

# 12. API Services

API communication should be centralized.

```text
frontend/services/
│
├── api.ts
├── authService.ts
├── eventService.ts
├── bookingService.ts
├── ticketService.ts
├── paymentService.ts
├── userService.ts
├── organizerService.ts
├── reviewService.ts
├── wishlistService.ts
├── notificationService.ts
└── adminService.ts
```

Do not scatter raw `fetch()` calls throughout every page.

---

# 13. Frontend Types

```text
frontend/types/
│
├── user.ts
├── event.ts
├── booking.ts
├── ticket.ts
├── payment.ts
├── review.ts
├── organizer.ts
├── category.ts
└── api.ts
```

Use TypeScript interfaces/types consistently.

Avoid unnecessary `any`.

---

# 14. Frontend Hooks

```text
frontend/hooks/
│
├── useAuth.ts
├── useUser.ts
├── useEvents.ts
├── useBookings.ts
├── useTickets.ts
├── useWishlist.ts
├── useNotifications.ts
└── useDebounce.ts
```

Hooks should contain reusable client-side logic rather than page-specific UI.

---

# 15. Frontend Utilities

```text
frontend/utils/
│
├── formatCurrency.ts
├── formatDate.ts
├── formatTime.ts
├── validation.ts
├── constants.ts
└── helpers.ts
```

Example:

```text
formatCurrency(999)
→ ₹999
```

---

# 16. Frontend Library Configuration

```text
frontend/lib/
│
├── axios.ts
├── auth.ts
├── razorpay.ts
├── email.ts
└── utils.ts
```

---

# 17. Public Assets

```text
frontend/public/
│
├── images/
│   ├── events/
│   ├── categories/
│   ├── organizers/
│   └── branding/
│
├── icons/
│
└── logos/
```

Do not store secrets inside `public`.

---

# 18. Frontend Environment Variables

```text
frontend/.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

Only values explicitly safe for frontend exposure may use the `NEXT_PUBLIC_` prefix.

Never place:

```text
MongoDB connection strings
JWT secrets
Razorpay secret key
private API keys
```

inside frontend public environment variables.

---

# 19. Backend Structure

```text
backend/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── validators/
├── uploads/
├── server.js
├── package.json
├── .env
└── .gitignore
```

---

# 20. Backend Config

```text
backend/config/
│
├── db.js
├── razorpay.js
└── email.js
```

Responsibilities:

### db.js

MongoDB connection.

### razorpay.js

Razorpay server configuration.

### email.js

Email-related configuration if required.

---

# 21. Backend Models

```text
backend/models/
│
├── User.js
├── Event.js
├── Category.js
├── Booking.js
├── Ticket.js
├── Payment.js
├── Review.js
├── Wishlist.js
└── Notification.js
```

---

# 22. User Model

User model should support:

```text
name
email
password
role
isVerified
profileImage
createdAt
updatedAt
```

Role:

```text
user
organizer
admin
```

Passwords must never be stored in plaintext.

---

# 23. Event Model

Event model may include:

```text
title
slug
description
category
organizer
coverImage
gallery
eventType
date
startTime
endTime
registrationDeadline
venue
address
city
ticketTypes
capacity
status
rules
requirements
faqs
createdAt
updatedAt
```

---

# 24. Booking Model

```text
user
event
ticketType
quantity
amount
paymentStatus
bookingStatus
bookingReference
createdAt
updatedAt
```

---

# 25. Ticket Model

```text
ticketId
booking
user
event
ticketType
qrCode
status
checkedInAt
createdAt
```

Status:

```text
active
used
cancelled
expired
```

---

# 26. Payment Model

```text
booking
user
event
razorpayOrderId
razorpayPaymentId
razorpaySignature
amount
currency
status
createdAt
updatedAt
```

Never expose secret payment information to the client.

---

# 27. Backend Controllers

```text
backend/controllers/
│
├── authController.js
├── userController.js
├── eventController.js
├── categoryController.js
├── bookingController.js
├── ticketController.js
├── paymentController.js
├── reviewController.js
├── wishlistController.js
├── notificationController.js
├── organizerController.js
└── adminController.js
```

Controllers should remain focused on HTTP request/response handling.

Complex reusable business logic should move into services.

---

# 28. Backend Services

```text
backend/services/
│
├── authService.js
├── eventService.js
├── bookingService.js
├── paymentService.js
├── ticketService.js
├── emailService.js
├── notificationService.js
└── analyticsService.js
```

---

# 29. Authentication Middleware

```text
backend/middleware/
│
├── authMiddleware.js
├── roleMiddleware.js
├── errorMiddleware.js
├── uploadMiddleware.js
└── validationMiddleware.js
```

Authentication should use secure HTTP-only cookies.

---

# 30. Routes

```text
backend/routes/
│
├── authRoutes.js
├── userRoutes.js
├── eventRoutes.js
├── categoryRoutes.js
├── bookingRoutes.js
├── ticketRoutes.js
├── paymentRoutes.js
├── reviewRoutes.js
├── wishlistRoutes.js
├── notificationRoutes.js
├── organizerRoutes.js
└── adminRoutes.js
```

---

# 31. API Route Organization

Base URL:

```text
/api
```

Authentication:

```text
/api/auth
```

Users:

```text
/api/users
```

Events:

```text
/api/events
```

Categories:

```text
/api/categories
```

Bookings:

```text
/api/bookings
```

Tickets:

```text
/api/tickets
```

Payments:

```text
/api/payments
```

Reviews:

```text
/api/reviews
```

Wishlist:

```text
/api/wishlist
```

Notifications:

```text
/api/notifications
```

Organizer:

```text
/api/organizer
```

Admin:

```text
/api/admin
```

---

# 32. Authentication Routes

```text
POST /api/auth/register
POST /api/auth/verify-otp
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

---

# 33. Event Routes

```text
GET    /api/events
GET    /api/events/:id
POST   /api/events
PATCH  /api/events/:id
DELETE /api/events/:id
```

Additional routes:

```text
GET /api/events/search
GET /api/events/trending
GET /api/events/recommended
```

Ownership and role checks must be enforced server-side.

---

# 34. Booking Routes

```text
POST   /api/bookings
GET    /api/bookings
GET    /api/bookings/:id
PATCH  /api/bookings/:id/cancel
```

Users should only access their own bookings.

Organizers should only access bookings for their events.

Admins can access platform-wide booking information.

---

# 35. Payment Routes

```text
POST /api/payments/create-order
POST /api/payments/verify
GET  /api/payments/:id
```

Razorpay secret operations must happen on the backend.

---

# 36. Ticket Routes

```text
GET  /api/tickets
GET  /api/tickets/:id
POST /api/tickets/verify
POST /api/tickets/:id/check-in
```

Ticket verification must happen on the server.

---

# 37. Review Routes

```text
POST   /api/reviews
GET    /api/reviews/event/:eventId
PATCH  /api/reviews/:id
DELETE /api/reviews/:id
```

Users can modify only their own reviews.

---

# 38. Wishlist Routes

```text
GET    /api/wishlist
POST   /api/wishlist/:eventId
DELETE /api/wishlist/:eventId
```

---

# 39. Organizer Routes

```text
GET /api/organizer/dashboard
GET /api/organizer/events
GET /api/organizer/bookings
GET /api/organizer/attendees
GET /api/organizer/analytics
```

---

# 40. Admin Routes

```text
GET    /api/admin/dashboard
GET    /api/admin/users
PATCH  /api/admin/users/:id/status

GET    /api/admin/events
PATCH  /api/admin/events/:id/approve
PATCH  /api/admin/events/:id/reject

GET    /api/admin/bookings
GET    /api/admin/payments
GET    /api/admin/tickets

GET    /api/admin/analytics
```

---

# 41. Validation

Validation should exist at the backend level.

Validate:

```text
Authentication data
Event data
Ticket data
Booking data
Payment data
Review data
User data
```

Frontend validation is supplementary only.

---

# 42. Error Handling

Use a centralized backend error handler.

Standard response:

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

Successful response:

```json
{
  "success": true,
  "data": {}
}
```

Avoid exposing stack traces or internal implementation details in production.

---

# 43. Server Entry Point

```text
backend/server.js
```

Responsibilities:

```text
Load environment variables
Initialize Express
Configure middleware
Connect MongoDB
Register routes
Register error handler
Start server
```

---

# 44. Backend Environment Variables

```text
backend/.env
```

Example:

```env
PORT=5000

MONGO_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING

JWT_SECRET=YOUR_SECURE_JWT_SECRET

RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_SECRET

CLIENT_URL=http://localhost:3000

EMAILJS_SERVICE_ID=YOUR_EMAILJS_SERVICE_ID
EMAILJS_TEMPLATE_ID=YOUR_EMAILJS_TEMPLATE_ID
EMAILJS_PUBLIC_KEY=YOUR_EMAILJS_PUBLIC_KEY
```

Actual values must be manually inserted by the developer.

Never commit `.env`.

---

# 45. Documentation Structure

```text
documentation/
│
├── Website-Generation-Prompt.md
├── UI-Reference.md
├── Feature-Specification.md
├── Folder-Structure.md
├── Database-Schema.md
├── API-Specification.md
├── Development-Rules.md
├── Security-Rules.md
└── Deployment-Guide.md
```

---

# 46. Database Documentation

Database-related documentation should describe:

```text
Users
Events
Categories
Bookings
Tickets
Payments
Reviews
Wishlists
Notifications
```

Relationships must be clearly documented.

Example:

```text
User
 │
 ├── Bookings
 ├── Tickets
 ├── Reviews
 └── Wishlist
```

---

# 47. Relationship Architecture

Conceptually:

```text
USER
 │
 ├───────────────┐
 │               │
 ▼               ▼
BOOKING         REVIEW
 │
 ▼
PAYMENT
 │
 ▼
TICKET
 │
 ▼
EVENT
 ▲
 │
ORGANIZER
```

---

# 48. Security Rules

Never store:

```text
Plaintext passwords
JWT secrets in frontend
Razorpay secret key in frontend
MongoDB credentials in frontend
Private API keys in public files
```

Use:

```text
HTTP-only cookies
Password hashing
Role-based authorization
Backend validation
Ownership checks
Secure environment variables
```

---

# 49. Git Structure

Root `.gitignore` must include:

```text
node_modules/
.env
.env.local
.next/
dist/
build/
coverage/
```

Never commit secrets.

---

# 50. Development Principle

The project should be developed in this order:

```text
1. Backend foundation
        ↓
2. MongoDB connection
        ↓
3. Database models
        ↓
4. Authentication
        ↓
5. Event APIs
        ↓
6. Booking APIs
        ↓
7. Razorpay
        ↓
8. Ticket generation
        ↓
9. QR verification
        ↓
10. Admin/Organizer APIs
        ↓
11. Frontend foundation
        ↓
12. Authentication UI
        ↓
13. Event discovery UI
        ↓
14. Booking UI
        ↓
15. Payment UI
        ↓
16. Ticket UI
        ↓
17. Dashboards
        ↓
18. Responsive optimization
        ↓
19. Testing
        ↓
20. Deployment
```

---

# 51. Important Architecture Rule

Do not place the complete backend inside the Next.js frontend unless there is a deliberate architectural reason.

The preferred Eventora architecture is:

```text
Vercel
   │
   ▼
Next.js Frontend
   │
   │ REST API
   ▼
Render
   │
   ▼
Express Backend
   │
   ▼
MongoDB Atlas
```

Razorpay server operations run through the backend.

Authentication is controlled by the backend.

MongoDB is never accessed directly from the browser.

---

# 52. Final Architecture

```text
                         ┌─────────────────────┐
                         │      EVENTORA       │
                         └──────────┬──────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                   │
                  ▼                                   ▼
        ┌───────────────────┐               ┌───────────────────┐
        │ Next.js Frontend  │               │ Express Backend   │
        │     Vercel        │◄──── REST ───►│      Render       │
        └───────────────────┘               └─────────┬─────────┘
                                                      │
                        ┌─────────────────────────────┼────────────────────┐
                        │                             │                    │
                        ▼                             ▼                    ▼
                ┌───────────────┐             ┌──────────────┐     ┌─────────────┐
                │ MongoDB Atlas │             │   Razorpay   │     │   EmailJS   │
                └───────────────┘             └──────────────┘     └─────────────┘
```

This architecture should remain the foundation of the Eventora application unless a later project requirement explicitly requires a change.
