# Eventora — Testing & Quality Assurance Documentation

## 1. Purpose

This document defines how Eventora must be tested before the project is considered complete.

Testing must cover:

* Backend APIs
* MongoDB
* Authentication
* OTP
* Authorization
* Event management
* Booking system
* Razorpay payments
* Tickets
* QR verification
* Reviews
* Notifications
* Organizer dashboard
* Admin dashboard
* Frontend
* Deployment
* Security
* Responsive UI

The goal is to ensure Eventora is reliable enough for a final-year project demonstration and external evaluation.

---

# 2. Testing Environment

## Backend

```text
Node.js
Express.js
MongoDB Atlas
JWT
Razorpay Test Mode
Email service
```

## Frontend

```text
Next.js
React
TypeScript
Tailwind CSS
Axios
```

## Testing Tools

Use:

```text
Postman
MongoDB Atlas
Browser DevTools
Razorpay Test Mode
Lighthouse
```

---

# 3. Backend Health Test

Request:

```http
GET /api/health
```

Expected:

```json
{
  "success": true,
  "message": "Eventora API is running",
  "database": "connected"
}
```

Also test:

```http
GET /
```

Expected:

```json
{
  "success": true,
  "message": "Eventora Backend API 🚀"
}
```

---

# 4. Authentication Testing

## Test 1 — Register New User

```http
POST /api/auth/register
```

Request:

```json
{
  "name": "Test User One",
  "email": "user1@example.com",
  "password": "Password@123"
}
```

Expected:

```text
201 Created
```

Verify:

* User exists in MongoDB.
* Password is hashed.
* User is initially unverified.
* OTP is generated.
* OTP email is sent.

---

# 5. Duplicate Registration

Register using the same email again.

Expected:

```text
400 / 409
```

Response should indicate that the account already exists.

---

# 6. Invalid Registration

Test:

```text
empty name
invalid email
short password
missing password
```

Expected:

```text
400 Bad Request
```

---

# 7. OTP Verification

Request:

```http
POST /api/auth/verify-otp
```

Use the OTP received through email.

Expected:

```text
200 OK
```

Verify:

```text
isVerified = true
```

in MongoDB.

---

# 8. Invalid OTP

Enter an incorrect OTP.

Expected:

```text
400 Bad Request
```

The account must remain unverified.

---

# 9. Expired OTP

Wait until the OTP expires or use a test configuration with a short expiry.

Expected:

```text
OTP expired
```

User should be able to request another OTP.

---

# 10. Resend OTP

Request:

```http
POST /api/auth/resend-otp
```

Expected:

```text
New OTP generated
Previous OTP invalidated
New email received
```

---

# 11. OTP Rate Limiting

Send multiple resend requests quickly.

Expected:

```text
429 Too Many Requests
```

or an equivalent controlled response.

---

# 12. Login Test

Request:

```http
POST /api/auth/login
```

```json
{
  "email": "user1@example.com",
  "password": "Password@123"
}
```

Expected:

```text
200 OK
```

Verify in Postman/browser:

```text
eventora_token
```

cookie exists.

---

# 13. HTTP-Only Cookie Test

Open the browser DevTools.

Go to:

```text
Application
→ Cookies
```

Verify:

```text
HttpOnly = true
```

The authentication token must not be accessible through normal client-side JavaScript.

---

# 14. Wrong Password

Use:

```json
{
  "email": "user1@example.com",
  "password": "WrongPassword"
}
```

Expected:

```text
401 Unauthorized
```

---

# 15. Unverified Login

Attempt login before email verification.

Expected:

```text
401 / 403
```

with a useful message instructing the user to verify their email.

---

# 16. `/auth/me`

Request:

```http
GET /api/auth/me
```

with the authentication cookie.

Expected:

```json
{
  "success": true,
  "user": {}
}
```

Without authentication:

```text
401 Unauthorized
```

---

# 17. Logout

Request:

```http
POST /api/auth/logout
```

Expected:

```text
200 OK
```

Verify the authentication cookie is cleared.

Then test:

```http
GET /api/auth/me
```

Expected:

```text
401 Unauthorized
```

---

# 18. Forgot Password

Request:

```http
POST /api/auth/forgot-password
```

```json
{
  "email": "user1@example.com"
}
```

Verify reset email/OTP is received.

---

# 19. Reset Password

Request:

```http
POST /api/auth/reset-password
```

Use valid reset OTP.

Expected:

```text
Password updated successfully
```

Then test login with the new password.

---

# 20. Role Authorization Testing

Create:

```text
User A
Organizer A
Admin A
```

Test protected routes using each account.

---

# 21. Normal User → Admin Route

