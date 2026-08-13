# Eventora — Authentication & Authorization Flow

## 1. Purpose

This document defines the complete authentication and authorization system for Eventora.

Eventora must implement secure, production-style authentication using:

* Email registration
* Email OTP verification
* Login
* JWT authentication
* HTTP-only cookies
* Logout
* Forgot password
* Password reset
* Role-based authorization
* User / Organizer / Admin permissions

Authentication must be implemented in the backend first and then consumed by the Next.js frontend.

---

# 2. User Roles

Eventora supports three primary roles:

```text
user
organizer
admin
```

### User

Can:

* Register
* Verify email
* Login
* Logout
* Manage profile
* Browse events
* Search events
* Add events to wishlist
* Book tickets
* Make payments
* View bookings
* View tickets
* Display QR tickets
* Review eligible events
* Receive notifications

### Organizer

Everything a normal user can do, plus:

* Create events
* Edit own events
* Delete own events
* Publish own events
* View bookings for own events
* View attendees
* View ticket sales
* View revenue
* View event analytics
* Verify tickets
* Check in attendees

### Admin

Full platform access:

* Manage users
* Manage organizers
* Manage categories
* Manage events
* Approve/reject events
* Manage bookings
* View payments
* View platform analytics
* Manage reported content
* Manage platform settings where implemented

---

# 3. Registration Flow

The registration process must follow:

```text
User enters registration details
        ↓
Frontend validates form
        ↓
POST /api/auth/register
        ↓
Backend validates input
        ↓
Check existing email
        ↓
Hash password
        ↓
Create unverified user
        ↓
Generate OTP
        ↓
Store hashed OTP + expiry
        ↓
Send OTP email
        ↓
Frontend opens OTP screen
```

The account should not become fully verified until the OTP is successfully confirmed.

---

# 4. Registration Fields

Minimum:

```text
name
email
password
```

Optional:

```text
phone
city
```

Frontend must validate:

```text
valid name
valid email
minimum password length
password confirmation
```

Backend must perform its own validation.

Never rely only on frontend validation.

---

# 5. Email Uniqueness

Email addresses must be unique.

If the email already exists:

```json
{
  "success": false,
  "message": "An account with this email already exists."
}
```

If an unverified account exists, the backend may provide a controlled resend-verification flow rather than creating another account.

---

# 6. Password Security

Passwords must never be stored as plain text.

Use:

```text
bcrypt
```

Recommended:

```text
bcrypt.hash(password, saltRounds)
```

Use a reasonable salt-round configuration.

The database must contain something similar to:

```text
passwordHash
```

and never:

```text
password
```

---

# 7. OTP Generation

Generate a cryptographically appropriate random six-digit OTP.

Example:

```text
483921
```

Do not use predictable values.

OTP should have a limited lifetime.

Recommended:

```text
10 minutes
```

Store:

```text
otpHash
otpExpiresAt
```

rather than storing the raw OTP whenever practical.

---

# 8. OTP Email

Registration OTP email should contain:

```text
Eventora
Email Verification
Your verification code
Expiry information
Security warning
```

Example structure:

```text
Welcome to Eventora!

Your verification code is:

483921

This code expires in 10 minutes.

If you did not create this account, you can safely ignore this email.
```

Use a professionally styled HTML email where possible.

---

# 9. Verify OTP

Endpoint:

```text
POST /api/auth/verify-otp
```

Request:

```json
{
  "email": "atharv@example.com",
  "otp": "483921"
}
```

Backend:

1. Find user.
2. Check OTP exists.
3. Check expiry.
4. Compare OTP securely.
5. Mark email as verified.
6. Remove OTP data.
7. Return success.

Response:

```json
{
  "success": true,
  "message": "Email verified successfully."
}
```

---

# 10. Invalid OTP

If the OTP is incorrect:

```json
{
  "success": false,
  "message": "Invalid verification code."
}
```

Do not reveal internal implementation details.

---

# 11. Expired OTP

If expired:

```json
{
  "success": false,
  "message": "Verification code has expired."
}
```

User should be able to request a new OTP.

---

# 12. Resend OTP

Endpoint:

```text
POST /api/auth/resend-otp
```

Request:

```json
{
  "email": "atharv@example.com"
}
```

Generate a new OTP.

Invalidate the previous OTP.

Apply rate limiting.

Example policy:

```text
maximum 3 OTP requests within 15 minutes
```

Use a sensible production-safe configuration.

---

# 13. Login Flow

```text
User enters email/password
        ↓
POST /api/auth/login
        ↓
Backend finds user
        ↓
Check account status
        ↓
Compare password using bcrypt
        ↓
Check email verification
        ↓
Generate JWT
        ↓
Set HTTP-only cookie
        ↓
Return safe user information
```

---

# 14. Login Request

```json
{
  "email": "atharv@example.com",
  "password": "Password@123"
}
```

---

# 15. Login Success

Response:

```json
{
  "success": true,
  "message": "Login successful.",
  "user": {
    "_id": "USER_ID",
    "name": "Atharv Pote",
    "email": "atharv@example.com",
    "role": "user",
    "isVerified": true
  }
}
```

