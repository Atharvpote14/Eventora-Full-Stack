# Eventora — Project Requirements

## Smart Event Discovery, Registration, Payment & Digital Ticket Management Platform

**Project Name:** Eventora
**Project Type:** Full-Stack Web Application
**Project Category:** Event Discovery, Registration, Ticketing & Management
**Target Platform:** Web
**Primary Users:** Customers, Event Organizers, Administrators

---

# 1. Project Overview

Eventora is a modern full-stack event discovery and ticket management platform that allows users to discover events, view detailed event information, register for free events, purchase tickets for paid events, receive digital tickets, and manage their bookings from a centralized platform.

The system also provides dedicated dashboards for event organizers and administrators.

Event organizers can create and manage events, monitor registrations, track ticket sales and revenue, and manage event capacity.

Administrators have complete control over users, organizers, events, categories, bookings, payments, reports, and platform analytics.

The platform is designed to provide a polished, premium, real-world user experience rather than a conventional academic CRUD interface.

---

# 2. Project Objectives

The primary objectives of Eventora are:

1. Provide a centralized platform for discovering events.
2. Allow users to register for events online.
3. Support both free and paid events.
4. Implement secure online payments using Razorpay.
5. Generate digital tickets after successful booking.
6. Provide QR-based ticket verification.
7. Implement email-based OTP verification.
8. Provide secure authentication and authorization.
9. Provide separate experiences for users, organizers, and administrators.
10. Allow organizers to manage their events and bookings.
11. Allow administrators to monitor and manage the complete platform.
12. Store application data securely in MongoDB Atlas.
13. Provide responsive interfaces across desktop, tablet, and mobile devices.
14. Provide analytics for events, bookings, users, and revenue.
15. Demonstrate a complete production-style full-stack architecture.

---

# 3. Core Problem Statement

Traditional event registration often involves disconnected systems for:

* Event discovery
* Registration
* Payment
* Ticket generation
* Participant management
* Event administration

This can create unnecessary complexity for both event organizers and attendees.

Eventora addresses this problem by providing a single platform that combines:

**Discovery → Registration → Payment → Ticketing → Event Management → Analytics**

into one integrated system.

---

# 4. Target Users

Eventora will support three primary roles.

## 4.1 Customer / User

A normal platform user who discovers and participates in events.

Users can:

* Register an account
* Verify their email
* Login
* Browse events
* Search events
* Filter events
* View event details
* Register for free events
* Purchase paid tickets
* Make Razorpay payments
* View bookings
* View digital tickets
* Access QR codes
* Manage their profile
* Add events to wishlist
* Review eligible events
* Logout

---

# 5. Event Organizer

An organizer is a verified user who manages events.

Organizers can:

* Access an organizer dashboard
* Create events
* Upload event images
* Define event details
* Select event categories
* Define ticket pricing
* Define event capacity
* Define event location
* Edit their events
* Cancel eligible events
* View attendees
* View bookings
* View ticket sales
* View revenue
* View event analytics
* Monitor available capacity

Organizer-created events may require administrator approval before becoming publicly visible.

---

# 6. Administrator

Administrators have platform-wide management privileges.

Administrators can:

* View platform statistics
* Manage users
* Manage organizers
* Manage events
* Approve/reject organizer events
* Manage event categories
* View bookings
* View payments
* View tickets
* View reports
* Block/unblock users
* Manage reported content
* Monitor revenue
* View analytics
* Manage platform settings where applicable

---

# 7. Authentication Requirements

Eventora must implement secure authentication.

Required functionality:

* User registration
* Login
* Logout
* Email verification
* OTP verification
* Forgot password
* Password reset
* Current authenticated user
* Protected routes
* Role-based authorization

Authentication should use:

* JWT
* HttpOnly cookies
* bcrypt password hashing
* Secure cookie configuration
* Server-side authentication middleware

Authentication credentials must never be exposed unnecessarily to the frontend.

Passwords must never be stored in plaintext.

---

# 8. Email OTP Requirements

Email OTP verification is mandatory.

OTP functionality should support:

* Registration verification
* Forgot-password verification
* OTP expiration
* OTP regeneration
* Invalid OTP handling
* Maximum verification attempts where appropriate

EmailJS will be used for email delivery.

The system should provide clear states:

* OTP sent
* OTP expired
* Incorrect OTP
* OTP verified
* Resend OTP
* Verification successful

---

# 9. Event Discovery Requirements

The public event discovery experience is one of the most important parts of Eventora.

Users should be able to discover events through:

* Search
* Categories
* Location
* Date
* Price
* Popularity
* Upcoming events
* Recommended events
* Featured events
* Trending events

The information architecture may take inspiration from modern event-discovery platforms such as BookMyShow, which currently emphasizes search, location, category navigation, recommendation sections, and city-oriented discovery. Eventora must maintain its own original branding, UI, layouts, content, and visual identity.

