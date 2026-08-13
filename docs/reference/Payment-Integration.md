# Eventora — Razorpay Payment Integration

## 1. Purpose

This document defines the complete payment system for Eventora using Razorpay.

The payment system must integrate with:

* Eventora booking system
* MongoDB
* Razorpay Orders API
* Razorpay payment verification
* Razorpay webhooks
* Ticket generation
* Email notifications
* Booking confirmation
* Refund workflow

The backend is the source of truth for all payment and booking amounts.

The frontend must never be trusted for payment amounts, ticket prices, payment status, or booking ownership.

---

# 2. Payment Architecture

The complete flow:

```text
User selects event
        ↓
Select ticket type + quantity
        ↓
Checkout page
        ↓
POST /api/bookings
        ↓
Backend validates availability
        ↓
Backend calculates final amount
        ↓
Create pending booking
        ↓
POST /api/payments/create-order
        ↓
Backend creates Razorpay Order
        ↓
Frontend opens Razorpay Checkout
        ↓
User completes payment
        ↓
Razorpay returns payment details
        ↓
POST /api/payments/verify
        ↓
Backend verifies signature
        ↓
Booking confirmed
        ↓
Generate tickets + QR codes
        ↓
Send confirmation email
```

---

# 3. Razorpay Account

Create a Razorpay account and obtain:

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

For development, use Razorpay Test Mode.

For production, use the appropriate live credentials.

Never expose:

```text
RAZORPAY_KEY_SECRET
```

to the frontend.

---

# 4. Environment Variables

Backend `.env`:

```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

Frontend:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_public_key_id
```

Only the public Razorpay key may be exposed to the frontend.

---

# 5. Razorpay SDK

Install Razorpay in the backend:

```bash
npm install razorpay
```

Initialize it using environment variables.

Example:

```js
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
```

Never hardcode credentials.

---

# 6. Currency

Eventora uses:

```text
INR
```

Razorpay amounts must be sent in the smallest currency unit.

For INR:

```text
₹499 = 49900 paise
₹1499 = 149900 paise
```

Backend must perform this conversion.

---

# 7. Booking Must Be Created Before Payment

Do not directly create a Razorpay order from the frontend.

Correct sequence:

```text
Frontend
   ↓
Create booking
   ↓
Backend validates booking
   ↓
Backend calculates amount
   ↓
Create pending booking
   ↓
Create Razorpay order
```

This gives Eventora a database record before the payment starts.

---

# 8. Booking Status

Use booking statuses such as:

```text
pending
confirmed
cancelled
expired
refunded
failed
```

Recommended initial state:

```text
pending
```

After successful verified payment:

```text
confirmed
```

---

# 9. Payment Status

Use separate payment status values:

```text
pending
created
paid
failed
refunded
partially_refunded
```

Do not combine booking status and payment status into one field.

Example:

```js
{
  bookingStatus: "confirmed",
  paymentStatus: "paid"
}
```

---

# 10. Booking Amount Calculation

Suppose:

```text
General ticket = ₹499
Quantity = 2
```

Subtotal:

```text
₹998
```

If Eventora has a platform fee:

```text
Platform fee = ₹50
```

Final amount:

```text
₹1048
```

The backend must calculate this.

Never accept:

```json
{
  "amount": 1048
}
```

from the frontend as the source of truth.

---

# 11. Pricing Calculation

Backend should calculate:

```text
subtotal
discount
platformFee
tax
total
```

Example:

```js
const subtotal = ticketPrice * quantity;

const total =
  subtotal -
  discount +
  platformFee +
  tax;
```

Use integer/decimal-safe money calculations and avoid floating-point errors.

---

# 12. Create Booking API

Endpoint:

```text
POST /api/bookings
```

Request:

```json
{
  "eventId": "EVENT_ID",
  "tickets": [
    {
      "ticketTypeId": "TICKET_TYPE_ID",
      "quantity": 2
    }
  ]
}
```

Backend must:

1. Authenticate user.
2. Find event.
3. Verify event status.
4. Find ticket type.
5. Check ticket availability.
6. Validate quantity.
7. Calculate prices.
8. Calculate fees/tax if applicable.
9. Create booking.
10. Return booking ID and amount.

