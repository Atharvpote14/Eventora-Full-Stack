# Eventora — Database Seed Data Specification

## 1. Purpose

Create realistic development/demo data for Eventora.

The seed data must make the application look like a real production-ready event and ticket platform.

Do not use meaningless placeholder values such as:

```text
Test Event
Test User
Lorem ipsum
abc@gmail.com
123456
```

Use realistic Indian event data, especially around cities such as:

* Mumbai
* Pune
* Bengaluru
* Delhi
* Hyderabad
* Ahmedabad
* Chennai
* Goa

The seed system must be safe to run in development.

---

# 2. Seed Collections

Create seed data for:

```text
users
categories
events
bookings
tickets
reviews
wishlist
notifications
payments
```

Do not create duplicate seed records every time the server starts.

Use a dedicated command:

```bash
npm run seed
```

The seed script should:

1. Connect to MongoDB.
2. Check whether seed data already exists.
3. Insert missing seed records.
4. Maintain valid references between collections.
5. Print a clear summary.
6. Close the database connection.

Example:

```text
🌱 Eventora database seeding started...

✓ Users: 8
✓ Categories: 10
✓ Events: 20
✓ Bookings: 12
✓ Tickets: 18
✓ Reviews: 15
✓ Wishlist items: 8
✓ Notifications: 10
✓ Payments: 12

🚀 Eventora seed completed successfully.
```

---

# 3. Development Users

Create different roles.

## Admin

```json
{
  "name": "Eventora Admin",
  "email": "admin@eventora.demo",
  "password": "Admin@123",
  "role": "admin",
  "isVerified": true
}
```

---

## Organizer 1

```json
{
  "name": "Eventora Live",
  "email": "organizer@eventora.demo",
  "password": "Organizer@123",
  "role": "organizer",
  "isVerified": true
}
```

---

## Organizer 2

```json
{
  "name": "Pune Events Co.",
  "email": "puneevents@eventora.demo",
  "password": "Organizer@123",
  "role": "organizer",
  "isVerified": true
}
```

---

## Demo Users

Create at least 5 normal users.

Examples:

```text
user1@eventora.demo
user2@eventora.demo
user3@eventora.demo
user4@eventora.demo
user5@eventora.demo
```

Password:

```text
User@123
```

All passwords must be hashed using the same hashing mechanism used by the application.

Never store plain-text passwords in MongoDB.

---

# 4. User Distribution

Recommended:

```text
1 Admin
2 Organizers
5 Users
```

Total:

```text
8 users
```

---

# 5. Categories

Create approximately 10 categories.

## Music

```json
{
  "name": "Music",
  "slug": "music"
}
```

## Comedy

```json
{
  "name": "Comedy",
  "slug": "comedy"
}
```

## Sports

```json
{
  "name": "Sports",
  "slug": "sports"
}
```

## Technology

```json
{
  "name": "Technology",
  "slug": "technology"
}
```

## Business

```json
{
  "name": "Business",
  "slug": "business"
}
```

## Workshops

```json
{
  "name": "Workshops",
  "slug": "workshops"
}
```

## Theatre

```json
{
  "name": "Theatre",
  "slug": "theatre"
}
```

## Art & Culture

```json
{
  "name": "Art & Culture",
  "slug": "art-culture"
}
```

## Food & Lifestyle

```json
{
  "name": "Food & Lifestyle",
  "slug": "food-lifestyle"
}
```

## Festivals

```json
{
  "name": "Festivals",
  "slug": "festivals"
}
```

Each category should have:

```text
name
slug
description
image
isActive
```

---

# 6. Event Data

Create at least 20 realistic events.

Use different categories and cities.

Events should contain:

```text
title
slug
description
category
organizer
venue
date
endDate
images
ticketTypes
status
featured
tags
capacity
createdAt
updatedAt
```

---

# 7. Example Events

## Event 1

### Pune Music Festival

```text
Category: Music
City: Pune
Venue: Amanora Park Town
```

Ticket types:

```text
General — ₹499
VIP — ₹1,499
Premium — ₹2,499
```