---

# 10. Event Categories

The system should support categories such as:

* Technology
* Education
* Business
* Workshops
* Conferences
* Music
* Entertainment
* Sports
* Gaming
* Competitions
* Seminars
* Networking
* Cultural
* Other

Categories should be database-driven rather than hardcoded wherever practical.

Administrators should be able to manage categories.

---

# 11. Event Details Requirements

Every event should provide complete information.

Required event information:

* Event title
* Event description
* Cover image
* Category
* Organizer
* Date
* Start time
* End time
* Venue
* Address
* City
* Ticket price
* Capacity
* Available seats
* Event status
* Registration deadline
* Event creation date

Optional information may include:

* Event gallery
* Speakers
* Rules
* Requirements
* FAQs
* Contact information
* Social links
* Map location

---

# 12. Event Types

Eventora should support multiple event types, including:

* Free events
* Paid events
* Online events
* Offline events
* Hybrid events

The implementation should remain extensible for future event types.

---

# 13. Booking Requirements

Users should be able to book available events.

Booking flow:

```text
Browse Event
      ↓
View Event Details
      ↓
Select Ticket
      ↓
Check Availability
      ↓
Create Booking
      ↓
Free Event OR Paid Event
      ↓
Payment if required
      ↓
Booking Confirmation
      ↓
Digital Ticket
```

The backend must validate availability before confirming a booking.

The system must prevent overbooking.

---

# 14. Free Event Registration

For free events:

```text
User
 ↓
Register
 ↓
Confirm Registration
 ↓
Booking Created
 ↓
Ticket Generated
 ↓
Email Confirmation
```

No Razorpay transaction is required for a free event.

---

# 15. Paid Event Requirements

For paid events:

```text
User
 ↓
Select Event
 ↓
Create Razorpay Order
 ↓
Open Razorpay Checkout
 ↓
Complete Payment
 ↓
Backend Verification
 ↓
Confirm Booking
 ↓
Generate Ticket
 ↓
Send Confirmation
```

Payment confirmation must never rely solely on frontend information.

The backend must verify the payment using Razorpay's server-side verification mechanism.

---

# 16. Razorpay Requirements

Razorpay integration is mandatory.

The system should support:

* Order creation
* Razorpay Checkout
* Payment ID handling
* Order ID handling
* Signature/payment verification
* Successful payment state
* Failed payment state
* Cancelled payment state
* Payment record storage
* Booking confirmation only after successful verification

Payment data should be stored in MongoDB.

Sensitive Razorpay credentials must remain in environment variables and must never be committed to GitHub.

---

# 17. Payment Data

Payment records should maintain information such as:

* User ID
* Event ID
* Booking ID
* Razorpay Order ID
* Razorpay Payment ID
* Amount
* Currency
* Payment status
* Verification status
* Timestamp

---

# 18. Digital Ticket Requirements

After successful registration/payment, Eventora should generate a digital ticket.

Each ticket should have:

* Unique ticket ID
* Booking ID
* User information
* Event information
* Event date/time
* Venue
* Ticket status
* QR code
* Issue timestamp

Example ticket identifier:

```text
EVT-2026-000421
```

Ticket IDs must be unique.

---

# 19. QR Code Requirements

Each valid ticket should contain a QR code.

The QR code should encode a secure ticket identifier or verification reference.

The system should support a ticket verification workflow:

```text
Organizer/Admin
      ↓
Scan QR
      ↓
Verify Ticket
      ↓
Check Ticket Status
      ↓
Valid
  OR
Invalid / Used / Cancelled
```

A ticket should not be accepted multiple times if the event uses one-time check-in.

---

# 20. Booking Status

Bookings should support states such as:

```text
PENDING
CONFIRMED
CANCELLED
FAILED
COMPLETED
```

The exact implementation should remain consistent across the database, API, and frontend.

---

# 21. Ticket Status

Tickets should support states such as:

```text
ACTIVE
USED
CANCELLED
EXPIRED
```

---

# 22. Event Status

Events should support states such as:

```text
DRAFT
PENDING_APPROVAL
PUBLISHED
REJECTED
CANCELLED
COMPLETED
```

---

# 23. User Dashboard

Authenticated users should have a dashboard containing:

* Welcome section
* Upcoming bookings
* Recent tickets
* Saved/wishlist events
* Booking statistics
* Quick actions
* Profile summary

Users should be able to quickly access:

* Browse Events
* My Bookings
* My Tickets
* Wishlist
* Profile

---

# 24. Organizer Dashboard

Organizer dashboard should display:

* Total events
* Published events
* Pending events
* Tickets sold
* Total bookings
* Total revenue
* Available capacity
* Recent bookings
* Recent events
* Revenue charts
* Booking charts

