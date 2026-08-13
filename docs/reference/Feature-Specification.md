# Eventora — Feature Specification

## Smart Event Discovery, Registration, Payment & Digital Ticket Management Platform

**Project:** Eventora
**Document:** Feature Specification
**Version:** 1.0

---

# 1. Purpose

This document defines the complete functional feature set of Eventora.

The AI/development system must use this document as the functional source of truth when implementing the application.

Features must be implemented according to their purpose and relationships with other modules.

Do not invent unrelated features, duplicate functionality, or add unnecessary complexity.

---

# 2. Feature Architecture

Eventora is divided into the following major modules:

```text
Eventora
│
├── Public Website
│   ├── Home
│   ├── Event Discovery
│   ├── Event Details
│   ├── Categories
│   └── Search
│
├── Authentication
│   ├── Register
│   ├── OTP Verification
│   ├── Login
│   ├── Logout
│   ├── Forgot Password
│   └── Reset Password
│
├── User Module
│   ├── Dashboard
│   ├── Bookings
│   ├── Tickets
│   ├── Wishlist
│   ├── Reviews
│   └── Profile
│
├── Organizer Module
│   ├── Dashboard
│   ├── Events
│   ├── Create Event
│   ├── Edit Event
│   ├── Bookings
│   ├── Attendees
│   └── Analytics
│
├── Admin Module
│   ├── Dashboard
│   ├── Users
│   ├── Organizers
│   ├── Events
│   ├── Categories
│   ├── Bookings
│   ├── Payments
│   ├── Tickets
│   ├── Reports
│   └── Analytics
│
├── Payment System
│   └── Razorpay
│
├── Ticket System
│   ├── Digital Tickets
│   ├── QR Codes
│   └── Verification
│
└── Communication
    ├── Email OTP
    ├── Booking Emails
    └── Notifications
```

---

# 3. Public Website

Public users should be able to browse Eventora without creating an account.

---

## 3.1 Homepage

The homepage should provide a premium event-discovery experience.

Sections may include:

### Header

* Eventora logo
* Location selector
* Search
* Event/category navigation
* Login/Register
* User profile when authenticated

### Main Discovery Area

* Featured event
* Event imagery
* Event title
* Date
* Location
* Category
* CTA

### Event Sections

Examples:

```text
Recommended For You
Trending Events
Popular Near You
Upcoming Events
Top Workshops
Technology & Conferences
Music & Entertainment
Free Events
```

Event sections should use horizontal rails/cards where appropriate.

The homepage must not feel like a generic SaaS dashboard.

---

# 4. Event Discovery

## 4.1 Event Listing

Users can browse all published events.

Each event card should show:

* Cover image
* Event title
* Category
* Date
* Location
* Starting price
* Availability/status
* Organizer
* Wishlist button

---

## 4.2 Search

Search should support:

* Event title
* Description
* Category
* Location
* Organizer

Search should provide:

* Search suggestions where practical
* Loading state
* Empty state
* Clear search option

---

## 4.3 Filters

Supported filters:

```text
Category
Location
Date
Price
Event Type
Availability
```

---

## 4.4 Sorting

Supported sorting:

```text
Recommended
Newest
Upcoming
Price: Low to High
Price: High to Low
Most Popular
```

---

# 5. Event Details

The event details page is one of the most important pages.

It should contain:

### Event Hero

* Large event image
* Event title
* Category
* Organizer
* Date
* Location
* Price
* Availability

### Description

Full event description.

### Event Information

```text
Date
Time
Venue
Address
City
Duration
Registration deadline
```

### Organizer Information

* Organizer name
* Organizer profile
* Organizer contact information where permitted
* Other events by organizer

### Ticket Section

Display:

* Ticket type
* Price
* Availability
* Quantity selector
* Booking CTA

### Additional Sections

Where available:

* Event gallery
* Speakers
* Rules
* Requirements
* FAQs
* Reviews
* Similar events

---

# 6. Authentication Module

---

## 6.1 Registration

Registration form:

```text
Name
Email
Password
Confirm Password
```

Flow:

```text
Enter details
      ↓
Validate
      ↓
Create pending account / verification state
      ↓
Send OTP
      ↓
Verify OTP
      ↓
Activate account
```

Validation:

* Required fields
* Valid email
* Password requirements
* Password confirmation
* Duplicate email prevention

---

# 7. Email OTP

OTP screen should include:

* Email being verified
* OTP input
* Countdown
* Resend button
* Verification state
* Error state
* Success state

OTP should:

* Expire
* Be securely generated
* Be stored safely
* Be invalid after successful verification
* Have reasonable attempt limits