Never return:

```text
password
passwordHash
JWT secret
```

---

# 16. JWT

Generate a signed JWT after successful login.

JWT payload should contain only necessary information.

Example:

```json
{
  "userId": "USER_ID",
  "role": "user"
}
```

Do not put sensitive personal information into the JWT.

Use an expiration time.

Example:

```text
7 days
```

The exact duration may be configured through environment variables.

---

# 17. JWT Secret

Store the JWT secret in:

```env
JWT_SECRET=your_secure_random_secret
```

Never hardcode it into source code.

Never commit it to GitHub.

---

# 18. HTTP-Only Cookie

Store the JWT inside an HTTP-only cookie.

Example configuration:

```js
{
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax"
}
```

Use an appropriate cookie name such as:

```text
eventora_token
```

The frontend must not directly read this cookie.

---

# 19. Why HTTP-Only Cookie

The JWT should not be accessible through JavaScript.

Therefore avoid:

```text
localStorage
sessionStorage
document.cookie
```

for the authentication token.

This reduces exposure to common token theft through client-side JavaScript attacks.

---

# 20. Frontend Authentication Requests

When using Axios, configure credentials:

```js
axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true
});
```

The browser should automatically send the authentication cookie to the backend when configured correctly.

---

# 21. CORS

Backend must allow the deployed frontend origin.

Development example:

```text
http://localhost:3000
```

Production:

```text
https://your-eventora-frontend.vercel.app
```

Use environment variables.

Do not use:

```js
origin: "*"
```

when cookies are required.

Set:

```text
credentials: true
```

---

# 22. Authentication Middleware

Create middleware:

```text
middleware/authMiddleware.js
```

Responsibilities:

1. Read authentication cookie.
2. Verify JWT.
3. Extract user ID.
4. Validate user.
5. Attach user to request.
6. Continue request.

Example conceptual flow:

```text
Cookie
  ↓
JWT
  ↓
Verify signature
  ↓
Extract userId
  ↓
Find user
  ↓
req.user
```

---

# 23. Protected Route

Example:

```js
router.get(
  "/profile",
  authenticate,
  getProfile
);
```

Unauthenticated requests must receive:

```text
401 Unauthorized
```

---

# 24. Authorization Middleware

Authentication answers:

> Who are you?

Authorization answers:

> What are you allowed to do?

Implement role-based middleware.

Example:

```js
authorize("admin")
```

or:

```js
authorize("organizer", "admin")
```

---

# 25. Role Protection

Example:

```text
POST /api/events
        ↓
authenticate
        ↓
organizer/admin
```

Example:

```text
GET /api/admin/dashboard
        ↓
authenticate
        ↓
admin
```

A normal user must receive:

```text
403 Forbidden
```

when attempting an admin-only operation.

---

# 26. Ownership Protection

Role checking alone is not enough.

For example:

```text
Organizer A
    ↓
Event A

Organizer B
    ↓
Event B
```

Organizer B must not be allowed to edit Event A.

Backend must verify:

```text
event.organizer === req.user._id
```

unless the user is an admin.

---

# 27. Current User

Create:

```text
GET /api/auth/me
```

This endpoint returns the authenticated user's current information.

Frontend should use this endpoint to restore authentication state after page refresh.

---

# 28. Authentication State

Frontend should maintain states such as:

```text
loading
authenticated
unauthenticated
```

Do not assume the user is logged out simply because the page was refreshed.

Call:

```text
GET /api/auth/me
```

to determine the actual authentication state.

---

# 29. Protected Frontend Routes

Protect pages such as:

```text
/profile
/bookings
/tickets
/wishlist
/notifications
/checkout
/organizer/*
/admin/*
```

However:

> Frontend route protection is only for UX.

Actual security must always be enforced by the backend.

---

# 30. Organizer Access

Organizer routes should verify:

```text
authenticated
+
role = organizer OR admin
```

Example:

```text
/organizer/dashboard
/organizer/events
/organizer/bookings
/organizer/attendees
/organizer/analytics
```

---

# 31. Admin Access

Admin routes require:

```text
authenticated
+
role = admin
```

Examples:

```text
/admin/dashboard
/admin/users
/admin/events
/admin/bookings
/admin/payments
/admin/analytics
```

---

# 32. Logout Flow

```text
User clicks Logout
        ↓
POST /api/auth/logout
        ↓
Backend clears cookie
        ↓
Frontend clears local user state
        ↓
Redirect to homepage/login
```

Backend must clear the cookie using matching cookie configuration.

---

# 33. Logout Response

```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

# 34. Forgot Password Flow

```text
User clicks Forgot Password
        ↓
Enter email
        ↓
POST /api/auth/forgot-password
        ↓
Generate reset OTP
        ↓
Send email
        ↓
User enters OTP
        ↓
Enter new password
        ↓
POST /api/auth/reset-password
        ↓