---

# 13. Inventory Protection

Inventory must be checked on the backend.

Example:

```text
Available = 100
Requested = 3
```

Allow booking.

If:

```text
Available = 2
Requested = 3
```

Return:

```text
400 Bad Request
```

with:

```json
{
  "success": false,
  "message": "Only 2 tickets are available."
}
```

---

# 14. Prevent Overselling

When creating or confirming a booking, use a safe inventory update strategy.

Do not simply:

```text
read quantity
↓
subtract quantity
↓
save
```

without considering concurrent requests.

Use atomic MongoDB operations/transactions where appropriate.

The system must prevent two users from purchasing the same final available ticket.

---

# 15. Create Razorpay Order

Endpoint:

```text
POST /api/payments/create-order
```

Authentication required.

Request:

```json
{
  "bookingId": "BOOKING_ID"
}
```

Backend must:

1. Authenticate user.
2. Find booking.
3. Verify booking ownership.
4. Verify booking status.
5. Calculate/obtain authoritative total.
6. Convert amount to paise.
7. Create Razorpay order.
8. Store Razorpay order ID.
9. Return order details.

---

# 16. Razorpay Order

Example backend order:

```js
const options = {
  amount: totalAmountInPaise,
  currency: "INR",
  receipt: booking.bookingNumber,
  notes: {
    bookingId: booking._id.toString(),
    userId: booking.user.toString()
  }
};

const order = await razorpay.orders.create(options);
```

Store:

```text
razorpayOrderId
```

inside the booking/payment record.

---

# 17. Create Order Response

Return only required information:

```json
{
  "success": true,
  "order": {
    "id": "order_xxxxxxxxx",
    "amount": 104800,
    "currency": "INR"
  },
  "booking": {
    "id": "BOOKING_ID",
    "amount": 1048
  }
}
```

Never return:

```text
RAZORPAY_KEY_SECRET
```

---

# 18. Frontend Razorpay Checkout

Frontend receives:

```text
razorpayOrderId
amount
currency
public Razorpay key
```

Then loads Razorpay Checkout.

The frontend should provide:

```text
name
email
contact
order_id
amount
currency
```

The frontend may show:

```text
Eventora
Event name
Ticket information
Amount
```

But the backend remains the source of truth.

---

# 19. Razorpay Checkout Success

Razorpay returns information similar to:

```json
{
  "razorpay_order_id": "order_...",
  "razorpay_payment_id": "pay_...",
  "razorpay_signature": "..."
}
```

The frontend must immediately send these values to:

```text
POST /api/payments/verify
```

---

# 20. Payment Verification

Endpoint:

```text
POST /api/payments/verify
```

Request:

```json
{
  "razorpay_order_id": "order_...",
  "razorpay_payment_id": "pay_...",
  "razorpay_signature": "..."
}
```

Backend must verify the Razorpay signature using the secret key.

Never trust:

```text
frontend says payment successful
```

as proof of payment.

---

# 21. Signature Verification

Use Razorpay's official signature verification mechanism.

Conceptually:

```text
generatedSignature =
HMAC_SHA256(
  razorpay_order_id + "|" + razorpay_payment_id,
  RAZORPAY_KEY_SECRET
)
```

Compare it securely with:

```text
razorpay_signature
```

Only continue if the signatures match.

---

# 22. Successful Verification

After valid signature verification:

```text
paymentStatus = paid
bookingStatus = confirmed
```

Then:

```text
generate tickets
generate QR codes
send confirmation email
send notification
```

All related database operations should be designed to avoid partially confirmed bookings.

---

# 23. Payment Verification Response

```json
{
  "success": true,
  "message": "Payment verified successfully.",
  "booking": {
    "id": "BOOKING_ID",
    "status": "confirmed"
  }
}
```

---

# 24. Prevent Duplicate Verification

Payment verification may be called more than once.

The backend must handle duplicate requests safely.

If payment is already confirmed:

```json
{
  "success": true,
  "message": "Payment already verified.",
  "booking": {
    "id": "BOOKING_ID",
    "status": "confirmed"
  }
}
```

