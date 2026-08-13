# Eventora — API Documentation & Integration Specification

## 1. API Overview

Eventora uses a RESTful API.

Base URL during development:

```text
http://localhost:5000/api
```

Production:

```text
https://YOUR-BACKEND-DOMAIN/api
```

Frontend must never hardcode the production URL.

Use:

```env
NEXT_PUBLIC_API_URL=
```

---

# 2. API Response Convention

All APIs should follow a consistent structure.

### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

---

# 3. Authentication

Authentication uses JWT stored in an HTTP-only cookie.

Cookie name:

```text
token
```

Frontend should send requests with credentials.

Axios:

```js
withCredentials: true
```

The frontend should never read the JWT directly.

---

# 4. Auth Endpoints

## Register

```http
POST /auth/register
```

### Body

```json
{
  "name": "Atharv Pote",
  "email": "atharv@example.com",
  "password": "Password@123"
}
```

### Success

```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "_id": "USER_ID",
      "name": "Atharv Pote",
      "email": "atharv@example.com",
      "role": "user",
      "isVerified": false
    }
  }
}
```

---

# 5. Verify OTP

```http
POST /auth/verify-otp
```

### Body

```json
{
  "email": "atharv@example.com",
  "otp": "123456"
}
```

### Success

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

# 6. Resend OTP

```http
POST /auth/resend-otp
```

### Body

```json
{
  "email": "atharv@example.com"
}
```

---

# 7. Login

```http
POST /auth/login
```

### Body

```json
{
  "email": "atharv@example.com",
  "password": "Password@123"
}
```

### Success

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "USER_ID",
      "name": "Atharv Pote",
      "email": "atharv@example.com",
      "role": "user",
      "isVerified": true
    }
  }
}
```

The server sets the HTTP-only JWT cookie.

---

# 8. Logout

```http
POST /auth/logout
```

Authentication required.

### Response

```json
{
  "success": true,
  "message": "Logout successful"
}
```

Server clears the authentication cookie.

---

# 9. Current User

```http
GET /auth/me
```

Authentication required.

### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "USER_ID",
      "name": "Atharv Pote",
      "email": "atharv@example.com",
      "role": "user",
      "isVerified": true
    }
  }
}
```

Frontend should use this endpoint to restore authentication state after page refresh.

---

# 10. Forgot Password

```http
POST /auth/forgot-password
```

### Body

```json
{
  "email": "atharv@example.com"
}
```

Send a password-reset OTP/link through email.

---

# 11. Reset Password

```http
POST /auth/reset-password
```

### Body

```json
{
  "email": "atharv@example.com",
  "otp": "123456",
  "newPassword": "NewPassword@123"
}
```

---

# 12. User Profile

## Get Profile

```http
GET /users/me
```

Authentication required.

---

## Update Profile

```http
PUT /users/me
```

Authentication required.

### Body

```json
{
  "name": "Atharv Pote",
  "phone": "9876543210"
}
```

Do not allow users to change:

```text
role
isAdmin
passwordHash
```

through this endpoint.

---

# 13. Change Password

```http
PUT /users/me/password
```

Authentication required.

### Body

```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@123"
}
```

---

# 14. Event Endpoints

Base:

```text
/events
```

---

# 15. Get Events

```http
GET /events
```

Public.

### Query Parameters

```text
?page=1
&limit=12
&search=music
&category=concert
&city=Pune
&date=2026-08-20
&minPrice=0
&maxPrice=5000
&sort=date_asc
```

---

# 16. Event List Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "EVENT_ID",
      "title": "Pune Music Festival",
      "slug": "pune-music-festival",
      "description": "A live music experience.",
      "category": "music",
      "city": "Pune",
      "venue": "Venue Name",
      "date": "2026-08-20T18:00:00.000Z",
      "image": "https://...",
      "minPrice": 499,
      "maxPrice": 1999,
      "status": "published"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "pages": 5
  }
}
```

---

# 17. Featured Events

```http
GET /events/featured
```

Public.

Return a curated list of featured events.

---

# 18. Upcoming Events

```http
GET /events/upcoming
```

Public.

Return upcoming published events.

---

# 19. Popular Events

```http
GET /events/popular
```

Public.

Popularity can be calculated using:

```text
bookings
tickets sold
views
wishlist count
```

Do not use fake values.

---

# 20. Event Categories

```http
GET /categories
```

Public.

### Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "CATEGORY_ID",
      "name": "Music",
      "slug": "music",
      "image": "https://..."
    }
  ]
}
```

