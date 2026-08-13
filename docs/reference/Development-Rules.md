# Eventora — Development Rules & Coding Standards

## 1. Purpose

These rules are mandatory for the entire Eventora project.

Eventora is a production-style:

> **Smart Event & Ticket Management Platform**

The application must be developed as a serious full-stack product suitable for:

* Final-year project presentation
* External examiner demonstration
* Real-world portfolio
* Production-style deployment
* Future expansion

Do not treat Eventora as a simple college CRUD project.

---

# 2. Core Technology Stack

Use the following stack unless a later project instruction explicitly changes it.

## Frontend

```text
Next.js
React
TypeScript
Tailwind CSS
Framer Motion
Lucide React
Axios
React Hook Form
Zod
```

Use the current stable Next.js App Router architecture.

---

## Backend

```text
Node.js
Express.js
MongoDB
Mongoose
JWT
bcrypt
cookie-parser
cors
dotenv
Razorpay
Nodemailer / EmailJS where appropriate
```

---

## Database

Use:

```text
MongoDB Atlas
```

Do not replace MongoDB with:

```text
Firebase
Supabase
MySQL
PostgreSQL
```

unless explicitly instructed.

---

# 3. Architecture Rule

Keep frontend and backend logically separated.

Recommended structure:

```text
Eventora/
│
├── frontend/
│
└── backend/
```

Frontend:

```text
Next.js
```

Backend:

```text
Express API
```

Database:

```text
MongoDB Atlas
```

---

# 4. Frontend Architecture

Use Next.js App Router.

Recommended:

```text
app/
├── page.tsx
├── events/
├── categories/
├── login/
├── register/
├── verify-otp/
├── forgot-password/
├── reset-password/
├── checkout/
├── booking/
├── tickets/
├── profile/
├── wishlist/
├── notifications/
├── organizer/
└── admin/
```

Use route groups where they improve organization.

Example:

```text
app/
├── (public)/
├── (auth)/
├── (user)/
├── (organizer)/
└── (admin)/
```

Do not create unnecessarily deep folder structures.

---

# 5. Component Architecture

Do not place the entire application inside page files.

Use reusable components.

Example:

```text
components/
├── ui/
├── layout/
├── navbar/
├── footer/
├── events/
├── booking/
├── tickets/
├── auth/
├── organizer/
├── admin/
└── shared/
```

A page should compose components rather than contain hundreds of lines of JSX.

---

# 6. Reusability Rule

If the same UI appears more than once, create a reusable component.

Examples:

```text
EventCard
EventGrid
TicketCard
BookingCard
CategoryCard
RatingStars
SearchBar
Pagination
Modal
Button
Input
Select
Badge
```

Do not duplicate the same JSX repeatedly.

---

# 7. TypeScript Rule

Use TypeScript throughout the frontend.

Avoid:

```ts
any
```

unless absolutely necessary.

Prefer:

```ts
interface Event {}
interface User {}
interface Booking {}
interface Ticket {}
interface Payment {}
```

Centralize shared types where appropriate.

---

# 8. API Layer Rule

Never call APIs directly from random components.

Use service modules.

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

# 9. API URL Rule

Never hardcode:

```text
http://localhost:5000
```

throughout the application.

Use:

```env
NEXT_PUBLIC_API_URL=
```

Example:

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

---

# 10. Environment Variables

Never hardcode secrets.

Backend `.env`:

```env
PORT=5000

MONGODB_URI=

JWT_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

EMAIL_USER=
EMAIL_PASSWORD=

CLIENT_URL=
```

Frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

Only variables beginning with:

```text
NEXT_PUBLIC_
```

may be exposed to the browser.

Never expose:

```text
JWT_SECRET
MONGODB_URI
RAZORPAY_KEY_SECRET
EMAIL_PASSWORD
```

---

# 11. `.env.example`

Always create:

```text
.env.example
```

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
CLIENT_URL=http://localhost:3000
```

Never commit real `.env` files.

---

# 12. Git Rules

`.gitignore` must contain:

```text
node_modules/
.env
.env.local
.next/
dist/
build/
coverage/
```

Never push:

```text
MongoDB passwords
JWT secrets
Razorpay secrets
Email passwords
API keys
```

---

# 13. Backend Layering

Use:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Models
```

Middleware should handle:

```text
authentication
authorization
validation
error handling
```

Do not put all business logic inside routes.

---

# 14. Controller Rule

Controllers should remain readable.

Bad:

```js
router.post("/", async (req, res) => {
   // 200 lines of logic
});
```

Prefer:

```js
router.post("/", authMiddleware, createEvent);
```

Then:

```text
controller
↓
service
↓
database
```

---

# 15. Mongoose Rule

Use Mongoose schemas.

Every important field must have:

```text
type
required
validation where appropriate
default where appropriate
```

Use indexes for frequently searched fields.

Examples:

```text
email
slug
event date
city
category
ticket number
booking reference
```

---

# 16. MongoDB Rule

Never trust IDs sent by the frontend.

Always verify:

```text
ObjectId validity
record existence
ownership
permissions
```

---

# 17. Ownership Rule

For organizer resources:

```text
Organizer A
     ↓
Event A
```

Organizer B must not be able to:

```text
edit Event A
delete Event A
view private attendee information for Event A
```

unless authorized as admin.

---

# 18. Role-Based Access Control

Supported roles:

```text
user
organizer
admin
```

Create middleware such as:

```text
authenticate
authorize
requireOrganizer
requireAdmin
```

Never rely only on frontend role checks.

Frontend hiding a button is not security.

---

# 19. Authentication Rule

Use JWT authentication with HTTP-only cookies.

The JWT must not be stored in:

```text
localStorage
sessionStorage
```

Use secure cookies.

Recommended:

```js
{
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax"
}
```

Adjust cookie configuration correctly for deployed frontend/backend domains.

---

# 20. Password Rule

Never store plain-text passwords.

Use:

```text
bcrypt
```

Password requirements should include reasonable validation.

Example:

```text
minimum 8 characters
```

---

# 21. OTP Rule

OTP must:

```text
be randomly generated
expire
be invalidated after successful verification
not be stored in plain text if possible
have rate limiting
```

Example expiration:

```text
10 minutes
```

Do not allow unlimited OTP requests.

---

# 22. Email Rule

Email should be used for:

```text
registration OTP
password reset
booking confirmation
payment confirmation
event reminders
event cancellation
```

Email templates should be professionally designed.

Avoid plain ugly text-only emails where possible.

---

# 23. Razorpay Rule

Use Razorpay's official payment flow.

Never trust:

```text
frontend amount
frontend payment status
frontend success message
```

Backend must:

1. Retrieve booking.
2. Calculate authoritative amount.
3. Create Razorpay order.
4. Send order information to frontend.
5. Receive payment response.
6. Verify Razorpay signature.
7. Update booking.
8. Generate ticket.

---

# 24. Payment Security

Never expose:

```text
RAZORPAY_KEY_SECRET
```

to the frontend.

Frontend only receives:

```text
RAZORPAY_KEY_ID
```

and the generated order information.

---

# 25. Payment Status

Use clear states:

```text
pending
paid
failed
refunded
```

Booking status should be separate from payment status.

Example:

```text
bookingStatus = confirmed
paymentStatus = paid
```

---

# 26. Booking Rule

Never trust frontend ticket price.

Frontend sends:

```json
{
  "eventId": "...",
  "ticketTypeId": "...",
  "quantity": 2
}
```

Backend retrieves the actual ticket type price from MongoDB.

Then calculates:

```text
subtotal
fees
discount
total
```

---

# 27. Inventory Rule

Prevent overselling.

Before confirming booking:

```text
requested quantity <= available quantity
```

must be true.

