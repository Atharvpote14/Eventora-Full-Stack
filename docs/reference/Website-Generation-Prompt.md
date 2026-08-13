# Eventora — Complete Website Generation Prompt

## MASTER AI DEVELOPMENT PROMPT

You are an expert full-stack software architect, UI/UX designer, Next.js developer, Node.js/Express developer, MongoDB architect, authentication engineer, payment integration engineer, and production deployment engineer.

Your task is to build a **complete production-quality full-stack event and ticket management platform** called:

# Eventora

### Tagline

**Discover. Book. Experience.**

Eventora is a modern event discovery, booking, ticketing, payment, organizer-management, and administration platform.

This is a **final-year Computer Engineering project** that will be presented to external examiners.

The application must therefore look and behave like a serious commercial product rather than a basic student CRUD project.

---

# 1. IMPORTANT — READ ALL REFERENCE FILES FIRST

Before generating any code, inspect and understand every reference/documentation file provided with this project.

These files define the architecture, UI, database, authentication, payment, testing, and development requirements.

Examples include:

```text
UI-Reference.md
Folder-Structure.md
Database-Schema.md
Development-Rules.md
Authentication-Flow.md
Payment-Integration.md
Testing-Documentation.md
```

and every other Eventora reference file supplied alongside this prompt.

### Critical rule

Do NOT ignore these files.

Do NOT replace their architecture with your own assumptions.

If two requirements appear to conflict:

1. Prefer the most recently provided requirement.
2. Preserve security requirements.
3. Preserve database consistency.
4. Preserve the premium UI requirements.
5. Ask for clarification only if absolutely necessary.

---

# 2. PROJECT OBJECTIVE

Build Eventora as a complete full-stack platform where users can:

* Discover events
* Search events
* Filter events
* View event details
* Register/login
* Verify email through OTP
* Manage their profile
* Wishlist events
* Book tickets
* Pay using Razorpay
* Receive booking confirmation
* View tickets
* Display QR codes
* Receive emails
* Review attended events

Organizers can:

* Create events
* Edit events
* Publish events
* Manage ticket types
* Manage inventory
* View bookings
* View attendees
* Verify tickets
* View revenue
* View analytics

Admins can:

* Manage users
* Manage organizers
* Moderate events
* Manage categories
* View bookings
* View payments
* View revenue
* View platform analytics
* Manage reports
* Manage platform settings

---

# 3. CORE TECHNOLOGY STACK

## Frontend

Use:

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

Use the latest stable compatible versions.

Use the Next.js App Router.

---

# 4. BACKEND

Use:

```text
Node.js
Express.js
MongoDB
Mongoose
JWT
bcrypt/bcryptjs
Razorpay
Nodemailer or the configured email service
```

The backend must be a proper REST API.

Do not put business logic directly inside frontend components.

---

# 5. DATABASE

Use:

```text
MongoDB Atlas
```

Use Mongoose models.

Follow the exact database architecture defined in:

```text
Database-Schema.md
```

Expected major entities include:

```text
User
Event
Category
TicketType
Booking
Payment
Ticket
Review
Notification
Report
```

Use proper relationships and indexes.

Do not duplicate information unnecessarily.

---

# 6. AUTHENTICATION

Implement complete authentication.

Required functionality:

```text
Register
Login
Logout
Get Current User
Email OTP Verification
Resend OTP
Forgot Password
Reset Password
Session Persistence
Role-Based Authorization
```

Roles:

```text
user
organizer
admin
```

Authentication must follow:

```text
Authentication-Flow.md
```

Use secure HTTP-only cookies where specified.

Never expose JWT secrets to the frontend.

Never store plain-text passwords.

Passwords must be securely hashed.

---

# 7. EMAIL / OTP

Implement email functionality.

Use the configured email provider/environment variables.

Required:

```text
Registration OTP
Resend OTP
Password Reset OTP/Email
Booking Confirmation
Payment Confirmation
Event-related Notifications
```

OTP requirements:

```text
expiration
secure generation
one-time usage
attempt protection
resend protection
```

Never expose OTP values in API responses in production.

---

# 8. EVENT DISCOVERY

Create a premium event discovery experience.

Users should be able to discover:

```text
Movies
Music
Concerts
Sports
Comedy
Workshops
Technology
Business
Education
Food
Arts
Festivals
```

Categories should be database-driven.

---

# 9. HOMEPAGE

Create a visually impressive homepage.

Sections:

```text
Navigation
Hero / Event Discovery
Location Selector
Search
Trending Events
Popular Near You
Recommended Events
Categories
Upcoming Events
Featured Events
Top Organizers
Promotional Banner
Why Eventora
Newsletter
Footer
```

The homepage must feel like a real commercial event platform.

---

# 10. EVENT LISTING PAGE

Create:

```text
/events
```

Features:

```text
Search
Category filter
Location filter
Date filter
Price filter
Sort
Pagination
```

Event cards should contain:

```text
Image
Event title
Category
Location
Date
Time
Starting price
Wishlist button
```

---

# 11. EVENT DETAILS

Create:

```text
/events/[slug]
```

Display:

```text
Hero image
Event title
Date
Time
Venue
Location
Organizer
Description
Ticket types
Price
Availability
Terms
Reviews
Related events
```

Provide a prominent:

```text
Book Tickets
```

CTA.

---

# 12. BOOKING SYSTEM

Implement a complete booking workflow.

Flow:

```text
Event Details
      ↓
Select Ticket Type
      ↓
Select Quantity
      ↓
Checkout
      ↓
Booking Created
      ↓
Payment
      ↓
Payment Verification
      ↓
Booking Confirmed
      ↓
Ticket Generated
```

The backend must calculate all prices.

Never trust frontend prices.

---

# 13. RAZORPAY

Implement Razorpay exactly according to:

```text
Payment-Integration.md
```

Required:

```text
Create Razorpay Order
Open Razorpay Checkout
Receive Payment Details
Verify Signature
Handle Payment Success
Handle Payment Failure
Payment Retry
Webhooks
Refund Support
Payment History
```

Use Razorpay Test Mode during development.

Never expose:

```text
RAZORPAY_KEY_SECRET
```

to the frontend.

---

# 14. TICKETING

After successful payment:

```text
Booking Confirmed
      ↓
Generate Ticket
      ↓
Generate Unique Ticket Number
      ↓
Generate QR
      ↓
Store Ticket
      ↓
Display Ticket
```

Ticket should contain:

```text
Event
Venue
Date
Time
Ticket type
Ticket holder
Booking number
Ticket number
QR code
```

---

# 15. QR VERIFICATION

Organizers must be able to verify tickets.

Flow:

```text
Organizer Dashboard
      ↓
Scan QR
      ↓
Backend Verification
      ↓
Check Event Ownership
      ↓
Check Ticket Validity
      ↓
Check Used Status
      ↓
Allow Check-In
```

A ticket must not be usable twice.

---

# 16. USER DASHBOARD

Create a premium user dashboard.

Include:

```text
Overview
My Bookings
My Tickets
Wishlist
Payment History
Notifications
Profile
Security
```

Dashboard should use real API data.

Never use hardcoded fake statistics.

---

# 17. ORGANIZER DASHBOARD

Create a dedicated organizer dashboard.

Include:

```text
Overview
Events
Create Event
Edit Event
Ticket Types
Bookings
Attendees
Revenue
Analytics
Ticket Verification
Reviews
Profile
```

Analytics:

```text
Total Events
Tickets Sold
Revenue
Bookings
Attendance
Popular Events
Sales Trends
```

Use charts where they materially improve understanding.

---

# 18. ADMIN DASHBOARD

Create a professional admin panel.

Include:

```text
Dashboard
Users
Organizers
Events
Categories
Bookings
Payments
Tickets
Reports
Analytics
Notifications
Settings
```

Admin analytics should include:

```text
Total Users
Total Organizers
Total Events
Total Bookings
Total Revenue
Successful Payments
Failed Payments
Refunds
```

All values must come from MongoDB.

---

# 19. WISHLIST

Users can:

```text
Add event
Remove event
View wishlist
```

Prevent duplicate wishlist entries.

---

# 20. REVIEWS

Allow eligible users to review events.

Requirements:

```text
1–5 rating
Review text
Edit review
Delete review
Average rating
Review count
```

Only users who meet the configured booking/attendance requirements may review.

Users must only be able to modify their own reviews.

---

# 21. NOTIFICATIONS

Create notification functionality.

Examples:

```text
Booking confirmed
Payment successful
Event updated
Event cancelled
Reminder
Password/security event
```

Include:

```text
Read
Unread
Mark as read
Mark all as read
```

---

# 22. SEARCH

Implement useful event search.

Search across:

```text
Event name
Category
Venue
City
Organizer
```

Provide a polished search UI.

Search should debounce API requests where appropriate.

---

# 23. LOCATION

Create a location selector.

Example:

```text
Mumbai
Pune
Delhi
Bangalore
Hyderabad
Chennai
Kolkata
```

The architecture should allow additional cities.

---

# 24. RESPONSIVE DESIGN

The website must be fully responsive.

Test:

```text
320px
375px
425px
768px
1024px
1280px
1440px
1920px
```

Do not simply shrink desktop layouts.

Mobile layouts should be intentionally designed.

---

# 25. PREMIUM UI REQUIREMENT

This is extremely important.

Do NOT create a generic AI-generated website.

Do NOT use:

```text
generic purple gradients
random neon purple
excessive glassmorphism
template dashboard cards everywhere
huge unnecessary rounded cards
AI-looking hero sections
```

The design must feel like a real commercial product.

---

# 26. UI INSPIRATION

Use the provided UI reference documentation.

The primary inspiration is:

```text
BookMyShow
```

Reference:

```text
https://in.bookmyshow.com/explore/home/mumbai
```

Use the **design principles**, information hierarchy, event discovery patterns, navigation structure, card density, filtering concepts, and commercial feel as inspiration.

Do NOT copy BookMyShow's branding, assets, logos, copyrighted content, or exact interface.

Eventora must have its own identity.

---

# 27. EVENTORA VISUAL IDENTITY

Eventora should feel:

```text
Premium
Modern
Cinematic
Professional
Trustworthy
Commercial
Elegant
Fast
```

Use a sophisticated color system rather than a default AI purple theme.

Recommended direction:

```text
Deep charcoal / near-black
Warm white
Muted gray
Strong red/orange accent
Subtle gradients
```

The exact colors should be refined according to the UI reference file.

---

# 28. TYPOGRAPHY

Use a professional modern font system.

Typography hierarchy:

```text
Large cinematic headings
Strong event titles
Readable metadata
Compact secondary information
Clear CTA typography
```

Do not use oversized text everywhere.

---

# 29. NAVIGATION

Desktop navigation should include:

```text
Eventora Logo
Search
Location
Categories
Events
Offers
```

Right side:

```text
Notifications
Wishlist
Profile
```

Organizer/admin navigation should adapt according to role.

Mobile should use:

```text
Mobile header
Search
Bottom navigation or mobile menu
```

where appropriate.

---

# 30. ANIMATIONS

Use Framer Motion carefully.

Animations should include:

```text
page transitions
card hover
button feedback
modal transitions
dropdown animations
filter transitions
dashboard interactions
success animations
```

Avoid excessive animation.

Performance is more important than decoration.

---

# 31. IMAGES

Use optimized event imagery.

Use Next.js image optimization.

Do not ship huge unoptimized images.

Provide graceful fallbacks when an image is unavailable.

Avoid broken image layouts.

---

# 32. FORMS

Use:

```text
React Hook Form
Zod
```

for important forms.

Validate both:

```text
frontend
backend
```

Frontend validation improves UX.

Backend validation provides security.

---

# 33. ERROR HANDLING

Every API call must handle:

```text
loading
success
error
empty
```

Create useful error messages.

Never display raw stack traces to users.

---

# 34. API ARCHITECTURE

Use a clean API layer.

Frontend should communicate with backend through reusable API utilities.

Example:

```text
lib/api.ts
services/auth.ts
services/events.ts
services/bookings.ts
services/payments.ts
```

Do not duplicate Axios/fetch configuration across components.

---

# 35. BACKEND ARCHITECTURE

Use a clean structure:

```text
config
controllers
middleware
models
routes
services
utils
validators
```

Business logic should be separated from route definitions.

---

# 36. SECURITY

Implement:

```text
Helmet
CORS
Rate limiting
Input validation
Authentication middleware
Role middleware
Ownership checks
Secure cookies
Password hashing
JWT protection
Webhook signature verification
Razorpay signature verification
```

Never trust client-side authorization.

Every sensitive operation must be checked server-side.

---

# 37. OWNERSHIP

Always verify resource ownership.

Examples:

```text
Organizer A cannot edit Organizer B's event.

User A cannot view User B's private booking.

User A cannot delete User B's review.

Organizer B cannot verify Organizer A's ticket.

Normal users cannot access admin APIs.
```

---

# 38. DATABASE INDEXING

Use indexes where required.

Examples:

```text
User email
Event slug
Event category
Event city
Event date
Booking number
Ticket number
Razorpay payment ID
```

Avoid unnecessary indexes.

---

# 39. SEO

Implement SEO using Next.js metadata.

Pages should have:

```text
title
description
Open Graph
Twitter metadata
canonical URLs
```

Event detail pages should have dynamic metadata.

Create:

```text
robots.txt
sitemap.xml
```

---

# 40. ACCESSIBILITY

Follow good accessibility practices.

Include:

```text
semantic HTML
ARIA labels where needed
keyboard navigation
focus states
alt text
proper contrast
accessible forms
```

Do not rely only on color to communicate status.

---

# 41. PERFORMANCE

Optimize:

```text
images
fonts
API calls
database queries
bundle size
animations
```

Use:

```text
lazy loading
dynamic imports
pagination
server/client separation
caching where appropriate
```

Do not over-engineer caching unnecessarily.

---

# 42. RESPONSIBLE DATA HANDLING

Do not expose private information.

Never return:

```text
passwordHash
JWT secrets
API secrets
OTP secrets
private payment credentials
```

in normal API responses.

---

# 43. ENVIRONMENT VARIABLES

Backend should use:

```env
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
CLIENT_URL=

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Frontend:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

Do not commit `.env`.

Generate:

```text
.env.example
```

with placeholder values.

---

# 44. CORS

Configure the backend to allow the production frontend domain.

Development example:

```text
http://localhost:3000
```

Production example:

```text
https://eventora.vercel.app
```

Use environment variables instead of hardcoding production domains.

---

# 45. COOKIE CONFIGURATION

Authentication cookies must be correctly configured for development and production.

Handle:

```text
httpOnly
secure
sameSite
domain
credentials
```

according to the deployment architecture.

Do not break authentication when frontend and backend are hosted on different domains.

---

# 46. API RESPONSE FORMAT

Prefer consistent responses.

Success:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

Validation errors may additionally contain:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {}
}
```

---

# 47. ERROR CODES

Use appropriate HTTP status codes.