---

# 25. Admin Dashboard

Admin dashboard should provide:

* Total users
* Total organizers
* Total events
* Total bookings
* Tickets sold
* Total revenue
* Pending event approvals
* Recent registrations
* Recent bookings
* Payment statistics
* Revenue trends
* User growth
* Event category distribution

---

# 26. Search Requirements

Search should support event discovery based on:

* Event title
* Description
* Category
* Organizer
* Location

Search should provide useful empty-state feedback.

Example:

```text
No events found for "AI Workshop".
Try another search or explore our categories.
```

---

# 27. Filtering Requirements

Users should be able to filter by:

* Category
* City
* Date
* Price
* Event type
* Availability

Filters should be responsive and usable on mobile devices.

---

# 28. Sorting Requirements

Support sorting such as:

* Recommended
* Newest
* Upcoming
* Price: Low to High
* Price: High to Low
* Most Popular

---

# 29. Wishlist

Users should be able to save events to a personal wishlist.

Requirements:

* Add event
* Remove event
* View wishlist
* Prevent duplicate wishlist entries
* Require authentication

---

# 30. Reviews & Ratings

Users may review eligible events.

Requirements:

* Rating
* Review text
* User
* Event
* Timestamp

A user should only be allowed to review an event when the project's business rules consider them eligible, preferably after attending/completing the event.

Users should not be able to submit unlimited duplicate reviews for the same event.

---

# 31. Notification Requirements

The platform should support notifications for important events such as:

* Account verification
* Booking confirmation
* Payment confirmation
* Ticket creation
* Event updates
* Event cancellation
* Booking cancellation
* Password reset

The notification system should be designed so additional channels can be added later.

---

# 32. Admin Event Approval

Organizer-created events should optionally follow:

```text
Organizer creates event
        ↓
PENDING_APPROVAL
        ↓
Admin reviews
        ↓
APPROVED → PUBLISHED
        OR
REJECTED
```

Rejected events should store an appropriate reason where applicable.

---

# 33. Capacity Management

Each event must maintain:

* Maximum capacity
* Current bookings
* Available seats

The system must prevent bookings after capacity is reached.

Example:

```text
Capacity: 100
Booked: 96
Available: 4
```

When available seats reach zero:

```text
SOLD OUT
```

The frontend should clearly communicate availability.

---

# 34. Cancellation Requirements

The system should support cancellation according to event and booking rules.

Potential cancellation states:

* Booking cancellation
* Event cancellation
* Ticket cancellation

Business rules must determine whether a cancellation is permitted.

If refunds are implemented, refund processing must be handled securely and consistently with Razorpay capabilities and the project's defined refund policy.

---

# 35. Responsive Design

Eventora must be fully responsive.

Target devices:

* Mobile phones
* Tablets
* Laptops
* Desktop monitors

The application must avoid:

* Horizontal overflow
* Broken navigation
* Unusable forms
* Overlapping cards
* Tiny touch targets
* Desktop-only interactions

---

# 36. Premium UI Requirement

Eventora must NOT look like a generic AI-generated dashboard.

Avoid:

* Excessive purple gradients
* Generic glassmorphism everywhere
* Random glowing blobs
* Excessive neon effects
* Generic centered SaaS hero layouts
* Unnecessary animations
* Template-like dashboard cards

The visual direction should instead emphasize:

* Strong event photography
* Cinematic imagery
* Editorial layouts
* Premium typography
* High-quality event cards
* Dense but organized discovery
* Clear hierarchy
* Restrained accent colors
* Sophisticated spacing
* Subtle motion
* Strong hover interactions
* Professional navigation
* Excellent mobile experience

The design should be inspired by the usability and discovery principles of modern entertainment/event platforms, while remaining completely original to Eventora.

---

# 37. Accessibility

The application should follow accessible web-development practices.

Requirements:

* Semantic HTML
* Keyboard navigation
* Visible focus states
* Appropriate ARIA labels
* Accessible forms
* Good contrast
* Descriptive buttons
* Accessible dialogs
* Screen-reader-friendly navigation

---

# 38. Performance

The application should prioritize:

* Optimized images
* Lazy loading where appropriate
* Efficient API requests
* Pagination
* Server-side rendering where beneficial
* Client components only where necessary
* Code splitting
* Avoiding unnecessary re-renders
* Proper loading states

---

# 39. Error Handling