---

# 21. Get Event Details

```http
GET /events/:id
```

Public.

Alternative SEO route:

```http
GET /events/slug/:slug
```

---

# 22. Event Details Response

```json
{
  "success": true,
  "data": {
    "_id": "EVENT_ID",
    "title": "Pune Music Festival",
    "slug": "pune-music-festival",
    "description": "Complete event description.",
    "category": {},
    "organizer": {
      "_id": "ORGANIZER_ID",
      "name": "Eventora Events"
    },
    "venue": {
      "name": "Venue Name",
      "address": "Pune",
      "city": "Pune"
    },
    "date": "2026-08-20T18:00:00.000Z",
    "images": [],
    "ticketTypes": [],
    "status": "published"
  }
}
```

Do not expose organizer private information.

---

# 23. Create Event

```http
POST /events
```

Authentication:

```text
Organizer
```

### Body

```json
{
  "title": "Future Tech Summit",
  "description": "Technology conference.",
  "category": "CATEGORY_ID",
  "date": "2026-09-20T10:00:00.000Z",
  "venue": {
    "name": "Convention Center",
    "address": "Pune",
    "city": "Pune"
  },
  "ticketTypes": [
    {
      "name": "General",
      "price": 499,
      "quantity": 500
    },
    {
      "name": "VIP",
      "price": 1499,
      "quantity": 100
    }
  ]
}
```

Backend automatically sets:

```text
organizer = authenticated user
```

Never accept arbitrary organizer IDs from the frontend.

---

# 24. Update Event

```http
PUT /events/:id
```

Authentication:

```text
Organizer
```

Backend must verify ownership.

If another organizer attempts the request:

```text
403 Forbidden
```

---

# 25. Delete Event

```http
DELETE /events/:id
```

Authentication:

```text
Organizer/Admin
```

Ownership must be verified.

---

# 26. Publish Event

```http
PATCH /events/:id/publish
```

Organizer must own the event.

---

# 27. Cancel Event

```http
PATCH /events/:id/cancel
```

Organizer/Admin.

When an event is cancelled:

```text
event.status = cancelled
```

Affected customers should receive an email/notification.

---

# 28. Wishlist

## Get Wishlist

```http
GET /wishlist
```

Authentication required.

---

## Add Event

```http
POST /wishlist/:eventId
```

Authentication required.

---

## Remove Event

```http
DELETE /wishlist/:eventId
```

Authentication required.

---

# 29. Booking Endpoints

## Create Booking

```http
POST /bookings
```

Authentication required.

### Body

```json
{
  "eventId": "EVENT_ID",
  "ticketTypeId": "TICKET_TYPE_ID",
  "quantity": 2
}
```

The backend calculates:

```text
ticket price
subtotal
fees
total
```

Do not trust frontend price values.

---

# 30. Booking Response

```json
{
  "success": true,
  "data": {
    "booking": {
      "_id": "BOOKING_ID",
      "reference": "EVT-8H72KD",
      "event": {},
      "ticketType": {},
      "quantity": 2,
      "subtotal": 998,
      "fees": 50,
      "total": 1048,
      "status": "pending",
      "paymentStatus": "pending"
    }
  }
}
```

---

# 31. Get My Bookings

```http
GET /bookings/my
```

Authentication required.

Never return bookings belonging to another user.

---

# 32. Get Booking

```http
GET /bookings/:id
```

Authentication required.

User must own the booking.

Organizer/Admin may access where appropriate.

---

# 33. Cancel Booking

```http
PATCH /bookings/:id/cancel
```

Authentication required.

Verify cancellation policy before allowing cancellation.

---

# 34. Organizer Event Bookings

```http
GET /organizer/events/:eventId/bookings
```

Authentication:

```text
Organizer
```

Backend must verify event ownership.

---

# 35. Razorpay — Create Order

```http
POST /payments/create-order
```

Authentication required.

### Body

```json
{
  "bookingId": "BOOKING_ID"
}
```

Backend retrieves booking from MongoDB and calculates/validates amount.

Backend creates Razorpay order.

---

# 36. Razorpay Order Response

```json
{
  "success": true,
  "data": {
    "orderId": "order_xxxxxxxxx",
    "amount": 104800,
    "currency": "INR",
    "keyId": "rzp_test_xxxxxxxxx"
  }
}
```

