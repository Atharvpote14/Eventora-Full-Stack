# Eventora — UI Reference

## Premium Event Discovery & Ticketing Interface

**Project:** Eventora
**Document:** UI Reference
**Version:** 1.0

---

# 1. Purpose

This document defines the visual and interaction direction for Eventora.

The UI must feel like a **real premium consumer event platform**, with strong emphasis on:

* Event discovery
* High-quality imagery
* Clear information hierarchy
* Fast navigation
* Premium typography
* Strong content presentation
* Smooth interactions
* Trustworthy checkout
* Professional dashboards

The interface must NOT look like a generic AI-generated SaaS dashboard.

---

# 2. Primary Design Inspiration

The primary UX inspiration is modern event and entertainment discovery platforms such as **BookMyShow**, particularly its approach to:

* Location-aware discovery
* Search-first navigation
* Category exploration
* Large event imagery
* Horizontal content rails
* Recommendation sections
* Dense but organized event discovery
* Clear booking actions

Reference:

https://in.bookmyshow.com/explore/home/mumbai

This is **inspiration only**.

Do NOT copy:

* BookMyShow branding
* Logo
* Colors exactly
* Images
* Text
* Assets
* Exact layouts
* Exact components
* CSS
* Source code
* Proprietary visual elements

Eventora must have its own identity.

---

# 3. Visual Direction

Eventora should feel:

```text
Premium
Modern
Cinematic
Editorial
Confident
Clean
Immersive
Professional
Fast
Trustworthy
```

The UI should combine the visual richness of entertainment platforms with the usability of a modern web application.

---

# 4. What Eventora Must NOT Look Like

Avoid the following visual patterns:

```text
❌ Purple gradient everywhere
❌ Huge glowing purple blobs
❌ Generic glassmorphism
❌ Excessive neon
❌ Every card floating with a shadow
❌ Random gradient backgrounds
❌ Generic AI dashboard
❌ Giant centered SaaS hero
❌ Excessive rounded cards
❌ Excessive animations
❌ Rainbow gradients
❌ Fake 3D elements
❌ Random decorative shapes
❌ Unnecessary charts
❌ Excessive empty space
❌ Template-like UI
```

Do not use visual effects merely because they are trendy.

Every design element must serve a purpose.

---

# 5. Overall Visual Identity

Eventora should use a **cinematic dark-first visual system** with a refined light mode.

The visual identity should rely primarily on:

* Deep neutral surfaces
* Off-white typography
* Soft gray secondary text
* One restrained brand accent
* Rich photography
* Subtle borders
* Controlled shadows
* Strong spacing

Avoid making the brand color dominate every component.

---

# 6. Color Philosophy

Do not use a stereotypical "AI purple" palette.

The primary palette should be based on:

### Dark

```text
Background:
Very deep charcoal / near-black

Surface:
Dark neutral

Elevated Surface:
Slightly lighter neutral

Border:
Subtle neutral gray

Primary Text:
Warm white / off-white

Secondary Text:
Muted gray
```

### Accent

Use **one sophisticated accent color** rather than multiple neon colors.

Recommended direction:

```text
Warm red / coral-inspired accent
```

The accent should be used for:

* Primary CTA
* Active states
* Important highlights
* Price emphasis
* Booking actions
* Selected controls
* Important badges

Do not color every element with the accent.

---

# 7. Light Mode

Light mode should feel intentionally designed rather than simply inverting the dark theme.

Use:

```text
Background:
Warm off-white / very light neutral

Surface:
White

Border:
Soft gray

Primary text:
Deep charcoal

Secondary text:
Muted gray

Accent:
Same brand accent
```

Avoid pure white everywhere.

---

# 8. Typography

Typography should feel premium and editorial.

Use a modern sans-serif font system.

Recommended direction:

```text
Primary:
Inter / Geist / similar modern sans-serif

Optional display:
A sophisticated editorial sans-serif
```

Do not use decorative fonts for the main interface.

---

# 9. Typography Hierarchy

### Display Heading

Large, confident typography.

Example:

```text
Discover experiences
worth remembering.
```

