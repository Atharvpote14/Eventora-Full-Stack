# Eventora — Database Schema

## MongoDB Atlas Database Design

**Project:** Eventora
**Database:** MongoDB Atlas
**ODM:** Mongoose
**Database Type:** NoSQL Document Database

---

# 1. Database Architecture

Eventora will use MongoDB Atlas as its primary database.

Recommended collections:

```text
users
events
categories
bookings
tickets
payments
reviews
wishlists
notifications
otpverifications
```

The database should use MongoDB ObjectIds for document relationships.

---

# 2. Entity Relationship Overview

```text
                         ┌──────────────┐
                         │    USERS     │
                         └──────┬───────┘
                                │
              ┌─────────────────┼──────────────────┐
              │                 │                  │
              ▼                 ▼                  ▼
         BOOKINGS            REVIEWS           WISHLISTS
              │
              ├───────────────┐
              │               │
              ▼               ▼
          PAYMENTS          TICKETS
              │               │
              └───────┬───────┘
                      │
                      ▼
                 ┌───────────┐
                 │  EVENTS   │
                 └─────┬─────┘
                       │
                       ▼
                    USERS
                 (Organizer)
```

---

# 3. Users Collection

Collection:

```text
users
```

Purpose:

Stores all registered accounts.

---

## 3.1 User Document

Example:

```json
{
  "_id": "ObjectId",
  "name": "Atharv Pote",
  "email": "atharv@example.com",
  "password": "HASHED_PASSWORD",
  "role": "user",
  "isVerified": true,
  "isActive": true,
  "profileImage": "",
  "phone": "",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 3.2 Fields

| Field          | Type     | Required | Description              |
| -------------- | -------- | -------: | ------------------------ |
| `_id`          | ObjectId |     Auto | Unique user ID           |
| `name`         | String   |      Yes | User's name              |
| `email`        | String   |      Yes | Unique email             |
| `password`     | String   |      Yes | Hashed password          |
| `role`         | String   |      Yes | user / organizer / admin |
| `isVerified`   | Boolean  |      Yes | Email/OTP verification   |
| `isActive`     | Boolean  |      Yes | Account status           |
| `profileImage` | String   |       No | Profile image URL        |
| `phone`        | String   |       No | Phone number             |
| `createdAt`    | Date     |     Auto | Creation date            |
| `updatedAt`    | Date     |     Auto | Last update              |

---

# 4. User Role Enum

Valid roles:

```text
user
organizer
admin
```

Default:

```text
user
```

---

# 5. User Validation

### Name

* Required
* Trim whitespace
* Reasonable minimum length

### Email

* Required
* Lowercase
* Valid email format
* Unique

### Password

* Required
* Never store plaintext
* Hash using bcrypt/bcryptjs

### Role

Must only accept:

```text
user
organizer
admin
```

Role changes must be protected by authorization.

---

# 6. User Indexes

Recommended:

```js
userSchema.index({ email: 1 }, { unique: true });
```

Optional:

```js
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
```

---

# 7. Events Collection

Collection:

```text
events
```

Purpose:

Stores all platform events.

---

# 8. Event Document

Example:

```json
{
  "_id": "ObjectId",
  "title": "Future Tech Summit 2026",
  "slug": "future-tech-summit-2026",
  "description": "A technology conference...",
  "category": "ObjectId",
  "organizer": "ObjectId",
  "coverImage": "https://example.com/event.jpg",
  "gallery": [],
  "eventType": "conference",
  "date": "Date",
  "startTime": "10:00",
  "endTime": "18:00",
  "registrationDeadline": "Date",
  "venue": "Convention Hall",
  "address": "Pune",
  "city": "Pune",
  "ticketTypes": [],
  "capacity": 500,
  "status": "published",
  "rules": [],
  "requirements": [],
  "faqs": [],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

# 9. Event Fields

| Field                  | Type     | Required | Description             |
| ---------------------- | -------- | -------: | ----------------------- |
| `_id`                  | ObjectId |     Auto | Event ID                |
| `title`                | String   |      Yes | Event name              |
| `slug`                 | String   |      Yes | SEO-friendly identifier |
| `description`          | String   |      Yes | Event description       |
| `category`             | ObjectId |      Yes | Category reference      |
| `organizer`            | ObjectId |      Yes | User reference          |
| `coverImage`           | String   |      Yes | Main image              |
| `gallery`              | Array    |       No | Additional images       |
| `eventType`            | String   |      Yes | Event classification    |
| `date`                 | Date     |      Yes | Event date              |
| `startTime`            | String   |      Yes | Start time              |
| `endTime`              | String   |       No | End time                |
| `registrationDeadline` | Date     |       No | Last booking date       |
| `venue`                | String   |      Yes | Venue                   |
| `address`              | String   |      Yes | Address                 |
| `city`                 | String   |      Yes | City                    |
| `ticketTypes`          | Array    |      Yes | Ticket definitions      |
| `capacity`             | Number   |      Yes | Maximum capacity        |
| `status`               | String   |      Yes | Event lifecycle         |
| `rules`                | Array    |       No | Event rules             |
| `requirements`         | Array    |       No | Requirements            |
| `faqs`                 | Array    |       No | FAQs                    |
| `createdAt`            | Date     |     Auto | Created date            |
| `updatedAt`            | Date     |     Auto | Updated date            |

---

# 10. Event Status

Valid statuses:

```text
draft
pending
published
rejected
cancelled
completed
```

Workflow:

```text
draft
  ↓
pending
  ↓
published
  ↓
completed
```

Alternative:

```text
pending
  ↓
rejected
  ↓
draft
```

---

# 11. Event Type

Examples:

```text
conference
workshop
concert
sports
gaming
education
business
entertainment
festival
other
```

Keep this extensible.

---

# 12. Ticket Type Structure

Ticket types should be embedded inside the event document.

Example:

```json
{
  "name": "Standard",
  "price": 999,
  "capacity": 200,
  "sold": 45
}
```

Recommended fields:

```text
name
price
capacity
sold
description
```

---

# 13. Ticket Availability

Availability should be calculated from:

```text
capacity - sold
```

Do not trust a frontend-supplied availability value.

The backend must verify availability before creating a booking.

---

# 14. Event Indexes

Recommended:

```js
eventSchema.index({ city: 1, date: 1 });
eventSchema.index({ category: 1, date: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ slug: 1 }, { unique: true });
```

For search:

```js
eventSchema.index({
  title: "text",
  description: "text"
});
```

---

# 15. Categories Collection

Collection:

```text
categories
```

Purpose:

Stores event categories.

Example:

```json
{
  "_id": "ObjectId",
  "name": "Technology",
  "slug": "technology",
  "description": "Technology and developer events",
  "image": "https://example.com/technology.jpg",
  "isActive": true,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

# 16. Category Fields

```text
name
slug
description
image
isActive
createdAt
updatedAt
```

---

# 17. Category Indexes

```js
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ name: 1 }, { unique: true });
```

---

# 18. Bookings Collection

Collection:

```text
bookings
```

Purpose:

Stores ticket booking transactions.

---

# 19. Booking Document

Example:

```json
{
  "_id": "ObjectId",
  "bookingReference": "EVT-BKG-284921",
  "user": "ObjectId",
  "event": "ObjectId",
  "ticketType": "Standard",
  "quantity": 2,
  "amount": 1998,
  "paymentStatus": "paid",
  "bookingStatus": "confirmed",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

# 20. Booking Fields

| Field              | Type     | Description               |
| ------------------ | -------- | ------------------------- |
| `_id`              | ObjectId | Booking ID                |
| `bookingReference` | String   | Public booking identifier |
| `user`             | ObjectId | User reference            |
| `event`            | ObjectId | Event reference           |
| `ticketType`       | String   | Purchased ticket          |
| `quantity`         | Number   | Number of tickets         |
| `amount`           | Number   | Total amount              |
| `paymentStatus`    | String   | Payment state             |
| `bookingStatus`    | String   | Booking state             |
| `createdAt`        | Date     | Creation time             |
| `updatedAt`        | Date     | Update time               |

---

# 21. Payment Status

Valid:

```text
pending
paid
failed
refunded
cancelled
```

---

# 22. Booking Status

Valid:

```text
pending
confirmed
cancelled
completed
```

---

# 23. Booking Indexes

```js
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ event: 1, createdAt: -1 });
bookingSchema.index({ bookingReference: 1 }, { unique: true });
bookingSchema.index({ paymentStatus: 1 });
```

---

# 24. Booking Security

A user must only be able to view their own bookings.

Organizer access:

```text
Organizer → bookings belonging to their events
```

Admin access:

```text
Admin → all bookings
```

The backend must enforce these rules.

---

# 25. Payments Collection

Collection:

```text
payments
```

Purpose:

Stores Razorpay payment information and server-side verification status.

---

# 26. Payment Document

Example:

```json
{
  "_id": "ObjectId",
  "booking": "ObjectId",
  "user": "ObjectId",
  "event": "ObjectId",
  "razorpayOrderId": "order_ABC123",
  "razorpayPaymentId": "pay_XYZ123",
  "razorpaySignature": "SIGNATURE",
  "amount": 1998,
  "currency": "INR",
  "status": "successful",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

# 27. Payment Status

```text
created
pending
successful
failed
refunded
```

---

# 28. Payment Indexes

```js
paymentSchema.index({ razorpayOrderId: 1 }, { unique: true });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
```

---

# 29. Razorpay Security

The following must NEVER be exposed to the browser:

```text
RAZORPAY_KEY_SECRET
```

The backend must:

1. Create the Razorpay order.
2. Receive payment details.
3. Verify the Razorpay signature.
4. Update payment status.
5. Confirm booking.
6. Generate tickets.

---

# 30. Tickets Collection

Collection:

```text
tickets
```

Purpose:

Stores individual digital tickets.

---

# 31. Ticket Document

Example:

```json
{
  "_id": "ObjectId",
  "ticketId": "EVT-TKT-823741",
  "booking": "ObjectId",
  "user": "ObjectId",
  "event": "ObjectId",
  "ticketType": "Standard",
  "qrCode": "QR_DATA_OR_URL",
  "status": "active",
  "checkedInAt": null,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

# 32. Ticket Fields

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
updatedAt
```

---

# 33. Ticket Status

```text
active
used
cancelled
expired
```

---

# 34. Ticket Indexes

```js
ticketSchema.index({ ticketId: 1 }, { unique: true });
ticketSchema.index({ user: 1 });
ticketSchema.index({ event: 1 });
ticketSchema.index({ booking: 1 });
```

---

# 35. Ticket Verification

When scanning a QR code:

```text
QR
 ↓
Ticket ID
 ↓
Database lookup
 ↓
Exists?
 ↓
Active?
 ↓
Correct event?
 ↓
Already used?
 ↓
VALID / INVALID
```

If valid:

```text
active → used
```

---

# 36. Reviews Collection

Collection:

```text
reviews
```

Purpose:

Stores user reviews of events.

---

# 37. Review Document

Example:

```json
{
  "_id": "ObjectId",
  "user": "ObjectId",
  "event": "ObjectId",
  "rating": 5,
  "comment": "Excellent event!",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

# 38. Review Validation

Rating:

```text
1–5
```

Comment:

* Required
* Reasonable maximum length

A user should generally be allowed only one review per event.

Use:

```js
reviewSchema.index(
  { user: 1, event: 1 },
  { unique: true }
);
```

---

# 39. Wishlist Collection

Collection:

```text
wishlists
```

Purpose:

Stores events saved by users.

---

# 40. Wishlist Document

Example:

```json
{
  "_id": "ObjectId",
  "user": "ObjectId",
  "event": "ObjectId",
  "createdAt": "Date"
}
```

---

# 41. Wishlist Index

Prevent duplicates:

```js
wishlistSchema.index(
  { user: 1, event: 1 },
  { unique: true }
);
```

---

# 42. Notifications Collection

Collection:

```text
notifications
```

Purpose:

Stores in-app notifications.

---

# 43. Notification Document

Example:

```json
{
  "_id": "ObjectId",
  "user": "ObjectId",
  "title": "Booking Confirmed",
  "message": "Your booking has been confirmed.",
  "type": "booking",
  "isRead": false,
  "referenceId": "ObjectId",
  "createdAt": "Date"
}
```

---

# 44. Notification Types

```text
booking
payment
event
ticket
account
system
```

---

# 45. Notification Index

```js
notificationSchema.index({
  user: 1,
  createdAt: -1
});
```

---

# 46. OTP Verification Collection

Collection:

```text
otpverifications
```

Purpose:

Temporary storage for OTP verification.

---

# 47. OTP Document

Example:

```json
{
  "_id": "ObjectId",
  "email": "atharv@example.com",
  "otpHash": "HASHED_OTP",
  "purpose": "registration",
  "expiresAt": "Date",
  "attempts": 0,
  "createdAt": "Date"
}
```

---

# 48. OTP Purpose

Valid values:

```text
registration
forgot-password
```

---

# 49. OTP Security

OTP should:

* Expire quickly
* Be single-use
* Have limited attempts
* Never be returned in API responses
* Ideally be stored hashed
* Be deleted/invalidated after successful verification

Use MongoDB TTL indexing where appropriate:

```js
otpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);
```

---

# 50. Relationships

## User → Event

An organizer creates events.

```text
Event.organizer → User._id
```

---

## User → Booking

```text
Booking.user → User._id
```

---

## Event → Booking

```text
Booking.event → Event._id
```

---

## Booking → Payment

```text
Payment.booking → Booking._id
```

---

## Booking → Ticket

```text
Ticket.booking → Booking._id
```

---

## User → Ticket

```text
Ticket.user → User._id
```

---

## Event → Ticket

```text
Ticket.event → Event._id
```

---

## User → Review

```text
Review.user → User._id
```

---

## Event → Review

```text
Review.event → Event._id
```

---

## User → Wishlist

```text
Wishlist.user → User._id
```

---

## Event → Wishlist

```text
Wishlist.event → Event._id
```

---

# 51. Population Strategy

Use Mongoose `populate()` where appropriate.

Example:

```js
Event.find()
  .populate("organizer", "name")
  .populate("category", "name");
```

For booking:

```js
Booking.find()
  .populate("user", "name email")
  .populate("event", "title date city");
```

Do not populate entire documents unnecessarily.

---

# 52. Database Security

MongoDB must never be directly accessible from the browser.

Correct:

```text
Browser
   ↓
Express API
   ↓
Mongoose
   ↓
MongoDB
```

Incorrect:

```text
Browser
   ↓
MongoDB
```

---

# 53. Password Security

Passwords must be hashed.

Example:

```js
const hashedPassword = await bcrypt.hash(password, 12);
```

Never:

```js
password: req.body.password
```

directly into MongoDB.

---

# 54. Authentication Data

JWT should NOT be stored as a normal user document field unless there is a specific reason.

Preferred:

```text
HTTP-only secure cookie
```

Authentication flow:

```text
Login
 ↓
Validate credentials
 ↓
Create JWT
 ↓
Set HTTP-only cookie
 ↓
Browser automatically sends cookie
 ↓
Auth middleware verifies JWT
```

---

# 55. Database Transactions

Critical operations should consider MongoDB transactions when multiple documents must remain consistent.

Example payment flow:

```text
Payment verified
       ↓
Booking confirmed
       ↓
Ticket created
       ↓
Event ticket count updated
```

If appropriate, these operations should be handled atomically.

---

# 56. Prevent Overselling

The backend must not simply do:

```text
Check availability
Create booking
```

without considering concurrent requests.

The ticket capacity update should be performed atomically or through a transaction/conditional update.

Goal:

```text
Available tickets can never become negative.
```

---

# 57. Booking Amount Security

Never trust:

```text
amount
price
total
```

sent by the browser.

The backend must calculate the amount using the actual event/ticket data stored in MongoDB.

Example:

```text
ticketPrice × quantity
```

The server-generated amount is the amount sent to Razorpay.

---

# 58. Payment Security

The backend must verify:

```text
razorpay_order_id
razorpay_payment_id
razorpay_signature
```

before marking the booking as paid.

Never mark:

```text
paymentStatus = "paid"
```

merely because the frontend says payment succeeded.

---

# 59. Event Ownership

When an organizer edits an event:

```text
req.user.role === "organizer"
```

AND:

```text
event.organizer === req.user._id
```

must both be satisfied.

The same rule applies to:

* Delete event
* Update event
* View organizer analytics
* View organizer bookings
* View attendees

---

# 60. Admin Authorization

Admin-only operations must verify:

```text
req.user.role === "admin"
```

Frontend hiding is NOT authorization.

The backend must enforce the rule.

---

# 61. Recommended MongoDB Database

Recommended:

```text
Database:
eventora
```

Collections:

```text
eventora
│
├── users
├── events
├── categories
├── bookings
├── tickets
├── payments
├── reviews
├── wishlists
├── notifications
└── otpverifications
```

---

# 62. Example Complete Flow

A user books a ₹999 ticket.

### Step 1

User selects:

```text
Standard Ticket
Price = ₹999
Quantity = 2
```

### Step 2

Backend calculates:

```text
₹999 × 2 = ₹1998
```

### Step 3

Backend creates Razorpay order.

### Step 4

User completes payment.

### Step 5

Backend verifies Razorpay signature.

### Step 6

Payment document becomes:

```text
successful
```

### Step 7

Booking becomes:

```text
confirmed
```

### Step 8

Two ticket documents are generated.

### Step 9

QR codes are generated.

### Step 10

Confirmation email is sent.

### Step 11

User sees:

```text
Booking Confirmed
```

and can open:

```text
My Tickets
```

---

# 63. Database Integrity Rules

The system must enforce:

```text
✓ Email must be unique
✓ Event slug must be unique
✓ Booking reference must be unique
✓ Ticket ID must be unique
✓ Payment order ID must be unique
✓ One wishlist entry per user/event
✓ One review per user/event
✓ Passwords must be hashed
✓ Payment amount must be server-calculated
✓ Ticket availability must be server-validated
✓ Organizer ownership must be checked
✓ Admin privileges must be server-checked
✓ Tickets must not be generated for failed payments
```

---

# 64. Database Design Principle

MongoDB should store **data**, not application logic.

Business rules such as:

```text
Can this user edit this event?
Can this user cancel this booking?
Is this ticket valid?
Can this ticket be checked in?
Did the payment actually succeed?
```

must be handled by backend services/controllers.

---

# 65. Final Database Architecture

```text
                         USERS
                           │
             ┌─────────────┼──────────────┐
             │             │              │
             ▼             ▼              ▼
          EVENTS        BOOKINGS       REVIEWS
             │             │
             │             ├───────────────┐
             │             │               │
             │             ▼               ▼
             │         PAYMENTS          TICKETS
             │                             │
             │                             │
             └─────────────────────────────┘
                           │
                           ▼
                       EVENT DATA


USERS ───────► WISHLISTS ───────► EVENTS

USERS ───────► NOTIFICATIONS

USERS ───────► OTP VERIFICATIONS
```

---

# 66. Final Rule

The database schema must remain consistent across:

```text
Backend Models
API Controllers
API Routes
Frontend Types
Frontend Services
Postman Tests
MongoDB Atlas
```

If a field is renamed, the change must be reflected everywhere.

Do not create duplicate fields representing the same information.

The database design should prioritize:

**Security → Integrity → Performance → Maintainability → Scalability**