---

## Event 2

### Mumbai Comedy Nights

```text
Category: Comedy
City: Mumbai
Venue: The Habitat
```

Tickets:

```text
Regular — ₹799
VIP — ₹1,499
```

---

## Event 3

### India Tech Future Summit

```text
Category: Technology
City: Bengaluru
Venue: Bangalore International Convention Centre
```

Tickets:

```text
Standard — ₹999
Professional — ₹1,999
VIP — ₹3,499
```

---

## Event 4

### Startup India Connect

```text
Category: Business
City: Mumbai
Venue: Jio World Convention Centre
```

Tickets:

```text
General — ₹1,499
Business — ₹2,999
VIP — ₹4,999
```

---

## Event 5

### Pune Stand-Up Special

```text
Category: Comedy
City: Pune
Venue: Bal Gandharva Rang Mandir
```

Tickets:

```text
Regular — ₹599
VIP — ₹1,199
```

---

## Event 6

### Mumbai Food Carnival

```text
Category: Food & Lifestyle
City: Mumbai
Venue: MMRDA Grounds
```

Tickets:

```text
Entry — ₹199
Family Pass — ₹699
```

---

## Event 7

### Future Developers Workshop

```text
Category: Workshops
City: Pune
Venue: WeWork Pune
```

Tickets:

```text
Student — ₹299
Professional — ₹799
```

---

## Event 8

### Goa Sunset Music Festival

```text
Category: Music
City: Goa
Venue: Vagator
```

Tickets:

```text
Early Bird — ₹999
Regular — ₹1,999
VIP — ₹3,999
```

---

## Event 9

### Pune Theatre Festival

```text
Category: Theatre
City: Pune
Venue: Nehru Memorial Hall
```

---

## Event 10

### Mumbai Startup Expo

```text
Category: Business
City: Mumbai
Venue: Bombay Exhibition Centre
```

---

## Event 11

### Bengaluru AI Conference

```text
Category: Technology
City: Bengaluru
Venue: Bangalore International Centre
```

---

## Event 12

### Delhi Cultural Evening

```text
Category: Art & Culture
City: Delhi
Venue: India Habitat Centre
```

---

## Event 13

### Hyderabad Tech Meetup

```text
Category: Technology
City: Hyderabad
Venue: HITEX Exhibition Centre
```

---

## Event 14

### Pune Sports Fest

```text
Category: Sports
City: Pune
Venue: Shiv Chhatrapati Sports Complex
```

---

## Event 15

### Ahmedabad Navratri Night

```text
Category: Festivals
City: Ahmedabad
Venue: GMDC Ground
```

---

## Event 16

### Chennai Music Evening

```text
Category: Music
City: Chennai
Venue: Music Academy
```

---

## Event 17

### Mumbai Theatre Experience

```text
Category: Theatre
City: Mumbai
Venue: Prithvi Theatre
```

---

## Event 18

### Pune Design Workshop

```text
Category: Workshops
City: Pune
Venue: Creative Hub Pune
```

---

## Event 19

### Delhi Comedy Festival

```text
Category: Comedy
City: Delhi
Venue: Siri Fort Auditorium
```

---

## Event 20

### Bengaluru Startup Weekend

```text
Category: Business
City: Bengaluru
Venue: WeWork Bengaluru
```

---

# 8. Event Status Distribution

Do not make every event published.

Use:

```text
published: 15
draft: 2
pending: 2
cancelled: 1
```

This allows the admin dashboard to demonstrate moderation.

---

# 9. Featured Events

Mark approximately 5 events as:

```text
featured: true
```

These should be high-quality events from different categories.

---

# 10. Ticket Inventory

Every published event should have realistic inventory.

Example:

```json
{
  "name": "General Admission",
  "price": 799,
  "quantity": 500,
  "availableQuantity": 342,
  "soldQuantity": 158
}
```

Ensure:

```text
availableQuantity + soldQuantity = quantity
```

Never create mathematically inconsistent inventory.

---

# 11. Booking Seed Data