### Section Heading

```text
Trending near you
```

### Card Title

```text
Future Tech Summit 2026
```

### Supporting Information

```text
24 Sep · Pune
```

### Price

```text
₹999
```

Typography should clearly distinguish:

```text
Title
Metadata
Price
Status
Description
CTA
```

---

# 10. Navigation

The main navigation should be compact and premium.

Desktop:

```text
┌─────────────────────────────────────────────────────────────┐
│ EVENTORA   Explore   Categories   Location   Search   Login │
└─────────────────────────────────────────────────────────────┘
```

Authenticated users:

```text
EVENTORA
Explore
Categories
Location
Search
Wishlist
Profile
```

Do not overcrowd the navigation.

---

# 11. Header Behavior

The header should support:

* Transparent/overlay state on cinematic hero sections where appropriate
* Solid state while scrolling
* Sticky positioning where useful
* Smooth transition
* Clear active state

The header should never obscure content.

---

# 12. Location Selector

Location is important to Eventora's discovery experience.

Display the current city/location clearly.

Example:

```text
📍 Pune
```

Clicking it should open a location selector.

Potential cities:

```text
Pune
Mumbai
Bengaluru
Delhi
Hyderabad
Chennai
Kolkata
Ahmedabad
```

The system should remain extensible.

---

# 13. Search Experience

Search should be highly visible but not visually dominant.

Desktop search:

```text
┌──────────────────────────────────────┐
│ 🔍 Search events, artists, workshops │
└──────────────────────────────────────┘
```

Search interaction may open a larger search interface containing:

* Recent searches
* Suggested searches
* Popular categories
* Matching events
* Location suggestions

---

# 14. Homepage Structure

The homepage should follow an event-discovery hierarchy.

Recommended structure:

```text
Header
 ↓
Location + Search
 ↓
Featured Discovery
 ↓
Trending Events
 ↓
Popular Near You
 ↓
Upcoming Events
 ↓
Category Exploration
 ↓
Recommended Events
 ↓
Free Events
 ↓
Organizer/Platform Promotion
 ↓
Footer
```

Not every section must be visible at once.

The final composition should feel editorial rather than like a list of database records.

---

# 15. Hero / Featured Section

Do not create a generic SaaS hero.

Instead, use a **featured event discovery area**.

Example:

```text
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│              LARGE EVENT IMAGE                               │
│                                                              │
│  TECHFEST 2026                                               │
│  India's next generation technology experience               │
│                                                              │
│  24 SEP · PUNE                                               │
│                                                              │
│  [ Explore Event ]                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

The event imagery should do most of the visual work.

Use gradients only when necessary for text readability over imagery.

---

# 16. Event Cards

Event cards are a core component.

A standard card should contain:

```text
Image
Category
Wishlist
Event Title
Date
Location
Price
Availability
```

Example:

```text
┌─────────────────────────┐
│                         │
│       EVENT IMAGE       │
│                         │
│ Technology        ♡     │
├─────────────────────────┤
│ Future Tech Summit      │
│ 24 Sep · Pune           │
│ From ₹999               │
└─────────────────────────┘
```

---

# 17. Event Card Image Ratio

Prefer consistent image ratios.

Recommended:

```text
Portrait:
4:5

Landscape:
16:9

Featured:
16:9 or wider
```

The card system should choose ratios based on context.

Avoid inconsistent image dimensions within the same content rail.

---

# 18. Image Treatment

Event imagery should feel cinematic.

Use:

* High-quality images
* Object-cover
* Consistent cropping
* Subtle hover zoom
* Rounded corners only where appropriate
* Gradient overlays only for text readability

Do not put a dark overlay over every image by default.

---

# 19. Event Card Hover

Desktop hover may include:

* Slight image zoom
* Subtle elevation
* Accent transition
* CTA visibility
* Smooth 200–300ms transition

Avoid dramatic animations.

---

# 20. Horizontal Event Rails

Event discovery should make use of horizontal content rails.

Example:

```text
Trending Events                         See All →

┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Event 1 │ │ Event 2 │ │ Event 3 │ │ Event 4 │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