Do not generate duplicate tickets.

---

# 25. Payment Amount Validation

Backend must verify that the Razorpay order corresponds to the expected Eventora booking amount.

Never allow:

```text
frontend amount ≠ database amount
```

to be accepted.

The authoritative amount comes from the backend booking record.

---

# 26. Razorpay Webhooks

Create:

```text
POST /api/payments/webhook
```

This endpoint is called by Razorpay.

Webhook events may include payment-related events such as:

```text
payment.captured
payment.failed
refund.processed
```

Use the relevant events required by Eventora.

---

# 27. Webhook Signature

Webhook requests must be verified using:

```env
RAZORPAY_WEBHOOK_SECRET=
```

Do not use the normal API secret as a substitute for the webhook secret if Razorpay provides a dedicated webhook secret.

---

# 28. Raw Webhook Body

When verifying Razorpay webhook signatures, ensure the backend uses the correct raw request body required by Razorpay's verification process.

Do not parse and re-stringify the body before signature verification if that changes the original payload representation.

Configure the Express webhook route appropriately.

---

# 29. Payment Captured Webhook

When receiving a verified:

```text
payment.captured
```

event:

1. Find corresponding payment/order.
2. Verify booking.
3. Update payment status.
4. Confirm booking if not already confirmed.
5. Generate tickets if not already generated.
6. Send notifications if not already sent.

The process must be idempotent.

---

# 30. Payment Failed Webhook

For:

```text
payment.failed
```

update the payment record:

```text
paymentStatus = failed
```

If the booking is still pending and has not expired:

```text
bookingStatus = pending
```

Allow the user to retry payment when appropriate.

---

# 31. Booking Expiration

Pending bookings should not remain forever.

Recommended concept:

```text
pending booking
      ↓
payment window
      ↓
payment not completed
      ↓
booking expires
```

Example:

```text
15 minutes
```

The exact duration should be configurable.

When expired:

```text
bookingStatus = expired
```

Release reserved ticket inventory if your reservation design holds inventory during payment.

---

# 32. Payment Retry

Users should be able to retry a failed or expired payment when allowed.

Flow:

```text
Booking
  ↓
Retry Payment
  ↓
Create new Razorpay order
  ↓
Checkout
  ↓
Verify
  ↓
Confirm
```

Do not modify historical payment records incorrectly.

Create a new payment attempt/order record where appropriate.

---

# 33. Payment Attempt Model

Recommended fields:

```text
_id
booking
user
razorpayOrderId
razorpayPaymentId
amount
currency
status
method
failureReason
createdAt
updatedAt
```

Possible status:

```text
created
paid
failed
refunded
```

---

# 34. Payment Record

A booking may have multiple payment attempts.

Example:

```text
Booking #EVT-1001

Attempt 1
Status: failed

Attempt 2
Status: paid
```

The booking should only be considered paid when a valid payment has been successfully verified.

---

# 35. Refund Flow

If Eventora supports cancellations/refunds:

```text
User cancels eligible booking
        ↓
Backend checks refund policy
        ↓
Determine refundable amount
        ↓
Initiate Razorpay refund
        ↓
Store refund information
        ↓
Wait for confirmation/webhook
        ↓
Update payment/booking status
        ↓
Notify user
```

---

# 36. Refund API

Example:

```text
POST /api/payments/:paymentId/refund
```

Access:

```text
admin
```

and/or controlled organizer cancellation workflow.

Do not allow arbitrary users to trigger refunds directly.

---

# 37. Refund Amount

Backend calculates refund amount.

Never accept arbitrary:

```json
{
  "refundAmount": 50000
}
```

from the client without server-side validation.

Refund rules should come from Eventora's cancellation policy.

---

# 38. Refund Status

Possible values:

```text
pending
processed
failed
```

Store:

```text
refundId
refundAmount
refundStatus
refundedAt
```

---

# 39. Ticket Generation

Only generate valid tickets after confirmed payment.

Flow:

```text
Payment verified
       ↓
Booking confirmed
       ↓
Generate ticket records
       ↓
Generate unique ticket number
       ↓
Generate QR data
       ↓
Attach ticket to booking
```