Example:

```http
GET /api/admin/dashboard
```

Expected:

```text
403 Forbidden
```

---

# 22. Organizer → Admin Route

Organizer attempts:

```http
GET /api/admin/users
```

Expected:

```text
403 Forbidden
```

---

# 23. Admin → Admin Route

Admin requests:

```http
GET /api/admin/dashboard
```

Expected:

```text
200 OK
```

---

# 24. Event Creation Testing

Organizer:

```http
POST /api/events
```

Create a realistic event.

Verify:

```text
event created
organizer automatically assigned
status correct
ticket types created
inventory correct
```

---

# 25. User Cannot Create Events

Normal user attempts:

```http
POST /api/events
```

Expected:

```text
403 Forbidden
```

---

# 26. Event Ownership Test

Create:

```text
Organizer A → Event A
Organizer B → Event B
```

Organizer B attempts to edit Event A.

Expected:

```text
403 Forbidden
```

Organizer B must not be able to modify Organizer A's event.

---

# 27. Event Update Test

Organizer edits their own event.

Expected:

```text
200 OK
```

Verify MongoDB data changes correctly.

---

# 28. Event Delete Test

Organizer deletes their own event.

Expected:

```text
200 OK
```

Verify appropriate deletion/soft deletion behavior.

---

# 29. Event Publishing Test

Organizer publishes an event.

Verify:

```text
status = published
```

The event should then appear in public event listings if all publication requirements are satisfied.

---

# 30. Event Search Testing

Test:

```http
GET /api/events?search=music
```

Verify relevant results are returned.

Test:

```text
category
city
date
price
featured
sorting
pagination
```

---

# 31. Event Details Test

Request:

```http
GET /api/events/:slug
```

Verify:

```text
event information
venue
date
organizer
ticket types
availability
reviews
```

are returned correctly.

---

# 32. Wishlist Testing

Login as User A.

Add an event:

```http
POST /api/wishlist/:eventId
```

Expected:

```text
200 / 201
```

Then:

```http
GET /api/wishlist
```

Verify event appears.

Remove it:

```http
DELETE /api/wishlist/:eventId
```

Verify it disappears.

---

# 33. Booking Test

Login as User A.

Create booking:

```http
POST /api/bookings
```

Verify:

```text
booking created
correct event
correct user
correct ticket type
correct quantity
correct subtotal
correct fees
correct total
paymentStatus = pending
bookingStatus = pending
```

---

# 34. Price Manipulation Test

Attempt to send a fake price:

```json
{
  "eventId": "...",
  "tickets": [
    {
      "ticketTypeId": "...",
      "quantity": 2,
      "price": 1
    }
  ]
}
```

Backend must ignore client-supplied price.

The database price must be used.

---

# 35. Inventory Test

If only:

```text
2 tickets available
```

attempt to purchase:

```text
3 tickets
```

Expected:

```text
400 Bad Request
```

No overselling should occur.

---

# 36. Razorpay Order Test

Request:

```http
POST /api/payments/create-order
```

Verify:

```text
Razorpay order created
correct amount
correct currency
correct booking
razorpayOrderId saved
```

---

# 37. Razorpay Test Payment

Use Razorpay Test Mode.

Complete a test payment.

Verify Razorpay returns:

```text
razorpay_order_id
razorpay_payment_id
razorpay_signature
```

---

# 38. Payment Verification Test

Request:

```http
POST /api/payments/verify
```

Send valid Razorpay information.

Expected:

```text
paymentStatus = paid
bookingStatus = confirmed
```

---

# 39. Invalid Payment Signature

Modify:

```text
razorpay_signature
```

and send the request.

Expected:

```text
400 / 401
```

Payment must not be confirmed.

---

# 40. Wrong Order ID

Send a different Razorpay order ID.

Expected:

```text
Payment verification failed
```

Booking must remain unconfirmed.

---

# 41. Duplicate Payment Verification

Send the same valid payment verification request twice.

Expected:

```text
First request → confirms booking
Second request → safely handled
```

No duplicate tickets.

No duplicate revenue.

No duplicate booking.

---

# 42. Payment Failure

Simulate a failed Razorpay payment.

Verify:

```text
paymentStatus = failed
```

The user should be able to retry where appropriate.

---

# 43. Pending Booking Expiration

Create a pending booking.

Allow it to expire.

Expected:

```text
bookingStatus = expired
```

Reserved inventory should be released if Eventora uses temporary inventory reservations.

---

# 44. Payment Webhook Testing

Configure Razorpay webhook.

Test relevant events.

Verify:

```text
webhook received
signature verified
database updated
duplicate webhook safely handled
```

---