On mobile:

* Horizontal swipe
* Snap behavior where appropriate
* Hidden scrollbar
* Comfortable touch targets

---

# 21. Category Navigation

Categories should be visually discoverable.

Possible presentation:

```text
Technology
Workshops
Music
Sports
Gaming
Business
Education
Entertainment
```

Use:

* Compact pills
* Image-based categories
* Icon + label
* Editorial tiles

Do not make every category a giant rounded gradient pill.

---

# 22. Event Details Page

The event details page should prioritize conversion.

Recommended hierarchy:

```text
Breadcrumb
 ↓
Event Hero
 ↓
Title + Metadata
 ↓
Booking Panel
 ↓
Description
 ↓
Event Information
 ↓
Organizer
 ↓
Location
 ↓
Reviews
 ↓
Similar Events
```

---

# 23. Event Hero

Use a large cinematic image.

Desktop:

```text
┌────────────────────────────────────────────────────┐
│                                                    │
│                  EVENT IMAGE                       │
│                                                    │
└────────────────────────────────────────────────────┘

Technology
Future Tech Summit 2026

24 Sep 2026 · 10:00 AM
Pune

★★★★★ 4.8
```

---

# 24. Booking Panel

The booking panel should be visually clear.

Example:

```text
┌───────────────────────────────┐
│ Tickets                       │
│                               │
│ Standard Ticket               │
│ ₹999                          │
│                               │
│ Quantity   −  2  +            │
│                               │
│ Total        ₹1,998           │
│                               │
│ [ Continue to Booking ]       │
└───────────────────────────────┘
```

On desktop it may remain sticky.

On mobile it may become a bottom booking bar.

---

# 25. Price Design

Price should be visually prominent.

Examples:

```text
Free

₹499

From ₹999
```

Do not overuse accent colors.

---

# 26. Availability

Availability should be clearly communicated.

Examples:

```text
● 42 tickets left
● Selling fast
● Almost sold out
SOLD OUT
```

Avoid unnecessary urgency messaging.

Only display accurate availability.

---

# 27. Booking Flow UI

The booking flow should feel trustworthy.

Recommended steps:

```text
Event
 ↓
Ticket Selection
 ↓
Booking Details
 ↓
Payment
 ↓
Confirmation
```

A progress indicator may be used.

---

# 28. Checkout

Checkout must feel simpler than the event discovery pages.

Display:

```text
Event summary
Ticket type
Quantity
Price
Fees if applicable
Total
Payment method
```

Primary CTA:

```text
Proceed to Payment
```

Avoid distractions during checkout.

---

# 29. Payment UI

Payment pages must communicate trust.

Display:

```text
Secure payment
Powered by Razorpay
```

Never ask the user to manually enter sensitive payment details into Eventora if Razorpay Checkout handles them.

---

# 30. Booking Confirmation

After successful booking:

```text
✓ Booking Confirmed

You're all set for
Future Tech Summit 2026

Booking ID
EVT-BKG-284921

[ View Ticket ]
[ Back to Events ]
```

Use a restrained success animation.

Do not use excessive confetti or flashy effects.

---

# 31. Digital Ticket UI

Ticket should resemble a real event ticket.

Example:

```text
┌───────────────────────────────────────┐
│ EVENTORA                              │
│                                       │
│ FUTURE TECH SUMMIT                    │
│                                       │
│ 24 SEP 2026                           │
│ PUNE                                  │
│                                       │
│ ATHARV POTE                           │
│ Ticket: EVT-284921                    │
│                                       │
│                ┌──────────┐           │
│                │ QR CODE  │           │
│                └──────────┘           │
│                                       │
│                  ACTIVE               │
└───────────────────────────────────────┘
```

---

# 32. QR Verification UI

For organizers/admins:

### Scanner State

```text
Scan ticket QR code
```

### Valid

```text
✓ VALID TICKET

Atharv Pote
Future Tech Summit
Ticket EVT-284921

[ Mark as Checked In ]
```

### Invalid

```text
✕ INVALID TICKET

Ticket not found / expired / already used
```