Create approximately 12 realistic bookings.

Every booking must reference:

```text
valid user
valid event
valid ticket type
```

Example:

```json
{
  "user": "USER_ID",
  "event": "EVENT_ID",
  "quantity": 2,
  "subtotal": 1598,
  "fees": 80,
  "total": 1678,
  "status": "confirmed",
  "paymentStatus": "paid"
}
```

Do not manually invent IDs.

Use actual MongoDB ObjectIds generated during seeding.

---

# 12. Booking Status Distribution

Use different states:

```text
confirmed
pending
cancelled
```

Example:

```text
confirmed: 9
pending: 2
cancelled: 1
```

This makes the dashboard more realistic.

---

# 13. Payment Seed Data

Create payment records corresponding to bookings.

Example:

```json
{
  "booking": "BOOKING_ID",
  "user": "USER_ID",
  "amount": 1678,
  "currency": "INR",
  "status": "paid",
  "provider": "razorpay",
  "paymentId": "demo_pay_001"
}
```

Important:

These are only development/demo records.

Do not pretend they are real Razorpay transactions.

Use clearly recognizable demo IDs:

```text
demo_order_001
demo_pay_001
```

---

# 14. Ticket Seed Data

Generate tickets for confirmed bookings.

Each ticket should contain:

```text
ticketNumber
booking
event
user
ticketType
status
qrCode
checkedInAt
```

Example:

```text
EVT-TKT-8A92KD
```

Ticket statuses:

```text
active
used
cancelled
```

Some tickets should already be checked in so the organizer dashboard can demonstrate attendance.

---

# 15. QR Code

Generate a valid QR representation for demo tickets.

The QR data should contain a secure ticket identifier or ticket number.

Example payload:

```json
{
  "ticketId": "TICKET_ID",
  "ticketNumber": "EVT-TKT-8A92KD"
}
```

Do not put sensitive user information inside the QR code.

---

# 16. Review Data

Create approximately 15 reviews.

Reviews must reference actual:

```text
user
event
```

Example:

```json
{
  "user": "USER_ID",
  "event": "EVENT_ID",
  "rating": 5,
  "comment": "The event was extremely well organized and the overall experience was excellent."
}
```

Use realistic ratings:

```text
5
4
4
5
3
5
4
```

Avoid making every review 5 stars.

---

# 17. Wishlist Data

Create approximately 8 wishlist records.

Users should have different events in their wishlist.

Do not create duplicate:

```text
user + event
```

pairs.

---

# 18. Notification Data

Create approximately 10 notifications.

Examples:

### Booking confirmation

```text
Your booking for Pune Music Festival has been confirmed.
```

### Payment

```text
Your payment of ₹1,678 was successful.
```

### Event reminder

```text
Pune Music Festival is happening tomorrow.
```

### Event cancellation

```text
Mumbai Comedy Nights has been cancelled.
```

### Organizer notification

```text
Your event has been approved by the Eventora team.
```

---

# 19. Notification Types

Use:

```text
booking
payment
event
system
promotion
```

Each notification should contain:

```text
user
title
message
type
isRead
createdAt
```

Make some notifications unread.

Example:

```text
isRead: false
```

---

# 20. Dashboard Data Requirements

The seed data must allow Eventora dashboards to display:

### Admin

```text
Total Users
Total Organizers
Total Events
Published Events
Pending Events
Total Bookings
Tickets Sold
Revenue
```

### Organizer

```text
My Events
Published Events
Upcoming Events
Tickets Sold
Bookings
Revenue
Attendance
```

### User

```text
Upcoming Bookings
Tickets
Wishlist
Notifications
Payment History
```

All dashboard values must be calculated from actual MongoDB records.

Do not hardcode dashboard numbers.

---

# 21. Date Strategy

Seed events should use a mixture of:

```text
past
today
tomorrow
upcoming
```

This allows the UI to demonstrate:

```text
Upcoming Events
Past Events
Event Reminders
Recently Completed Events
```

Most presentation/demo events should be upcoming.

Use dynamic date generation where appropriate instead of hardcoding dates that will quickly become outdated.