---

# 40. Ticket Number

Generate a unique ticket number.

Example:

```text
EVT-TKT-8A92KD
```

Do not use predictable sequential numbers alone.

Ensure uniqueness with a MongoDB unique index.

---

# 41. QR Code

QR code should contain a secure ticket identifier or signed verification payload.

Do not put sensitive personal information directly inside the QR code.

Example:

```text
ticketId
verification token
```

The backend should verify the QR/ticket when scanned.

---

# 42. Ticket Check-In

Organizer scans QR.

Frontend sends:

```text
POST /api/tickets/verify
```

Backend verifies:

```text
ticket exists
ticket is valid
ticket belongs to organizer's event
ticket is not already used
```

If valid:

```text
check-in successful
```

Then mark:

```text
checkedInAt
status = used
```

---

# 43. Confirmation Email

After successful booking:

Send email containing:

```text
Eventora
Booking confirmed
Event name
Date
Time
Venue
Ticket type
Quantity
Total amount
Booking number
Ticket information
```

If PDF tickets are implemented, attach the ticket PDF.

---

# 44. Payment Receipt

Provide users with payment information in:

```text
Booking Details
Payment History
Confirmation Email
```

Include:

```text
booking number
payment ID
amount
payment status
payment date
```

Never expose Razorpay secret credentials.

---

# 45. Payment History

Endpoint:

```text
GET /api/payments/history
```

Users may view only their own payments.

Example:

```json
{
  "success": true,
  "data": [
    {
      "paymentId": "pay_...",
      "bookingId": "BOOKING_ID",
      "amount": 1048,
      "currency": "INR",
      "status": "paid",
      "createdAt": "2026-08-13T10:30:00.000Z"
    }
  ]
}
```

---

# 46. Admin Payment Dashboard

Admin should be able to see:

```text
total revenue
successful payments
failed payments
refunds
payment attempts
```

Filters:

```text
date
event
organizer
payment status
```

---

# 47. Organizer Revenue

Organizer analytics should calculate revenue only from successfully paid bookings associated with their events.

Do not count:

```text
pending
failed
cancelled unpaid
```

as successful revenue.

Refunded transactions must be handled correctly in revenue calculations.

---

# 48. Frontend Checkout UX

Checkout should show:

```text
Event
Venue
Date
Ticket type
Quantity
Subtotal
Fees
Discount
Tax
Final amount
```

Provide:

```text
Pay Now
```

button.

While payment is processing:

```text
disable duplicate submission
show loading state
prevent accidental duplicate order creation
```

---

# 49. Payment Loading States

Frontend states:

```text
idle
creating-booking
creating-order
opening-payment
verifying-payment
success
failed
```

Display appropriate UI for each state.

---

# 50. Payment Failure UX

If payment fails:

```text
Payment unsuccessful
```

Show:

```text
Retry Payment
Return to Booking
Contact Support
```

Do not immediately delete the booking.

Allow retry where the booking is still valid.

---

# 51. Payment Success UX

After successful verification:

Show a premium confirmation screen:

```text
✓ Booking Confirmed

Your tickets are ready.

Booking ID
Event
Date
Venue

[View Tickets]
[Download Ticket]
[View Booking]
```

Use Eventora's premium visual language.

Avoid generic template-style success screens.

---

# 52. Payment Security Rules

Never:

```text
trust frontend amount
trust frontend payment status
trust frontend booking ownership
expose Razorpay secret
expose JWT secret
store payment credentials
generate tickets before payment verification
allow duplicate ticket generation
allow arbitrary refunds
skip signature verification
skip webhook verification
```

---

# 53. Database Relationships

Recommended relationship:

```text
User
 │
 ├── Bookings
 │      │
 │      ├── Payment Attempts
 │      │
 │      └── Tickets
 │
 └── Payment History
```

Event:

```text
Event
 │
 ├── Ticket Types
 │
 ├── Bookings
 │
 └── Tickets
```

Payment:

```text
Payment
 ├── User
 ├── Booking
 ├── Event
 └── Razorpay identifiers
```

