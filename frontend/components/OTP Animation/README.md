# OTP Verification v3

A recreated, standalone HTML/CSS/JavaScript implementation inspired by the uploaded Reel.

## Files

- `index.html` — page structure
- `style.css` — dark glass UI, orbit, OTP cards and responsive layout
- `app.js` — OTP input, paste/autofill, timer, resend and verification logic

## Run

Open `index.html` directly in a browser.

For a local server:

```bash
python -m http.server 5500
```

Then open:

http://localhost:5500

## Demo

The demo OTP is:

`1234`

## Features

- 4-digit OTP input
- Numeric keyboard on mobile
- One-time-code autocomplete
- Paste a complete OTP
- Backspace and arrow-key navigation
- 30-second expiration timer
- Resend countdown
- Success/error states
- Orbit-style visual treatment
- Responsive mobile layout
- Reduced-motion support