Password updated
```

---

# 35. Password Reset OTP

Use a separate reset OTP from the registration OTP.

Fields:

```text
passwordResetOtpHash
passwordResetOtpExpiresAt
```

Invalidate the OTP after successful password reset.

---

# 36. Password Reset Email

Email should contain:

```text
Eventora Password Reset
Verification code
Expiration time
Security warning
```

Do not include the user's current password.

---

# 37. Password Reset Security

After password reset:

```text
invalidate reset OTP
```

Optionally invalidate existing sessions/tokens depending on the authentication architecture.

For higher security, consider maintaining a token version or password-change timestamp.

---

# 38. Account Verification

User account should contain something similar to:

```js
{
  isVerified: false
}
```

After successful OTP:

```js
isVerified = true
```

Unverified users should not be allowed to perform sensitive authenticated operations.

---

# 39. Account Status

Support an account status such as:

```text
active
suspended
```

Suspended users must not be allowed to authenticate or use protected resources.

Admin should be able to suspend/reactivate users.

---

# 40. Failed Login Handling

Do not reveal whether:

```text
email exists
password is incorrect
```

in a way that makes account enumeration easy.

Use a generic message such as:

```text
Invalid email or password.
```

---

# 41. Login Rate Limiting

Protect login against brute-force attempts.

Apply rate limiting to:

```text
POST /auth/login
POST /auth/register
POST /auth/verify-otp
POST /auth/resend-otp
POST /auth/forgot-password
POST /auth/reset-password
```

Use sensible limits rather than making the application unusable.

---

# 42. Session Expiration

JWT must expire.

When the backend detects an expired JWT:

```text
401 Unauthorized
```

Frontend should:

1. Clear authenticated state.
2. Redirect to login when appropriate.
3. Display a useful message.

---

# 43. Unauthorized API Response

Use:

```json
{
  "success": false,
  "message": "Authentication required."
}
```

with:

```text
401
```

---

# 44. Forbidden API Response

Use:

```json
{
  "success": false,
  "message": "You do not have permission to perform this action."
}
```

with:

```text
403
```

---

# 45. User Profile

Authenticated users can update:

```text
name
phone
city
profileImage
```

Users must not update themselves into:

```text
admin
```

or:

```text
organizer
```

through normal profile APIs.

Role changes must be controlled by the appropriate admin flow.

---

# 46. Authentication Events

Generate notifications where useful.

Examples:

```text
New login
Password changed
Email verified
Password reset
Account suspended
```

Do not expose sensitive information in notifications.

---

# 47. Security Rules

Never:

```text
store passwords in plain text
store JWT in localStorage
expose JWT_SECRET
expose MongoDB URI
expose Razorpay secret
trust frontend roles
trust frontend prices
trust frontend payment status
allow unrestricted admin APIs
```

---

# 48. Environment Variables

Backend:

```env
JWT_SECRET=
JWT_EXPIRES_IN=7d

COOKIE_NAME=eventora_token

CLIENT_URL=http://localhost:3000

OTP_EXPIRES_MINUTES=10
```

Production values must be configured through the hosting provider.

---

# 49. Authentication Database Fields

Recommended user fields:

```text
_id
name
email
passwordHash
role
isVerified
status
phone
city
profileImage
otpHash
otpExpiresAt
passwordResetOtpHash
passwordResetOtpExpiresAt
createdAt
updatedAt
```

Do not expose internal OTP/hash fields through API responses.

---

# 50. Authentication API Summary

```text
POST   /api/auth/register
POST   /api/auth/verify-otp
POST   /api/auth/resend-otp

POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

---

# 51. Complete Authentication Flow

The final system should work like this:

```text
                 ┌───────────────┐
                 │    Register   │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │  Send Email   │
                 │      OTP      │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │ Verify Email  │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │     Login     │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │ Generate JWT  │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │ HTTP-Only     │
                 │ Cookie        │
                 └───────┬───────┘
                         ↓
                ┌──────────────────┐
                │ Authenticated    │
                │ Application      │
                └────────┬─────────┘
                         ↓
              ┌──────────┼──────────┐
              ↓          ↓          ↓
            User     Organizer     Admin
              │          │          │
              ↓          ↓          ↓
          Bookings    Events     Platform
          Tickets     Sales      Management
          Wishlist    Analytics  Analytics
```

---

# 52. Final Authentication Requirements

Before considering authentication complete, verify:

```text
[ ] Registration works
[ ] Email validation works
[ ] Password hashing works
[ ] OTP generation works
[ ] OTP email works
[ ] OTP expiration works
[ ] OTP verification works
[ ] Resend OTP works
[ ] OTP rate limiting works
[ ] Login works
[ ] JWT is generated
[ ] JWT is stored in HTTP-only cookie
[ ] JWT is never returned to frontend JSON
[ ] /auth/me works
[ ] Logout clears cookie
[ ] Forgot password works
[ ] Reset password works
[ ] Role-based authorization works
[ ] Organizer permissions work
[ ] Admin permissions work
[ ] Ownership checks work
[ ] Suspended users are blocked
[ ] Protected API routes reject unauthenticated users
[ ] Frontend authentication state restores after refresh
[ ] Production CORS works
[ ] Production cookies work
[ ] Secrets are stored only in environment variables
```

The authentication system must be fully functional before building the complete booking and payment experience.