Examples:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
```

---

# 48. DASHBOARD DATA

Never hardcode:

```text
₹1,25,000 revenue
2,430 users
580 bookings
```

unless they are actual database values.

All dashboards must calculate their data from APIs.

---

# 49. SEED DATA

Provide a development seed mechanism.

Include realistic demo data for:

```text
users
organizers
events
categories
ticket types
```

Do not hardcode demo data directly into frontend components.

Create a backend seed script if required.

---

# 50. DEMO ACCOUNTS

Provide development-only demo accounts through environment/configuration or seed scripts.

Example:

```text
Admin
Organizer
User
```

Never expose real passwords in production.

---

# 51. FILE UPLOADS

If event image upload is implemented:

```text
validate file type
validate file size
secure upload
store URL/reference
```

Do not store huge binary files directly in MongoDB unless specifically required.

---

# 52. BOOKING CONSISTENCY

Booking creation must protect against:

```text
overselling
duplicate bookings
invalid ticket types
invalid quantities
incorrect prices
expired events
unpublished events
```

The backend is authoritative.

---

# 53. PAYMENT CONSISTENCY

Never confirm a booking solely because Razorpay Checkout returned success on the frontend.

Always verify server-side.

Follow:

```text
Payment-Integration.md
```

---

# 54. TESTING

Follow:

```text
Testing-Documentation.md
```

All important functionality must have a test path.

At minimum verify:

```text
Authentication
OTP
Authorization
Events
Bookings
Payments
Tickets
QR
Reviews
Notifications
Admin
Organizer
Deployment
```

---

# 55. NOT FOUND PAGES

Create premium:

```text
404
500
```

pages.

They should match Eventora's visual identity.

---

# 56. GLOBAL UI STATES

Create reusable:

```text
LoadingSpinner
Skeleton
EmptyState
ErrorState
Modal
Toast
ConfirmDialog
Button
Input
Select
Badge
Card
Pagination
```

components.

---

# 57. TOAST SYSTEM

Use a professional toast notification system.

Examples:

```text
Booking created
Payment successful
Added to wishlist
Event published
Profile updated
Something went wrong
```

Avoid browser `alert()`.

---

# 58. MODALS

Use reusable accessible modals for:

```text
confirmation
delete
cancel booking
logout
filter
ticket details
QR scanner
```

---

# 59. MOBILE EXPERIENCE

Mobile users must be able to:

```text
browse events
search
filter
login
register
verify OTP
book
pay
view tickets
show QR
manage profile
```

without requiring desktop.

---

# 60. FINAL FOLDER STRUCTURE

Follow the dedicated folder structure reference file.

Do not randomly create hundreds of files.

Keep the project organized and maintainable.

Use meaningful naming.

---

# 61. CODE QUALITY

Write:

```text
clean
typed
modular
reusable
maintainable
production-quality
```

code.

Avoid:

```text
duplicate logic
huge components
magic values
hardcoded secrets
unnecessary dependencies
unused imports
console spam
```

---

# 62. TYPESCRIPT

Use strong typing.

Avoid:

```ts
any
```

unless genuinely unavoidable.

Define interfaces/types for:

```text
User
Event
Category
TicketType
Booking
Payment
Ticket
Review
Notification
API responses
```

---

# 63. FRONTEND STATE

Use appropriate state management.

Do not introduce a large state-management library unless the application actually requires it.

Use:

```text
React state
Context
server state/query management
```

appropriately.

---

# 64. DATA FETCHING

Avoid fetching the same data repeatedly.

Use reusable hooks/services.

Examples:

```text
useAuth
useEvents
useBooking
useWishlist
useNotifications
```

where useful.

---

# 65. EVENT CARD

Create a premium reusable event card.

It should support:

```text
image
title
date
time
location
price
category
wishlist
featured badge
```

Card should have subtle hover interaction.

---

# 66. BOOKING UX

Checkout should feel trustworthy.

Display:

```text
Event summary
Ticket selection
Quantity
Price breakdown
Final amount
Secure payment indicator
Terms
Pay Now
```

Do not make users hunt for the final amount.

---

# 67. SUCCESS EXPERIENCE

After successful payment:

```text
✓ Booking Confirmed
```

Provide:

```text
Booking number
Event information
Ticket count
Payment amount
View ticket
Download ticket
Go to dashboard
```

Use a polished success animation.

---

# 68. ORGANIZER EVENT CREATION

Create a multi-section event form.

Sections:

```text
Basic Information
Images
Category
Date & Time
Venue
Description
Ticket Types
Pricing
Capacity
Policies
Preview
Publish
```

Show validation errors clearly.

---

# 69. EVENT STATUS

Support statuses such as:

```text
draft
pending
published
cancelled
completed
```

Admin/organizer permissions determine which transitions are allowed.

---

# 70. ADMIN MODERATION

Admin can review events before publication if moderation is enabled.

Show:

```text
event
organizer
submitted date
status
actions
```

Actions:

```text
approve
reject
request changes
```

---

# 71. ANALYTICS

Use charts where meaningful.

Examples:

```text
Revenue over time
Bookings over time
Tickets sold
Event popularity
Category distribution
```

Charts must use actual API data.

---

# 72. NO GENERIC AI DESIGN

This requirement is repeated intentionally.

Do not generate:

```text
purple SaaS dashboard
generic glass cards
random gradient blobs
AI startup landing page
```

Eventora should visually communicate:

```text
events
entertainment
tickets
discoverability
trust
commerce
```

---

# 73. BOOKMYSHOW INSPIRATION

Use the supplied BookMyShow reference for:

```text
event discovery
content density
location-first browsing
category navigation
event cards
filtering
commercial hierarchy
```

But create a distinctly original Eventora interface.

---

# 74. DEVELOPMENT PROCESS

Build in this order:

```text
1. Project setup
2. Database models
3. Backend configuration
4. Authentication
5. User management
6. Event/category APIs
7. Ticket APIs
8. Booking APIs
9. Payment integration
10. Ticket/QR generation
11. Reviews
12. Notifications
13. Organizer dashboard APIs
14. Admin APIs
15. Frontend foundation
16. Authentication UI
17. Homepage
18. Event discovery
19. Event details
20. Checkout
21. Razorpay
22. Tickets
23. User dashboard
24. Organizer dashboard
25. Admin dashboard
26. Responsive optimization
27. SEO
28. Security
29. Testing
30. Deployment
```

---

# 75. BUILD INCREMENTALLY

Do not generate a fake-looking complete UI with disconnected mock data.

Every major feature should eventually connect:

```text
Frontend
↓
API
↓
Controller
↓
Service
↓
MongoDB
```

Build real functionality.

---

# 76. NO FAKE BACKEND

Do not use:

```text
localStorage as database
static JSON as production data
frontend-only authentication
fake payment success
hardcoded dashboard analytics
```

MongoDB must be the actual persistent database.

---

# 77. NO FAKE PAYMENT

Razorpay must actually be integrated.

During development:

```text
Razorpay Test Mode
```

is acceptable.

But the flow must be real:

```text
Order
→ Checkout
→ Payment
→ Verification
→ Booking confirmation
```

---

# 78. API DOCUMENTATION

Document important APIs.

Include:

```text
method
endpoint
authentication
request
response
errors
```

This is useful for Postman and final presentation.

---

# 79. POSTMAN

Create or maintain a Postman collection covering:

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

---

# 80. FINAL PRESENTATION

The project must be suitable for an external examiner.

The application should demonstrate:

```text
Frontend
Backend
Database
Authentication
Authorization
Email
OTP
Payment Gateway
Booking
Ticketing
QR
Admin
Organizer
Analytics
Deployment
```

---

# 81. EXAMINER DEMO FLOW

The recommended live demonstration:

```text
1. Open Eventora
2. Show premium homepage
3. Search event
4. Filter events
5. Open event details
6. Register a new account
7. Verify OTP
8. Login
9. Select tickets
10. Checkout
11. Open Razorpay Test Checkout
12. Complete test payment
13. Show payment verification
14. Show confirmed booking
15. Show generated ticket
16. Show QR
17. Switch to organizer account
18. Show attendee list
19. Verify/check-in ticket
20. Show organizer analytics
21. Switch to admin
22. Show platform analytics
23. Show MongoDB Atlas data
```

This demonstrates the entire stack.

---

# 82. DEPLOYMENT

Recommended:

```text
Frontend → Vercel
Backend → Render
Database → MongoDB Atlas
```

Configure production environment variables correctly.

Ensure:

```text
CORS
cookies
HTTPS
API URLs
Razorpay
email
webhooks
```

work in production.

---

# 83. PRODUCTION CHECKLIST

Before final deployment:

```text
[ ] Environment variables configured
[ ] MongoDB connected
[ ] CORS configured
[ ] Authentication tested
[ ] Cookies tested
[ ] Email tested
[ ] OTP tested
[ ] Razorpay tested
[ ] Webhook tested
[ ] Booking tested
[ ] Ticket tested
[ ] QR tested
[ ] Admin tested
[ ] Organizer tested
[ ] Mobile tested
[ ] SEO configured
[ ] Error pages configured
[ ] No secrets committed
[ ] No debug logs
[ ] No fake data
[ ] No broken links
[ ] No console errors
```

---

# 84. FINAL DEVELOPMENT RULE

Whenever you have to choose between:

```text
quick implementation
```

and:

```text
secure + maintainable + production-quality implementation
```

choose the second.

Whenever you have to choose between:

```text
generic AI UI
```

and:

```text
custom Eventora commercial UI
```

choose the second.

Whenever you have to choose between:

```text
fake data
```

and:

```text
real MongoDB/API data
```

choose the second.

---

# 85. ABSOLUTE RULES

Never:

```text
hardcode secrets
expose JWT secrets
expose Razorpay secret
store plain passwords
trust frontend payment status
trust frontend prices
skip ownership checks
skip authorization
generate duplicate tickets
use fake dashboard statistics
use localStorage as the database
use fake payment success
```

---

# 86. FINAL EXPECTED RESULT

The final application should feel like:

> A polished, production-quality event discovery and ticketing platform built by a professional development team.

It must combine:

```text
Premium UI
+
Next.js
+
React
+
TypeScript
+
Node.js
+
Express
+
MongoDB Atlas
+
JWT Authentication
+
OTP Email Verification
+
Razorpay
+
Booking System
+
Digital Tickets
+
QR Verification
+
Reviews
+
Notifications
+
Organizer Dashboard
+
Admin Dashboard
+
Analytics
+
Responsive Design
+
SEO
+
Production Deployment
```

into one cohesive platform.

---

# 87. FINAL INSTRUCTION TO THE AI

Do not start by blindly generating hundreds of files.

First:

```text
1. Read every Eventora reference file.
2. Understand the architecture.
3. Inspect the existing project structure.
4. Identify what already exists.
5. Create a development plan.
6. Implement the backend foundation.
7. Implement the database.
8. Implement authentication.
9. Implement the core APIs.
10. Implement payment.
11. Implement ticketing.
12. Implement the frontend.
13. Connect frontend to backend.
14. Test every major workflow.
15. Fix errors.
16. Optimize UI.
17. Prepare production deployment.
```

If an existing implementation already exists, **do not unnecessarily rewrite working code**.

Extend and improve it.

Do not create duplicate models, duplicate API routes, duplicate authentication systems, or duplicate components.

The final result must be a single cohesive application named:

# EVENTORA

### Discover. Book. Experience.

Build it as a serious final-year project capable of being demonstrated confidently to external examiners.