EmailJS will be used for sending emails.

---

# 8. Login

Login fields:

```text
Email
Password
```

Features:

* Remember appropriate authentication state through secure cookies
* Forgot password
* Error messages
* Loading state
* Redirect according to role

---

# 9. Logout

Logout should:

* Invalidate/remove the authentication cookie
* Clear relevant client state
* Redirect to the appropriate public page

---

# 10. Forgot Password

Flow:

```text
Forgot Password
      ↓
Enter Email
      ↓
Send OTP
      ↓
Verify OTP
      ↓
Set New Password
      ↓
Password Updated
```

---

# 11. User Dashboard

The user dashboard should provide a personalized overview.

### Statistics

```text
Upcoming Events
Total Bookings
Active Tickets
Wishlist Events
```

### Sections

* Upcoming bookings
* Recent tickets
* Recommended events
* Wishlist preview
* Quick actions

---

# 12. My Bookings

Users can view all bookings.

Booking card/table should show:

```text
Event
Date
Booking ID
Ticket quantity
Amount
Payment status
Booking status
```

Actions:

* View booking
* View ticket
* Cancel when eligible

---

# 13. Booking Details

Booking details should contain:

* Booking ID
* User
* Event
* Ticket type
* Quantity
* Amount
* Payment status
* Booking status
* Date/time
* Ticket information

---

# 14. My Tickets

Users can view all generated tickets.

Each ticket should display:

* Event
* Ticket ID
* Date
* Venue
* QR code
* Status

Actions:

* View ticket
* Print/download where implemented

---

# 15. Wishlist

Users can:

* Add event to wishlist
* Remove event
* View saved events

The UI should provide immediate feedback.

Duplicate wishlist entries must be prevented.

---

# 16. Reviews & Ratings

Eligible users can review attended/completed events.

Review includes:

```text
Rating: 1–5
Review text
```

Users should be able to:

* Create review
* Edit their review where permitted
* Delete their review where permitted

The same user should not create multiple reviews for the same event unless explicitly allowed by the business rules.

---

# 17. User Profile

Profile should include:

```text
Name
Email
Profile image
Phone where required
Account status
Account creation date
```

Actions:

* Edit profile
* Change password
* Logout

---

# 18. Organizer Module

Organizers have access to a dedicated dashboard.

---

# 19. Organizer Dashboard

Display:

```text
Total Events
Published Events
Pending Events
Total Bookings
Tickets Sold
Revenue
```

Additional components:

* Recent bookings
* Recent events
* Revenue chart
* Booking trend
* Event performance

---

# 20. Create Event

Organizer event creation form should support:

### Basic Information

```text
Title
Description
Category
Event Type
```

### Media

```text
Cover Image
Optional Gallery
```

### Schedule

```text
Date
Start Time
End Time
Registration Deadline
```

### Location

```text
Venue
Address
City
```

### Ticket

```text
Free/Paid
Ticket Name
Price
Capacity
```

### Additional

```text
Rules
Requirements
FAQs
Contact Information
```

---

# 21. Event Creation Workflow

```text
Organizer
   ↓
Create Event
   ↓
Validate Data
   ↓
Save as Draft
   OR
Submit
   ↓
PENDING_APPROVAL
   ↓
Admin Review
   ↓
APPROVED
   ↓
PUBLISHED
```

If admin rejects:

```text
PENDING_APPROVAL
       ↓
REJECTED
       ↓
Organizer can view reason
```

---

# 22. Organizer Event Management

Organizer can view their events in categories such as:

```text
All
Draft
Pending
Published
Rejected
Cancelled
Completed
```

Actions depend on status.

Possible actions:

* View
* Edit
* Submit
* Cancel
* Duplicate where useful
* View analytics

---

# 23. Organizer Bookings

Organizers can view bookings belonging to their events.

Display:

```text
Booking ID
Attendee
Event
Ticket
Quantity
Amount
Status
Date
```

Organizers must not be able to access bookings belonging to unrelated events.

---

# 24. Organizer Attendees

Organizer can view event attendees.

Information may include:

* Name
* Email where permitted
* Ticket ID
* Booking ID
* Ticket status
* Check-in status

Sensitive user information should be minimized.

---

# 25. Organizer Analytics

Organizer analytics should include:

### Revenue

```text
Total Revenue
Revenue by Event
Revenue Over Time
```

### Ticket Statistics

```text
Tickets Sold
Tickets Remaining
Booking Rate
```

### Event Performance

```text
Views where tracked
Bookings
Revenue
Capacity utilization
```