`amount` is in paise.

Never return:

```text
RAZORPAY_KEY_SECRET
```

---

# 37. Verify Razorpay Payment

```http
POST /payments/verify
```

Authentication required.

### Body

```json
{
  "bookingId": "BOOKING_ID",
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature"
}
```

Backend must verify the Razorpay signature.

Only after successful verification:

```text
booking.status = confirmed
paymentStatus = paid
```

---

# 38. Payment Failure

```http
POST /payments/failure
```

Authentication required.

Store useful payment failure information.

Do not expose sensitive gateway information unnecessarily.

---

# 39. Payment History

```http
GET /payments/my
```

Authentication required.

Return only the current user's payment records.

---

# 40. Tickets

## Get My Tickets

```http
GET /tickets/my
```

Authentication required.

---

# 41. Get Ticket

```http
GET /tickets/:id
```

Authentication required.

Ticket owner or authorized organizer/admin only.

---

# 42. Ticket Response

```json
{
  "success": true,
  "data": {
    "_id": "TICKET_ID",
    "ticketNumber": "EVT-TKT-82937",
    "bookingReference": "EVT-8H72KD",
    "event": {},
    "ticketType": "VIP",
    "user": {
      "name": "Atharv Pote"
    },
    "status": "active",
    "qrCode": "..."
  }
}
```

---

# 43. Verify Ticket

```http
POST /tickets/verify
```

Authentication:

```text
Organizer/Admin
```

### Body

```json
{
  "ticketNumber": "EVT-TKT-82937"
}
```

Backend verifies:

```text
ticket exists
event belongs to organizer
ticket is active
event is valid
```

---

# 44. Check-In Ticket

```http
POST /tickets/:id/check-in
```

Authentication:

```text
Organizer/Admin
```

After successful check-in:

```text
status = used
checkedInAt = current timestamp
```

A used ticket cannot be checked in again.

---

# 45. Reviews

## Get Event Reviews

```http
GET /events/:eventId/reviews
```

Public.

---

# 46. Create Review

```http
POST /events/:eventId/reviews
```

Authentication required.

### Body

```json
{
  "rating": 5,
  "comment": "Amazing event!"
}
```

Backend verifies user eligibility.

---

# 47. Update Review

```http
PUT /reviews/:id
```

Authentication required.

Only review owner can update.

---

# 48. Delete Review

```http
DELETE /reviews/:id
```

Authentication required.

Only review owner or authorized admin can delete.

---

# 49. Notifications

## Get Notifications

```http
GET /notifications
```

Authentication required.

---

## Unread Count

```http
GET /notifications/unread-count
```

Authentication required.

---

## Mark Notification Read

```http
PATCH /notifications/:id/read
```

Authentication required.

---

## Mark All Read

```http
PATCH /notifications/read-all
```

Authentication required.

---

# 50. Organizer Dashboard

```http
GET /organizer/dashboard
```

Authentication:

```text
Organizer
```

### Response

```json
{
  "success": true,
  "data": {
    "totalEvents": 12,
    "publishedEvents": 9,
    "ticketsSold": 1820,
    "totalBookings": 840,
    "totalRevenue": 1450000,
    "upcomingEvents": 4
  }
}
```

All numbers must be calculated from actual database records.

---

# 51. Organizer Analytics

```http
GET /organizer/analytics
```

Authentication:

```text
Organizer
```

Possible query:

```text
?period=30d
```

Return data suitable for charts.

Example:

```json
{
  "success": true,
  "data": {
    "revenue": [],
    "bookings": [],
    "ticketsSold": [],
    "topEvents": []
  }
}
```

---

# 52. Organizer Attendees

```http
GET /organizer/events/:eventId/attendees
```

Authentication:

```text
Organizer
```

Ownership required.

---

# 53. Admin — Dashboard

```http
GET /admin/dashboard
```

Authentication:

```text
Admin
```

Return:

```text
users
organizers
events
bookings
payments
revenue
pendingEvents
```

---

# 54. Admin — Users

## Get Users

```http
GET /admin/users
```

Support:

```text
?page=1
&limit=20
&search=
&role=
```

---

## Get User

```http
GET /admin/users/:id
```

---

## Change User Role

```http
PATCH /admin/users/:id/role
```

### Body

```json
{
  "role": "organizer"
}
```

Allowed roles:

```text
user
organizer
admin
```

---