The UI should clearly distinguish valid and invalid states.

---

# 33. User Dashboard UI

The user dashboard should not look like an admin panel.

It should feel personal.

Example:

```text
Good morning, Atharv

Your next experience

┌──────────────────────────────────────┐
│ Future Tech Summit                   │
│ 24 Sep · Pune                        │
│ [ View Ticket ]                      │
└──────────────────────────────────────┘

Upcoming
Recent Tickets
Recommended For You
```

---

# 34. Organizer Dashboard UI

Organizer dashboard can be more analytical.

Use:

* Sidebar navigation
* Summary metrics
* Tables
* Charts
* Event management
* Booking management

But maintain Eventora's visual identity.

Avoid generic:

```text
purple cards + 4 stats + random chart
```

---

# 35. Admin Dashboard UI

Admin dashboard should be information-dense but organized.

Recommended:

```text
Sidebar
Top navigation
Page title
Stats
Charts
Tables
Filters
```

Use visual hierarchy to distinguish:

* Important
* Warning
* Success
* Neutral

---

# 36. Dashboard Tables

Tables should support:

* Search
* Filtering
* Sorting
* Pagination
* Status badges
* Actions

Example:

```text
Event               Status       Bookings    Revenue
Tech Summit         Published    142         ₹1.4L
Design Workshop     Pending      —           —
Music Night         Sold Out     500         ₹3.2L
```

---

# 37. Status Badges

Use restrained badges.

Examples:

```text
Published
Pending
Rejected
Cancelled
Active
Used
Failed
Confirmed
```

Avoid bright neon pills.

---

# 38. Forms

Forms should be clean and easy to scan.

Use:

```text
Label
Input
Helper text
Validation
Error
```

Avoid floating labels unless they genuinely improve usability.

---

# 39. Input Design

Inputs should have:

* Clear borders
* Good contrast
* Comfortable height
* Visible focus state
* Error state
* Disabled state

Recommended height:

```text
44–48px
```

for most standard inputs.

---

# 40. Buttons

Primary button:

```text
[ Book Ticket ]
```

Secondary:

```text
[ View Details ]
```

Ghost:

```text
[ Learn More ]
```

Danger:

```text
[ Cancel Event ]
```

Buttons should not all use the same visual weight.

---

# 41. Modal Design

Use modals for:

* Confirmation
* Delete
* Cancel
* Approve
* Reject
* Important selections

Modal should include:

```text
Title
Description
Actions
Close
```

Avoid giant modal windows.

---

# 42. Toasts

Toast notifications should be:

* Small
* Clear
* Temporary
* Non-blocking

Examples:

```text
✓ Added to wishlist
✓ Booking confirmed
✓ Event updated
✕ Payment failed
```

---

# 43. Footer

Footer should contain:

```text
Eventora
About
Explore
Categories
For Organizers
Support
Privacy
Terms
Contact
Social links
```

Keep it structured and clean.

---

# 44. Mobile Design

Mobile UI is a first-class experience.

Do not simply shrink desktop UI.

Mobile should use:

* Bottom navigation where appropriate
* Swipeable event rails
* Sticky booking CTA
* Collapsible filters
* Mobile-friendly search
* Large touch targets
* Simplified dashboards

---

# 45. Mobile Bottom Navigation

For authenticated users:

```text
┌─────────────────────────────────────┐
│ Home  Explore  Bookings  Tickets Me │
└─────────────────────────────────────┘
```

Icons should be recognizable.

Use labels where appropriate.

---

# 46. Responsive Breakpoints

Use the framework's responsive system consistently.

Suggested conceptual breakpoints:

```text
Mobile
Tablet
Desktop
Large Desktop
```

Do not design separate unrelated layouts.

---

# 47. Animation Philosophy

Animations should communicate interaction.

Use:

* Fade
* Slide
* Scale
* Image zoom
* Layout transitions
* Skeleton shimmer

Animation duration should generally be:

```text
150ms – 400ms
```

Avoid:

* Long cinematic transitions between every page
* Excessive bouncing
* Continuous floating elements
* Distracting parallax everywhere