# 45. Ticket Generation Test

After successful payment verify:

```text
ticket created
ticket number unique
booking linked
event linked
user linked
QR information generated
```

---

# 46. Ticket Ownership Test

User A attempts to access User B's ticket.

Expected:

```text
403 Forbidden
```

or:

```text
404 Not Found
```

Do not expose User B's ticket.

---

# 47. QR Verification Test

Organizer scans a valid ticket.

Expected:

```text
valid ticket
event matches
ticket status active
```

After check-in:

```text
status = used
checkedInAt = timestamp
```

---

# 48. Duplicate Check-In

Scan the same ticket again.

Expected:

```text
Ticket already used
```

The system must not allow double check-in.

---

# 49. Wrong Organizer Check-In

Organizer B attempts to verify a ticket belonging to Organizer A's event.

Expected:

```text
403 Forbidden
```

---

# 50. Review Testing

A user with a confirmed booking can submit a review.

Test:

```text
rating = 1
rating = 3
rating = 5
```

Verify valid range.

Try:

```text
rating = 0
rating = 6
```

Expected:

```text
400 Bad Request
```

---

# 51. Review Eligibility

User without a confirmed booking attempts to review an event.

Expected:

```text
403 / 400
```

Review must be rejected.

---

# 52. Review Ownership

User A attempts to edit User B's review.

Expected:

```text
403 Forbidden
```

---

# 53. Notification Testing

Trigger events such as:

```text
successful booking
payment confirmation
event cancellation
password reset
```

Verify appropriate notification records are created.

---

# 54. Notification Read Test

Request:

```http
PATCH /api/notifications/:id/read
```

Verify:

```text
isRead = true
```

---

# 55. Organizer Dashboard Testing

Login as organizer.

Verify dashboard contains real database values:

```text
total events
published events
tickets sold
bookings
revenue
attendance
```

Do not use static dummy numbers.

---

# 56. Organizer Analytics

Verify:

```text
sales trends
revenue trends
event performance
attendance
ticket sales
```

match actual MongoDB records.

---

# 57. Admin Dashboard

Login as admin.

Verify:

```text
users
organizers
events
bookings
tickets
revenue
```

match database values.

---

# 58. Admin Event Moderation

Test:

```text
pending event
approve event
reject event
```

Verify event status changes correctly.

---

# 59. Admin User Management

Test:

```text
view users
search users
change role
suspend user
reactivate user
delete/deactivate user
```

Verify changes in MongoDB.

---

# 60. Pagination Testing

Test:

```text
?page=1&limit=10
?page=2&limit=10
```

Verify:

```text
correct records
correct page
correct total
correct total pages
```

Also test:

```text
limit=1000
```

Backend should enforce a maximum limit.

---

# 61. MongoDB Testing

Check MongoDB Atlas after important operations.

Verify collections such as:

```text
users
events
categories
bookings
payments
tickets
reviews
notifications
```

Check:

```text
relationships
indexes
unique fields
timestamps
```

---

# 62. Unique Index Testing

Verify uniqueness for fields such as:

```text
user.email
ticket.ticketNumber
booking.bookingNumber
payment.razorpayPaymentId
```

Duplicate values should not create duplicate records.

---

# 63. Security Testing

Test that the API does not expose:

```text
passwordHash
JWT_SECRET
MONGODB_URI
RAZORPAY_KEY_SECRET
OTP hashes
reset tokens
```

---

# 64. Authentication Bypass Testing

Try accessing:

```text
/api/admin/dashboard
/api/bookings
/api/tickets
/api/organizer/dashboard
```

without authentication.

Every protected endpoint must reject the request.

---

# 65. Role Bypass Testing

Attempt to modify request data:

```json
{
  "role": "admin"
}
```

as a normal user.

The backend must ignore/reject unauthorized role changes.

---

# 66. Ownership Bypass Testing

Change:

```text
eventId
bookingId
ticketId
reviewId
```

to another user's resource ID.

Backend must verify ownership or appropriate role permissions.

---

# 67. Input Validation Testing

Test malformed:

```text
MongoDB IDs
emails
dates
ratings
quantities
prices
strings
```

Backend should return controlled validation errors.

---

# 68. Frontend Testing

Verify:

```text
homepage
event listing
event details
search
filters
login
registration
OTP
profile
wishlist
checkout
payment
booking confirmation
tickets
QR
reviews
organizer dashboard
admin dashboard
```

---

# 69. Loading States

Every API-driven page should have an appropriate loading state.

Verify:

```text
skeleton
spinner
progress indicator
```

where appropriate.

Avoid blank screens.

---

# 70. Error States

Test:

```text
backend unavailable
MongoDB unavailable
invalid API response
payment failure
expired session
404 page
network failure
```

Frontend should show useful error messages instead of crashing.

---

# 71. Empty States

Test:

```text
no events
empty wishlist
no bookings
no tickets
no notifications
no search results
no organizer events
no admin results
```

Each should have a polished empty-state UI.

---

# 72. Responsive Testing

Test at:

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

Verify:

```text
navigation
cards
event grids
forms
checkout
tables
dashboards
modals
```

do not overflow or break.

---

# 73. Browser Testing

Test Eventora in:

```text
Chrome
Edge
Firefox
```

At minimum, ensure the core application works correctly in Chromium-based browsers.

---

# 74. Performance Testing

Use Lighthouse.

Check:

```text
Performance
Accessibility
Best Practices
SEO
```

Optimize:

```text
images
fonts
JavaScript
API requests
lazy loading
```

---

# 75. API Performance

Check slow endpoints.

Pay particular attention to:

```text
event listing
search
admin analytics
organizer analytics
booking creation
```

Use database indexes and efficient queries.

---

# 76. Deployment Testing

After deployment:

```text
Frontend → Vercel
Backend → Render/other backend host
MongoDB → Atlas
```

Verify:

```text
frontend loads
backend health works
MongoDB connects
CORS works
authentication works
cookies work
emails work
Razorpay works
webhooks work
```

---

# 77. Production Environment Variables

Verify all required variables exist.

Backend:

```text
MONGODB_URI
JWT_SECRET
JWT_EXPIRES_IN
CLIENT_URL

EMAIL credentials
OTP configuration

RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

Frontend:

```text
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_RAZORPAY_KEY_ID
```

Never expose backend secrets through `NEXT_PUBLIC_*`.

---

# 78. CORS Testing

Production frontend should successfully call:

```text
https://YOUR-BACKEND/api/*
```

Verify:

```text
credentials
cookies
preflight requests
```

work correctly.

---

# 79. Production Authentication Test

After deployment:

1. Register.
2. Receive OTP.
3. Verify email.
4. Login.
5. Refresh page.
6. Verify session remains active.
7. Open profile.
8. Logout.
9. Verify protected routes reject access.

---

# 80. Production Payment Test

Use Razorpay Test Mode if the deployment is still in testing.

Verify:

```text
booking
order creation
checkout
payment verification
ticket generation
confirmation email
```

Do not switch to live payments until the complete flow has been tested.

---

# 81. Final End-to-End Scenario

Perform this exact demonstration:

```text
1. Open Eventora
2. Register User A
3. Receive OTP
4. Verify email
5. Login
6. Browse events
7. Open event details
8. Select tickets
9. Add to checkout
10. Create booking
11. Open Razorpay
12. Complete test payment
13. Verify payment
14. Receive booking confirmation
15. Open My Tickets
16. Display QR ticket
17. Organizer logs in
18. Organizer opens attendee list
19. Scan/verify ticket
20. Check in attendee
21. Admin logs in
22. View dashboard
23. View revenue
24. View users
25. View events
```

The entire flow must work without manual database modifications.

---

# 82. External Examiner Demonstration Checklist

Before the final presentation:

```text
[ ] Website opens correctly
[ ] Premium UI is responsive
[ ] Registration works
[ ] OTP email works
[ ] Login works
[ ] Logout works
[ ] Role system works
[ ] Event browsing works
[ ] Search works
[ ] Filters work
[ ] Event details work
[ ] Wishlist works
[ ] Booking works
[ ] Razorpay works
[ ] Payment verification works
[ ] Tickets generated
[ ] QR generated
[ ] Organizer dashboard works
[ ] Ticket verification works
[ ] Admin dashboard works
[ ] MongoDB records update correctly
[ ] Emails work
[ ] No console errors
[ ] No exposed secrets
[ ] Backend health endpoint works
[ ] Production deployment works
```

---

# 83. Final Quality Standard

Eventora should not be considered complete merely because:

```text
the website loads
```

It is complete only when:

```text
Frontend
   ↓
Backend
   ↓
MongoDB
   ↓
Authentication
   ↓
Email/OTP
   ↓
Booking
   ↓
Razorpay
   ↓
Payment Verification
   ↓
Ticket Generation
   ↓
QR Verification
   ↓
Organizer
   ↓
Admin
```

all work together as one integrated system.

---

# 84. Final Rule

Every important feature must be tested through the actual application.

Do not manually insert database records to make the demonstration work.

Do not use fake payment success responses.

Do not use fake dashboard statistics.

Do not use hardcoded booking/ticket information.

The final Eventora demonstration must represent a real end-to-end application.