Inventory updates should be handled carefully to reduce race-condition problems.

---

# 28. Ticket Rule

Tickets are generated only after successful payment verification.

A ticket must contain:

```text
unique ticket number
booking reference
event
ticket type
user
status
QR information
```

---

# 29. QR Rule

QR codes must not contain:

```text
password
JWT
payment secret
private user information
```

Use a ticket identifier or signed verification token.

---

# 30. Ticket Check-In

A ticket can only be checked in when:

```text
ticket exists
ticket belongs to event
event is valid
ticket status is active
ticket has not already been used
```

After successful check-in:

```text
status = used
checkedInAt = current time
```

---

# 31. Review Rule

Only eligible users should be allowed to review an event.

Recommended requirement:

```text
user has a confirmed booking for the event
```

One user should not be able to create unlimited duplicate reviews for the same event unless explicitly allowed.

---

# 32. Search Rule

Event search should support:

```text
title
description
category
city
venue
tags
```

Search should be case-insensitive.

---

# 33. Filtering

Event filtering should support:

```text
category
city
date
price
status
```

Do filtering on the backend for scalable data retrieval.

Do not fetch thousands of events and filter everything in the browser.

---

# 34. Pagination

Large datasets must be paginated.

Use:

```text
page
limit
total
pages
```

Never render thousands of records simultaneously.

---

# 35. API Error Handling

Use centralized error handling.

Example:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
```

Return consistent JSON.

---

# 36. Frontend Loading States

Every API-driven page should have loading states.

Examples:

```text
Skeleton cards
Spinner
Loading button
Progress indicator
```

Avoid blank white/black screens while data loads.

---

# 37. Empty States

Every list should have a useful empty state.

Examples:

```text
No events found
Your wishlist is empty
No upcoming bookings
No notifications
No tickets available
```

Include an appropriate action where useful.

---

# 38. Error States

API failures must have designed error states.

Example:

```text
Unable to load events.

Please check your connection and try again.

[Retry]
```

Do not display raw stack traces.

---

# 39. Toast Notifications

Use toast notifications for lightweight actions.

Examples:

```text
Added to wishlist
Removed from wishlist
Booking cancelled
Profile updated
Event published
Payment successful
```

Do not overuse toasts for important information that should remain visible.

---

# 40. Form Validation

Use:

```text
React Hook Form
+
Zod
```

Validate:

```text
frontend
backend
```

Frontend validation improves UX.

Backend validation provides security.

---

# 41. Button Rules

Buttons must communicate their state.

Examples:

```text
Book Now
Processing...
Payment Successful
Saving...
Saved
Delete Event
Deleting...
```

Disable buttons during operations where duplicate requests could occur.

---

# 42. Destructive Actions

For:

```text
delete event
cancel booking
delete review
remove account
```

use confirmation dialogs.

Example:

```text
Are you sure?

This action cannot be undone.