---

# 48. Page Transitions

Use subtle transitions between major pages where appropriate.

The application should still feel fast.

Never sacrifice navigation speed for animation.

---

# 49. Scroll Behavior

Scrolling should feel smooth but natural.

Potential interactions:

* Sticky header
* Horizontal rails
* Sticky booking panel
* Scroll reveal for selected sections

Avoid excessive scroll-jacking.

---

# 50. Image Loading

Images should have:

* Proper aspect ratio
* Lazy loading where appropriate
* Placeholder/skeleton
* Responsive sizing
* Optimized delivery

Avoid layout shifts.

---

# 51. Iconography

Use a consistent icon library such as **Lucide React**.

Icons should:

* Have consistent stroke width
* Be used sparingly
* Support labels
* Never replace important text unnecessarily

Avoid mixing multiple icon styles.

---

# 52. Border Radius

Use a restrained radius system.

Suggested:

```text
Small:
8px

Medium:
12px

Large:
16px

Featured:
20px
```

Do not round every element excessively.

---

# 53. Shadows

Shadows should be subtle.

Prefer:

```text
Soft elevation
```

over:

```text
Huge glowing shadows
```

Dark mode should rely heavily on surface contrast and borders instead of strong shadows.

---

# 54. Spacing

Use a consistent spacing system.

Content should have:

* Strong section spacing
* Comfortable card padding
* Consistent page gutters
* Clear grouping

Avoid both:

* Excessive whitespace
* Extremely cramped layouts

---

# 55. Content Density

Eventora should have a higher information density than a typical portfolio website.

Users should be able to quickly compare:

```text
Event
Date
Location
Price
Availability
```

without opening every event.

---

# 56. Visual Hierarchy

Every page should have an obvious hierarchy:

```text
Primary action
↓
Primary information
↓
Supporting information
↓
Secondary actions
```

The most important information should not compete with decorative elements.

---

# 57. Accessibility

UI components must support:

* Keyboard navigation
* Focus states
* Screen readers
* Sufficient contrast
* Accessible form labels
* Accessible dialogs
* Touch-friendly controls

Do not rely only on color to communicate status.

---

# 58. Error States

Error pages should remain branded.

Example:

```text
404

Looks like this event
has left the building.

[ Explore Events ]
```

Use tasteful humor only where appropriate.

---

# 59. Empty States

Empty states should provide:

1. Explanation
2. Helpful visual
3. Next action

Example:

```text
No saved events yet.

Save events you don't want to miss.

[ Explore Events ]
```

---

# 60. Skeleton Loading

Skeletons should match the final layout.

For event cards:

```text
┌───────────────┐
│               │
│    IMAGE      │
│               │
├───────────────┤
│ █████████     │
│ ███████       │
│ █████         │
└───────────────┘
```

Avoid full-screen loading spinners whenever a local skeleton can be used.

---

# 61. Design Consistency

The following must remain consistent throughout the application:

* Typography
* Color
* Buttons
* Inputs
* Cards
* Status badges
* Icons
* Spacing
* Border radius
* Animations
* Error messages
* Loading states

Do not redesign components independently for each page.

---

# 62. Premium Quality Checklist

Before considering the UI complete, verify:

```text
✓ No generic AI purple theme
✓ No excessive gradients
✓ No random glassmorphism
✓ Strong event imagery
✓ Consistent typography
✓ Clear event discovery
✓ Excellent card hierarchy
✓ Professional checkout
✓ Premium ticket design
✓ Responsive mobile experience
✓ Consistent dashboard design
✓ Smooth but restrained animations
✓ Good loading states
✓ Good empty states
✓ Good error states
✓ Accessible interactions
✓ Original Eventora visual identity
```

---

# 63. Final UI Principle

Eventora should visually communicate:

> **"This is a real platform where people discover and book experiences."**

It should feel closer to a polished consumer product than a college project.

The interface should prioritize **content, events, imagery, discovery, and conversion** over decorative UI effects.

When uncertain between a flashy design and a refined design, choose the **refined design**.