# 55. Admin — Events

## Get All Events

```http
GET /admin/events
```

---

## Approve Event

```http
PATCH /admin/events/:id/approve
```

---

## Reject Event

```http
PATCH /admin/events/:id/reject
```

---

## Delete Event

```http
DELETE /admin/events/:id
```

---

# 56. Admin — Bookings

```http
GET /admin/bookings
```

Support pagination and filters.

---

# 57. Admin — Payments

```http
GET /admin/payments
```

Support:

```text
status
date
search
pagination
```

---

# 58. Admin — Analytics

```http
GET /admin/analytics
```

Return:

```text
user growth
event growth
booking growth
revenue
popular categories
popular cities
```

---

# 59. API Authentication Matrix

| API Area            | Guest | User | Organizer | Admin |
| ------------------- | ----: | ---: | --------: | ----: |
| View events         |     ✅ |    ✅ |         ✅ |     ✅ |
| Search events       |     ✅ |    ✅ |         ✅ |     ✅ |
| View event          |     ✅ |    ✅ |         ✅ |     ✅ |
| Wishlist            |     ❌ |    ✅ |         ✅ |     ✅ |
| Book tickets        |     ❌ |    ✅ |         ✅ |     ✅ |
| Payment             |     ❌ |    ✅ |         ✅ |     ✅ |
| My bookings         |     ❌ |    ✅ |         ✅ |     ✅ |
| My tickets          |     ❌ |    ✅ |         ✅ |     ✅ |
| Create event        |     ❌ |    ❌ |         ✅ |     ✅ |
| Edit owned event    |     ❌ |    ❌ |         ✅ |     ✅ |
| Edit other's event  |     ❌ |    ❌ |         ❌ |     ✅ |
| Organizer analytics |     ❌ |    ❌ |         ✅ |     ✅ |
| Admin dashboard     |     ❌ |    ❌ |         ❌ |     ✅ |
| User management     |     ❌ |    ❌ |         ❌ |     ✅ |

---

# 60. Frontend API Service Structure

Create service modules.

Example:

```text
services/
├── auth.service.ts
├── event.service.ts
├── booking.service.ts
├── payment.service.ts
├── ticket.service.ts
├── review.service.ts
├── wishlist.service.ts
├── notification.service.ts
├── organizer.service.ts
└── admin.service.ts
```

---

# 61. Auth Service Example

```ts
login(data)
register(data)
verifyOtp(data)
resendOtp(data)
logout()
getCurrentUser()
forgotPassword(data)
resetPassword(data)
```

---

# 62. Event Service Example

```ts
getEvents(params)
getFeaturedEvents()
getUpcomingEvents()
getPopularEvents()
getEventById(id)
getEventBySlug(slug)
createEvent(data)
updateEvent(id, data)
deleteEvent(id)
publishEvent(id)
cancelEvent(id)
```

---

# 63. Booking Service Example

```ts
createBooking(data)
getMyBookings(params)
getBooking(id)
cancelBooking(id)
getOrganizerBookings(eventId, params)
```

---

# 64. Payment Service Example

```ts
createOrder(bookingId)
verifyPayment(data)
getMyPayments(params)
```

---

# 65. Ticket Service Example

```ts
getMyTickets(params)
getTicket(id)
verifyTicket(ticketNumber)
checkInTicket(ticketId)
```

---

# 66. Review Service Example

```ts
getEventReviews(eventId, params)
createReview(eventId, data)
updateReview(id, data)
deleteReview(id)
```

---

# 67. Wishlist Service Example

```ts
getWishlist()
addToWishlist(eventId)
removeFromWishlist(eventId)
```

---

# 68. Notification Service Example

```ts
getNotifications(params)
getUnreadCount()
markAsRead(id)
markAllAsRead()
```

---

# 69. Organizer Service Example

```ts
getDashboard()
getAnalytics(params)
getEventBookings(eventId, params)
getAttendees(eventId, params)
```

---

# 70. Admin Service Example

```ts
getDashboard()
getUsers(params)
getUser(id)
changeUserRole(id, role)
getEvents(params)
approveEvent(id)
rejectEvent(id)
deleteEvent(id)
getBookings(params)
getPayments(params)
getAnalytics(params)
```

---

# 71. Frontend Error Handling

API errors should be converted into user-friendly messages.

Example:

Backend:

```json
{
  "success": false,
  "message": "Ticket quantity exceeds available inventory"
}
```