Use Recharts or an equivalent chart library.

---

# 26. Admin Module

---

# 27. Admin Dashboard

The dashboard should provide a high-level platform overview.

### Statistics

```text
Total Users
Total Organizers
Total Events
Total Bookings
Tickets Sold
Revenue
Pending Approvals
```

### Analytics

* User growth
* Event growth
* Booking trends
* Revenue trends
* Category distribution

---

# 28. User Management

Admin can:

* View users
* Search users
* Filter users
* View user details
* Block user
* Unblock user
* Manage role where authorized

Admin must not be able to expose plaintext passwords.

---

# 29. Organizer Management

Admin can:

* View organizers
* Review organizer information
* Approve organizer status where applicable
* Suspend organizers where required

---

# 30. Event Management

Admin can:

* View all events
* Search events
* Filter events
* View pending events
* Approve events
* Reject events
* Cancel events where necessary
* View event details

---

# 31. Category Management

Admin can:

* Create category
* Edit category
* Delete category where safe
* Enable/disable category

Categories should be stored in MongoDB.

---

# 32. Booking Management

Admin can:

* View bookings
* Search bookings
* Filter bookings
* View booking details
* Monitor booking status
* Monitor payment status

---

# 33. Payment Management

Admin can view:

```text
Payment ID
Booking ID
Event
User
Amount
Payment status
Verification status
Date
```

Admin should never see sensitive payment secrets.

---

# 34. Ticket Management

Admin can:

* View tickets
* Search ticket IDs
* Verify ticket status
* View used/cancelled/active tickets
* Monitor check-ins

---

# 35. Ticket Verification

Ticket verification should support:

```text
Scan QR
    ↓
Read Ticket ID
    ↓
Find Ticket
    ↓
Validate:
   - Exists
   - Active
   - Correct Event
   - Not Cancelled
   - Not Already Used
    ↓
VALID
OR
INVALID
```

If valid and the event uses one-time check-in:

```text
ACTIVE → USED
```

---

# 36. Razorpay Payment Module

Paid booking flow:

```text
Select Event
     ↓
Select Ticket
     ↓
Check Availability
     ↓
Create Booking Intent
     ↓
Create Razorpay Order
     ↓
Checkout
     ↓
Payment
     ↓
Receive Payment Details
     ↓
Server Verification
     ↓
Payment Confirmed
     ↓
Booking Confirmed
     ↓
Ticket Generated
```

Failed payment must not generate a confirmed ticket.

---

# 37. Payment Failure Handling

Possible states:

```text
Payment Failed
Payment Cancelled
Payment Pending
Payment Successful
```

Frontend should provide:

* Retry payment
* Return to event
* View booking status

---

# 38. Email Notification Module

EmailJS can be used for:

### Authentication

* Registration OTP
* Password reset OTP

### Booking

* Booking confirmation
* Payment confirmation
* Ticket information

### Event

* Event update
* Event cancellation
* Important organizer communication

Email templates should be consistent with Eventora branding.

---

# 39. Notification Center

Authenticated users may have an in-app notification center.

Examples:

```text
Your booking is confirmed.
Your payment was successful.
Your event starts tomorrow.
Your event was cancelled.
Your ticket has been generated.
```

Notifications should support read/unread status.

---

# 40. Responsive Navigation

Desktop navigation may include:

```text
Logo
Events
Categories
Location
Search
Wishlist
Login/Profile
```

Mobile navigation should use an appropriate mobile pattern such as:

```text
Home
Explore
Bookings
Tickets
Profile
```

The exact layout should be defined in the UI reference document.

---

# 41. Event Card System

Event cards should be reusable.

Card information:

```text
Image
Category
Title
Date
Location
Price
Availability
Wishlist
```

Possible card variants:

```text
Featured Card
Standard Card
Compact Card
Horizontal Card
Search Result Card
```

Do not create separate unrelated card designs for every page.

---

# 42. Empty States

Every major collection page should have an intentional empty state.

Examples:

### No bookings

> You haven't booked any events yet.

CTA:

> Explore Events

### No wishlist

> Your saved events will appear here.

CTA:

> Discover Events

### No organizer events

> Create your first event and start building your audience.

CTA:

> Create Event

---

# 43. Error States

Important pages should handle:

* Network failure
* API failure
* Unauthorized access
* Forbidden access
* Event not found
* Booking unavailable
* Payment failure
* OTP failure
* Ticket invalid

Errors should use user-friendly messaging.

---

# 44. Loading States

Implement appropriate loading UI for:

* Event lists
* Event details
* Search
* Dashboard
* Booking
* Payment
* OTP
* Ticket verification
* Admin tables

Use skeletons where useful.

---

# 45. Toast/Feedback System

Use a consistent notification system for:

### Success

```text
Event saved successfully.
Booking confirmed.
Payment successful.
OTP verified.
Ticket generated.
```

### Error

```text
Unable to complete booking.
Payment verification failed.
Invalid OTP.
Event is sold out.
```

Avoid excessive toast notifications.

---

# 46. Role-Based UI

The frontend must adapt according to authentication and role.

### USER

```text
User Dashboard
Bookings
Tickets
Wishlist
Profile
```

### ORGANIZER

```text
Organizer Dashboard
Events
Bookings
Attendees
Analytics
Profile
```

### ADMIN

```text
Admin Dashboard
Users
Organizers
Events
Categories
Bookings
Payments
Tickets
Reports
Analytics
```

Users must never receive privileged frontend functionality merely by changing client-side state.

Backend authorization remains the source of truth.

---

# 47. Data Integrity

The backend must validate:

* Event ownership
* Booking ownership
* Ticket ownership
* Organizer event access
* Admin privileges
* Payment status
* Event availability
* Ticket status

Client-side validation alone is insufficient.

---

# 48. Performance Features

Use:

* Pagination for large datasets
* Debounced search where appropriate
* Optimized images
* Lazy loading
* API caching where appropriate
* Efficient MongoDB queries
* Database indexes
* Minimal unnecessary client-side state

---

# 49. Mobile Experience

Mobile users should be able to complete the entire primary workflow:

```text
Browse
→ Search
→ Event Details
→ Book
→ Pay
→ View Ticket
→ Show QR
```

No essential feature should require a desktop device.

---

# 50. Feature Priority

## P0 — Mandatory

These features are essential:

```text
Authentication
OTP
Event Discovery
Event Details
User Dashboard
Organizer Dashboard
Admin Dashboard
Event CRUD
Booking System
MongoDB
Razorpay
Payment Verification
Digital Tickets
QR Codes
Role Authorization
```

---

## P1 — Important

```text
Wishlist
Reviews
Analytics
Notifications
Event Approval
Ticket Verification
Advanced Search
Filtering
Sorting
```

---

## P2 — Optional/Future

```text
Google Maps
AI Recommendations
Coupons
Referral System
Push Notifications
Calendar Integration
Advanced Refund Automation
Mobile App
```

P2 features must not compromise the stability of P0/P1 functionality.

---

# 51. Core User Journey

The most important customer journey is:

```text
HOME
 ↓
DISCOVER EVENT
 ↓
EVENT DETAILS
 ↓
SELECT TICKET
 ↓
BOOKING
 ↓
RAZORPAY
 ↓
PAYMENT VERIFICATION
 ↓
BOOKING CONFIRMED
 ↓
DIGITAL TICKET
 ↓
QR CHECK-IN
 ↓
EVENT ATTENDANCE
 ↓
REVIEW
```

---

# 52. Core Organizer Journey

```text
ORGANIZER LOGIN
 ↓
DASHBOARD
 ↓
CREATE EVENT
 ↓
SUBMIT EVENT
 ↓
ADMIN APPROVAL
 ↓
EVENT PUBLISHED
 ↓
USERS BOOK TICKETS
 ↓
ORGANIZER MONITORS BOOKINGS
 ↓
EVENT DAY
 ↓
QR CHECK-IN
 ↓
ANALYTICS
```

---

# 53. Core Admin Journey

```text
ADMIN LOGIN
 ↓
ADMIN DASHBOARD
 ↓
REVIEW PLATFORM
 ↓
APPROVE EVENTS
 ↓
MONITOR USERS
 ↓
MONITOR BOOKINGS
 ↓
MONITOR PAYMENTS
 ↓
MONITOR TICKETS
 ↓
VIEW ANALYTICS
```

---

# 54. UX Principles

Eventora should prioritize:

1. Discovery
2. Clarity
3. Trust
4. Speed
5. Simple booking
6. Secure payment
7. Clear ticket ownership
8. Easy event management

The user should always understand:

* What event they are viewing
* When it happens
* Where it happens
* How much it costs
* Whether tickets are available
* What happens after clicking Book

---

# 55. Premium Product Principle

The application must feel like a real consumer-facing event platform.

Do not optimize for "maximum number of UI components."

Optimize for:

**Quality → Consistency → Usability → Performance → Trust**

The final product should be polished enough to demonstrate as a real startup/product concept rather than a simple academic CRUD application.