[Cancel] [Confirm]
```

---

# 43. UI Design Rule

Eventora must NOT look like a generic AI-generated website.

Avoid:

```text
purple gradients everywhere
random glowing cards
excessive glassmorphism
neon borders everywhere
huge rounded cards
AI-style dashboard templates
```

The UI should feel like a serious commercial event platform.

---

# 44. Visual Reference

Use the provided BookMyShow website as a visual/business UX reference:

```text
https://in.bookmyshow.com/explore/home/mumbai
```

Take inspiration from:

```text
event discovery
category browsing
content hierarchy
search
location selection
event cards
ticket purchasing flow
navigation structure
```

Do not copy their branding, assets, exact layouts, or copyrighted content.

Eventora must have its own identity.

---

# 45. Color Rule

Do not default to:

```text
purple + blue AI gradient
```

Use a sophisticated event-platform palette.

Preferred direction:

```text
deep charcoal / near-black
white / off-white
warm neutral surfaces
strong accent color
subtle secondary accent
```

The exact palette should be finalized in `UI-Reference.md`.

---

# 46. Typography

Use a professional modern font.

Typography must have:

```text
clear hierarchy
strong headings
readable body text
consistent line-height
comfortable spacing
```

Do not use five different fonts.

Maximum:

```text
1 primary font
1 optional display font
```

---

# 47. Spacing

Use a consistent spacing system.

Avoid random:

```text
margin: 13px
padding: 27px
gap: 19px
```

unless necessary.

Use Tailwind's spacing system consistently.

---

# 48. Border Radius

Do not make every element extremely rounded.

Use different levels:

```text
small controls → subtle radius
cards → moderate radius
buttons → moderate radius
large containers → moderate radius
```

Avoid excessive pill-shaped UI.

---

# 49. Shadows

Use shadows subtly.

Do not make every card look like it is floating.

Use:

```text
border
subtle shadow
surface contrast
```

to establish hierarchy.

---

# 50. Animation Rule

Use Framer Motion only when animation improves UX.

Good:

```text
page entrance
card hover
modal
drawer
filter transition
button feedback
ticket reveal
```

Avoid:

```text
constant floating
random bouncing
excessive parallax
animation on every element
```

---

# 51. Performance

Optimize:

```text
images
fonts
API requests
component rendering
animations
database queries
```

Use Next.js image optimization where appropriate.

Avoid unnecessary client components.

---

# 52. Server vs Client Components

Use Server Components by default.

Use:

```text
"use client"
```

only when required for:

```text
state
event handlers
browser APIs
interactive components
animations requiring client-side logic
```

Do not make the entire application a Client Component unnecessarily.

---

# 53. SEO

Public pages should have proper metadata.

Important pages:

```text
Home
Events
Event Details
Categories
About
Contact
```

Event details should have dynamic metadata based on event information.

---

# 54. Accessibility

Use semantic HTML.

Examples:

```text
header
nav
main
section
article
footer
button
form
label
```

Images must have meaningful:

```text
alt
```

Interactive elements must be keyboard accessible.

---

# 55. Responsive Design

The application must work on:

```text
mobile
tablet
laptop
desktop
large desktop
```

Do not design desktop first and simply shrink it.

Navigation must adapt properly on mobile.

---

# 56. Mobile Navigation

On mobile:

```text
desktop navbar
```

should transform into a clean mobile navigation.

Avoid cramped menus.

Use:

```text
drawer
bottom navigation where appropriate
compact header
```

---

# 57. Event Cards

Every event card should communicate:

```text
event image
title
category
date
location
starting price
rating/popularity where applicable
```

Avoid overcrowding.

---

# 58. Event Details

Event details should prioritize:

```text
event title
date/time
location
event image
ticket pricing
availability
description
organizer
reviews
```

The booking CTA should be easy to find.

---

# 59. Checkout

Checkout must be simple.

Recommended:

```text
Event
↓
Tickets
↓
Order Summary
↓
Payment
↓
Confirmation
```

Do not create unnecessary steps.

---

# 60. Booking Confirmation

After successful payment show:

```text
Payment successful
Booking confirmed
Booking reference
Event information
Ticket information
QR code
```

Provide:

```text
View Ticket
Download Ticket
View Booking
```

where implemented.

---

# 61. Admin Dashboard

Admin dashboard must be data-driven.

Do not hardcode:

```text
₹12.5L revenue
1,248 users
```

Calculate values from MongoDB.

---

# 62. Organizer Dashboard

Organizer sees only their own data.

Do not accidentally expose:

```text
other organizers' events
other organizers' revenue
other organizers' attendees
```

---

# 63. Admin vs Organizer UI

Admin and organizer dashboards must be visually related but functionally different.

Admin:

```text
platform management
```

Organizer:

```text
event management
```

---

# 64. No Fake Functionality

Never create buttons that appear functional but do nothing.

Bad:

```text
Download Ticket
```

with no implementation.

If a feature is not implemented:

```text
do not present it as completed
```

---

# 65. No Fake Analytics

Charts must use actual API data.

Never generate random chart values.

Bad:

```js
Math.random()
```

for dashboard analytics.

---

# 66. No Fake Payment

Development can use Razorpay Test Mode.

Never simulate a successful payment by simply changing:

```text
paymentStatus = paid
```

from the frontend.

Use actual Razorpay test payment flow.

---

# 67. No Fake Authentication

Do not implement:

```text
if email === admin@example.com
```

style authentication.

Use actual MongoDB users and JWT authentication.

---

# 68. No Hardcoded User Data

Do not put:

```text
Atharv
atharv@gmail.com
```

inside components as permanent user data.

Retrieve authenticated user from the API.

---

# 69. Seed Data

Use the separate:

```text
Database-Seed-Data.md
```

specification.

Seed data should be used for development/demo only.

---

# 70. Error Logging

Backend should log useful errors during development.

Do not expose stack traces to users.

Production response:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

Development logs may contain detailed debugging information.

---

# 71. CORS

Configure CORS using environment variables.

Development:

```text
http://localhost:3000
```

Production:

```text
deployed frontend URL
```

Do not use:

```js
origin: "*"
```

when credentials/cookies are required.

---

# 72. Deployment Rule

Frontend:

```text
Vercel
```

Backend can be deployed using:

```text
Render
```

or another suitable Node.js hosting provider.

Database:

```text
MongoDB Atlas
```

Payment:

```text
Razorpay
```

---

# 73. Production Environment

Before deployment verify:

```text
MongoDB Atlas network access
CORS
environment variables
cookie configuration
Razorpay keys
frontend API URL
backend API URL
email configuration
```

---

# 74. API URL Production Rule

Production frontend must use:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain/api
```