For example:

```js
const now = new Date();

const upcomingDate = new Date(
  now.getTime() + 10 * 24 * 60 * 60 * 1000
);
```

---

# 22. Image Strategy

Use high-quality event images.

Images should come from reliable external image URLs or the project's configured image storage.

Do not use:

```text
random broken URLs
```

Do not depend on images that require authentication.

Use a fallback image if an event image fails.

---

# 23. Seed Relationships

The following relationships must remain valid:

```text
User
 │
 ├── Booking
 │      └── Event
 │             └── Organizer
 │
 ├── Ticket
 │      └── Booking
 │
 ├── Review
 │      └── Event
 │
 ├── Wishlist
 │      └── Event
 │
 ├── Payment
 │      └── Booking
 │
 └── Notification
```

---

# 24. Seed Script Rules

Create:

```text
scripts/
└── seed.js
```

Add:

```json
{
  "scripts": {
    "seed": "node scripts/seed.js"
  }
}
```

If using ES Modules, follow the project's module system consistently.

---

# 25. Seed Command

Developer runs:

```bash
npm run seed
```

Expected result:

```text
🌱 Starting Eventora seed...

MongoDB connected.

Creating users...
✓ Users created.

Creating categories...
✓ Categories created.

Creating events...
✓ Events created.

Creating bookings...
✓ Bookings created.

Creating tickets...
✓ Tickets created.

Creating payments...
✓ Payments created.

Creating reviews...
✓ Reviews created.

Creating wishlist...
✓ Wishlist created.

Creating notifications...
✓ Notifications created.

--------------------------------
Eventora seed completed successfully
--------------------------------
```

---

# 26. Idempotency

Running:

```bash
npm run seed
```

multiple times must not continuously create duplicate data.

Possible strategy:

```text
Check unique email
Check category slug
Check event slug
Check ticket number
```

Use unique indexes where appropriate.

---

# 27. Development Reset

Provide a separate command:

```bash
npm run seed:reset
```

This command may:

1. Connect to MongoDB.
2. Delete only Eventora development seed data.
3. Re-run the seed process.

Never execute destructive database deletion automatically when the application starts.

---

# 28. Production Safety

The seed script must never execute automatically in production.

Before allowing:

```bash
npm run seed:reset
```

the developer should explicitly confirm the environment is development.

Example protection:

```text
if NODE_ENV === "production"
    reject destructive seed reset
```

---

# 29. Demo Credentials

Display these credentials in the development documentation.

### Admin

```text
Email: admin@eventora.demo
Password: Admin@123
```

### Organizer

```text
Email: organizer@eventora.demo
Password: Organizer@123
```

### User

```text
Email: user1@eventora.demo
Password: User@123
```

These are development-only credentials.

Do not use them in production.

---

# 30. External Presentation Demo Flow

The seed data should allow this complete demonstration:

```text
1. Open Eventora homepage
        ↓
2. Browse featured events
        ↓
3. Search for an event
        ↓
4. Filter by city/category
        ↓
5. Open event details
        ↓
6. Login as user
        ↓
7. Select tickets
        ↓
8. Add to booking
        ↓
9. Demonstrate Razorpay test payment
        ↓
10. Booking confirmed
        ↓
11. Ticket generated
        ↓
12. QR code displayed
        ↓
13. Open My Tickets
        ↓
14. Login as organizer
        ↓
15. Open organizer dashboard
        ↓
16. View bookings
        ↓
17. View attendees
        ↓
18. Demonstrate ticket verification
        ↓
19. Login as admin
        ↓
20. Show admin dashboard
        ↓
21. Show users/events/bookings
        ↓
22. Approve/reject event
```

---

# 31. Important Rule

The database seed data exists to make Eventora look and behave like a realistic production application during development and presentation.

Never fake business logic.

Seed realistic records, but all calculations, permissions, booking totals, inventory, analytics, and relationships must still be generated from the actual database.

The frontend must consume these records through the API rather than embedding the seed data directly inside React/Next.js components.