The application must gracefully handle:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
429 Too Many Requests
500 Internal Server Error
Network Error
Payment Failure
OTP Failure
```

Users should receive understandable messages instead of raw technical errors.

---

# 40. Loading States

Important operations should display appropriate loading states.

Examples:

* Page skeleton
* Event card skeleton
* Button loading state
* Payment loading state
* OTP verification loading state
* Dashboard loading state
* Ticket loading state

Avoid unnecessary full-screen loaders.

---

# 41. Security Requirements

The application should implement:

* Password hashing
* JWT authentication
* HttpOnly cookies
* Role-based authorization
* Input validation
* Server-side validation
* CORS configuration
* Helmet/security headers
* Rate limiting where appropriate
* Secure environment variables
* Payment verification
* Ownership checks
* Protected administrative APIs

Never expose:

* Database credentials
* JWT secrets
* Razorpay secret keys
* Email service secrets
* Other private environment variables

---

# 42. Technology Requirements

## Frontend

Preferred:

* Next.js
* React
* TypeScript
* Tailwind CSS
* Framer Motion
* Axios
* React Hook Form
* Zod
* Lucide React
* Recharts

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt

## External Services

* MongoDB Atlas
* Razorpay
* EmailJS
* Cloudinary or approved image-storage service

## Deployment

* Vercel for frontend
* Render for backend
* MongoDB Atlas for database

---

# 43. Environment Variables

Secrets must be stored in environment variables.

Expected categories include:

```text
DATABASE / MONGODB
JWT
RAZORPAY
EMAILJS
CLOUDINARY
FRONTEND URL
BACKEND URL
```

Actual secret values must never be included in source code or reference files.

---

# 44. Database Requirement

MongoDB Atlas is mandatory.

The database must be properly structured using Mongoose schemas.

Expected major entities:

```text
User
Event
Category
Booking
Payment
Ticket
OTP Verification
Review
Wishlist
Notification
```

Relationships and indexes must be defined in the dedicated database schema specification.

---

# 45. API Requirement

The backend must expose RESTful APIs for:

* Authentication
* Users
* Events
* Categories
* Bookings
* Payments
* Tickets
* Reviews
* Wishlist
* Notifications
* Admin operations
* Organizer operations

The complete endpoint specification will be defined separately in `API-Reference.md`.

---

# 46. Deployment Requirement

The completed system should be deployable as:

```text
Frontend
Vercel
   ↓
Backend API
Render
   ↓
MongoDB Atlas
```

Production environment variables must be configured separately for frontend and backend.

Production CORS and cookie configuration must support the deployed frontend/backend domains.

---

# 47. Project Quality Requirement

Eventora must be developed as a serious portfolio and final-year project.

The codebase must prioritize:

* Maintainability
* Modularity
* Reusability
* Type safety
* Security
* Performance
* Responsive design
* Consistent UI
* Clean API architecture
* Proper error handling
* Clear documentation

Do not create unnecessary features merely to increase feature count.

Every feature should have a clear purpose within the event-management workflow.

---

# 48. Academic Demonstration Requirements

The project should be easy to demonstrate to external examiners.

The demonstration should be able to show:

### User Flow

```text
Register
→ OTP
→ Login
→ Browse Event
→ Book
→ Razorpay
→ Payment Verification
→ Ticket
→ QR
```

### Organizer Flow

```text
Organizer Login
→ Create Event
→ Submit for Approval
→ Admin Approval
→ Published Event
→ View Bookings
→ View Revenue
```

### Admin Flow

```text
Admin Login
→ Dashboard
→ Approve Event
→ Manage Users
→ Monitor Bookings
→ Monitor Payments
→ View Analytics
```

---

# 49. Primary Success Criteria

Eventora will be considered complete when:

* Authentication works correctly.
* Email OTP verification works.
* Users can discover events.
* Organizers can create events.
* Administrators can approve/reject events.
* Users can register for free events.
* Users can purchase paid tickets.
* Razorpay payments are verified server-side.
* Successful bookings generate tickets.
* Tickets contain unique identifiers and QR codes.
* Ticket verification works.
* Users can manage their bookings.
* Organizers can view event statistics.
* Administrators can manage the platform.
* MongoDB stores all required application data.
* Production frontend and backend communicate correctly.
* The application is responsive.
* Error and loading states are implemented.
* Security practices are implemented.
* The codebase is documented and deployment-ready.

---

# 50. Future Expansion Possibilities

The architecture should remain extensible for future features such as:

* Mobile application
* Google Maps integration
* Push notifications
* Calendar integration
* Advanced recommendation engine
* AI-based event recommendations
* Dynamic pricing
* Coupon system
* Referral system
* Multi-organizer events
* Corporate event management
* Advanced QR check-in
* Automated invoices
* Refund automation

These are future possibilities and should not be implemented unless explicitly included in the final project scope.

---

# 51. Development Principle

Build Eventora as a **real event-commerce platform**, not as a collection of unrelated college-project features.

Every major component should connect to the central workflow:

**Discover → Decide → Register → Pay → Receive Ticket → Attend → Review**

while organizers and administrators manage the system around that workflow.