Never leave:

```text
localhost
```

in production API calls.

---

# 75. Database Security

MongoDB Atlas must not expose unrestricted access unnecessarily.

Use appropriate:

```text
database user
password
network access
permissions
```

---

# 76. Code Formatting

Use:

```text
Prettier
ESLint
```

Keep formatting consistent.

---

# 77. Naming Conventions

React components:

```text
PascalCase
```

Example:

```text
EventCard.tsx
TicketCard.tsx
BookingSummary.tsx
```

Functions:

```text
camelCase
```

Example:

```text
getEvents()
createBooking()
verifyPayment()
```

Constants:

```text
UPPER_SNAKE_CASE
```

Example:

```text
API_BASE_URL
MAX_TICKET_QUANTITY
```

---

# 78. File Naming

Do not mix:

```text
EventCard.tsx
event-card.tsx
eventCard.tsx
```

Choose one convention and remain consistent.

Recommended React convention:

```text
PascalCase for components
kebab-case for route folders where appropriate
```

---

# 79. Comments

Write comments only when they explain something non-obvious.

Do not write:

```js
// This function gets events
function getEvents() {}
```

Prefer meaningful comments for:

```text
payment signature verification
inventory concurrency
complex aggregation
security-sensitive logic
```

---

# 80. Documentation

Important systems should have documentation.

Document:

```text
environment setup
database setup
API
authentication
Razorpay integration
email/OTP
deployment
seed data
```

---

# 81. Development Workflow

Follow this order:

```text
1. Project setup
2. Database configuration
3. Models
4. Authentication
5. API routes
6. Business logic
7. Payment integration
8. Email/OTP
9. Seed data
10. API testing
11. Frontend setup
12. Authentication UI
13. Event discovery
14. Booking flow
15. Razorpay UI
16. Tickets
17. Organizer dashboard
18. Admin dashboard
19. Responsive design
20. SEO
21. Testing
22. Deployment
```

---

# 82. Testing Rule

Before declaring a module complete, test:

```text
success
validation failure
unauthorized access
forbidden access
not found
duplicate request
network failure
```

For payment:

```text
success
failure
cancel
signature verification
```

---

# 83. Postman