---

# 54. Recommended Payment Models

## Payment

```text
Payment
├── _id
├── user
├── booking
├── event
├── razorpayOrderId
├── razorpayPaymentId
├── amount
├── currency
├── status
├── method
├── failureReason
├── refundId
├── refundAmount
├── refundStatus
├── createdAt
└── updatedAt
```

## Booking

```text
Booking
├── _id
├── bookingNumber
├── user
├── event
├── tickets
├── subtotal
├── discount
├── platformFee
├── tax
├── totalAmount
├── bookingStatus
├── paymentStatus
├── expiresAt
├── createdAt
└── updatedAt
```

---

# 55. Idempotency

Payment operations must be idempotent wherever possible.

For example:

```text
verify payment
verify same payment again
```

must not:

```text
create duplicate tickets
increase revenue twice
send duplicate confirmation unnecessarily
```

Use unique constraints and server-side checks.

---

# 56. Webhook Idempotency

Store processed webhook/event identifiers where appropriate.

If the same webhook arrives twice:

```text
First request → process
Second request → safely ignore/already processed
```

Do not perform financial operations twice.

---

# 57. Testing With Razorpay Test Mode

During development use Razorpay Test Mode.

Test:

```text
successful payment
failed payment
payment verification
duplicate verification
invalid signature
wrong amount
expired booking
payment retry
refund
webhook
```

Do not test real transactions during development.

---

# 58. Postman Testing

Test:

```text
POST /api/bookings
POST /api/payments/create-order
POST /api/payments/verify
GET  /api/payments/history
POST /api/payments/webhook
```

For protected APIs ensure authentication cookie is present.

---

# 59. Production Deployment

Before deployment:

```text
[ ] Razorpay production/test credentials configured correctly
[ ] MongoDB production connection configured
[ ] CORS configured for Vercel frontend
[ ] Cookie configuration works cross-origin
[ ] HTTPS enabled
[ ] Webhook URL configured in Razorpay
[ ] Webhook secret configured
[ ] Environment variables configured
[ ] No secrets committed to Git
```

---

# 60. Production Webhook

Example:

```text
https://YOUR-BACKEND-DOMAIN/api/payments/webhook
```

Configure this URL in Razorpay's webhook settings.

Use HTTPS in production.

---

# 61. Payment Environment Separation

Development:

```env
RAZORPAY_KEY_ID=test_key
RAZORPAY_KEY_SECRET=test_secret
```

Production:

```env
RAZORPAY_KEY_ID=live_key
RAZORPAY_KEY_SECRET=live_secret
```

Never mix test and live credentials.

---

# 62. Complete Payment Checklist

Before considering Eventora payments complete:

```text
[ ] Razorpay account configured
[ ] Test mode enabled during development
[ ] Backend Razorpay SDK installed
[ ] Environment variables configured
[ ] Booking created before payment
[ ] Backend calculates amount
[ ] Inventory validated
[ ] Razorpay order created server-side
[ ] Frontend checkout opens correctly
[ ] Payment ID received
[ ] Order ID received
[ ] Signature received
[ ] Signature verified server-side
[ ] Booking becomes confirmed
[ ] Payment becomes paid
[ ] Duplicate verification handled
[ ] Tickets generated once
[ ] QR code generated
[ ] Confirmation email sent
[ ] Payment history available
[ ] Failed payment handled
[ ] Payment retry implemented
[ ] Pending bookings expire
[ ] Refund workflow implemented if required
[ ] Webhook configured
[ ] Webhook signature verified
[ ] Webhook idempotency handled
[ ] Admin can view payments
[ ] Organizer revenue is accurate
[ ] Secrets are never exposed
[ ] Production HTTPS configured
[ ] Production CORS configured
```

---

# 63. Final Payment Principle

The most important rule for Eventora:

> **The frontend starts the payment experience, but the backend decides whether a payment is valid.**

The backend must always verify:

```text
User
+
Booking
+
Amount
+
Razorpay Order
+
Payment
+
Signature
+
Webhook where applicable
```

Only after successful server-side verification should Eventora issue a confirmed booking and valid ticket.