Frontend:

```text
Only 3 tickets are currently available.
```

Do not expose raw backend errors unnecessarily.

---

# 72. Authentication Error Handling

If API returns:

```text
401 Unauthorized
```

frontend should:

```text
clear user state
redirect to login when appropriate
```

Do not redirect automatically when the user is simply browsing a public page.

---

# 73. Authorization Error Handling

If API returns:

```text
403 Forbidden
```

show:

```text
You don't have permission to perform this action.
```

Do not expose internal authorization logic.

---

# 74. Network Error Handling

If backend is unavailable:

```text
Unable to connect to Eventora server.
Please try again.
```

Provide retry where appropriate.

---

# 75. Payment Error Handling

Payment errors should distinguish:

```text
Payment cancelled
Payment failed
Verification failed
Booking expired
Tickets unavailable
```

Do not simply display:

```text
Something went wrong
```

for every payment failure.

---

# 76. Booking Flow

The complete frontend flow should be:

```text
Event Details
     ↓
Select Ticket
     ↓
Select Quantity
     ↓
Review Order
     ↓
Create Booking
     ↓
Create Razorpay Order
     ↓
Open Razorpay Checkout
     ↓
Payment
     ↓
Verify Payment
     ↓
Confirm Booking
     ↓
Generate/Display Ticket
     ↓
Send Confirmation Email
```

---

# 77. Registration Flow

```text
Register
   ↓
OTP Email
   ↓
Verify OTP
   ↓
Account Activated
   ↓
Login
   ↓
Dashboard
```

---

# 78. Organizer Event Flow

```text
Organizer Login
      ↓
Organizer Dashboard
      ↓
Create Event
      ↓
Save Draft
      ↓
Submit/Publish
      ↓
Admin Approval if enabled
      ↓
Published Event
      ↓
Users Book Tickets
      ↓
Organizer Views Attendees
      ↓
QR Check-In
```

---

# 79. Ticket Verification Flow

```text
User opens ticket
      ↓
QR code displayed
      ↓
Organizer scans QR
      ↓
Backend validates ticket
      ↓
Ticket active?
      ↓
Event correct?
      ↓
Already used?
      ↓
Check-in successful
```

---

# 80. Security Requirements

Every implementation must verify:

```text
Authentication
Authorization
Ownership
Input validation
Payment signature
Ticket ownership
Booking ownership
```

Never rely only on frontend restrictions.

---

# 81. API Testing Checklist

Before frontend integration, verify:

### Authentication

```text
Register
OTP
Login
Logout
Me
Forgot password
Reset password
```

### Events

```text
List
Search
Filter
Details
Create
Update
Delete
Publish
Cancel
```

### Bookings

```text
Create
My bookings
Details
Cancel
Organizer bookings
```

### Payments

```text
Create order
Successful payment
Failed payment
Verify signature
```

### Tickets

```text
My tickets
Ticket details
QR verification
Check-in
Duplicate check-in
```

### Reviews

```text
Create
Read
Update
Delete
```

### Wishlist

```text
Add
Remove
Read
```

### Admin

```text
Dashboard
Users
Roles
Events
Bookings
Payments
Analytics
```

---

# 82. Final API Integration Rule

The frontend must treat the backend API as the single source of truth.

Never:

```text
calculate authoritative prices
approve permissions
confirm payments
mark tickets as valid
modify roles
```

from the frontend alone.

The backend must always perform final verification.

---

# 83. Final Architecture

```text
┌─────────────────────────────┐
│       Next.js Frontend      │
│                             │
│ Pages / Components / State  │
└──────────────┬──────────────┘
               │
               │ REST API
               ▼
┌─────────────────────────────┐
│       Express Backend       │
│                             │
│ Routes → Controllers        │
│          ↓                  │
│       Services              │
│          ↓                  │
│      Middleware             │
└───────┬───────────┬─────────┘
        │           │
        ▼           ▼
┌────────────┐  ┌─────────────┐
│ MongoDB    │  │  Razorpay   │
│ Atlas      │  │  Payments   │
└────────────┘  └─────────────┘
        │
        ▼
┌─────────────────────────────┐
│ Email / OTP / Notifications │
└─────────────────────────────┘
```

This API specification is the contract between Eventora's frontend and backend. Any generated code must follow these endpoint names, authentication requirements, response conventions, security rules, and data-flow principles unless a later project specification explicitly changes them.