Create a Postman collection covering:

```text
Auth
Users
Events
Categories
Wishlist
Bookings
Payments
Tickets
Reviews
Notifications
Organizer
Admin
```

Test backend before connecting frontend.

---

# 84. Final-Year Presentation Rule

The project should be easy to explain to an external examiner.

The architecture should clearly demonstrate:

```text
Frontend
   ↓
REST API
   ↓
Express
   ↓
MongoDB
```

alongside:

```text
JWT Authentication
Razorpay Payment
Email OTP
Role-Based Access
QR Ticket Verification
Analytics
```

These are important project concepts and should be implemented properly rather than merely displayed in the UI.

---

# 85. Examiner Demonstration

The application should support a clear demonstration:

### Step 1

Open Eventora.

### Step 2

Browse events.

### Step 3

Register.

### Step 4

Verify OTP.

### Step 5

Login.

### Step 6

Search/filter an event.

### Step 7

Book tickets.

### Step 8

Complete Razorpay test payment.

### Step 9

Show generated ticket and QR code.

### Step 10

Login as organizer.

### Step 11

Show organizer dashboard.

### Step 12

Create/manage an event.

### Step 13

Show attendee list.

### Step 14

Verify/check-in a ticket.

### Step 15

Login as admin.

### Step 16

Show platform analytics and management.

---

# 86. Important Anti-AI-Template Rule

The final project must NOT look like it was generated from a generic AI website template.

Avoid:

```text
Generic SaaS dashboard
Purple gradients
Excessive glassmorphism
Random blobs
Unnecessary glowing borders
Overuse of rounded rectangles
Generic hero with "Build the future"
Fake statistics
Fake testimonials
Random startup jargon
```

Instead:

```text
Event-first UX
Strong visual hierarchy
Professional commercial styling
Realistic event content
Clear ticket purchasing flow
Useful interactions
Consistent spacing
Subtle animations
High-quality imagery
```

---

# 87. Brand Rule

Brand:

```text
Eventora
```

Full product name:

```text
Eventora — Smart Event & Ticket Management Platform
```

Do not randomly rename the product.

Do not introduce another primary brand name.

---

# 88. Content Rule

Use realistic content.

Good:

```text
Pune Music Festival
India Tech Future Summit
Mumbai Comedy Nights
Startup India Connect
```

Bad:

```text
Amazing Event 1
Tech Event
Lorem Ipsum
Demo Event
```

---

# 89. No Copyright Copying

BookMyShow may be used as a UX reference.

Do not copy:

```text
logo
brand identity
exact text
exact design
copyrighted images
exact layouts
```

Eventora must have an independent visual identity.

---

# 90. Final Quality Standard

Before declaring Eventora complete, verify:

```text
[ ] Authentication works
[ ] OTP works
[ ] JWT cookie works
[ ] Role-based authorization works
[ ] MongoDB works
[ ] Event CRUD works
[ ] Search works
[ ] Filters work
[ ] Wishlist works
[ ] Booking works
[ ] Inventory works
[ ] Razorpay test payment works
[ ] Payment signature verification works
[ ] Tickets are generated
[ ] QR verification works
[ ] Check-in works
[ ] Reviews work
[ ] Notifications work
[ ] Organizer dashboard works
[ ] Admin dashboard works
[ ] Analytics use real data
[ ] Responsive UI works
[ ] SEO works
[ ] Error handling works
[ ] Loading states exist
[ ] Empty states exist
[ ] No secrets are committed
[ ] Production environment works
```

---

# 91. Golden Rule

When choosing between:

```text
quick implementation
```

and:

```text
correct implementation
```

choose the correct implementation.

When choosing between:

```text
more visual effects
```

and:

```text
better usability
```

choose usability.

When choosing between:

```text
hardcoded demo
```

and:

```text
real database/API integration
```

choose real integration.

Eventora must feel like a genuine event platform, not a collection of screens created only for a presentation.
