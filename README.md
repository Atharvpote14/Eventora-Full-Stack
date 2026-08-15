# ✦ EVENTORA

### The modern platform for discovering, creating, and experiencing events.

<p align="center">
  <strong>Discover. Create. Connect. Experience.</strong>
</p>

<p align="center">
  A full-stack event platform built to bring event discovery, management, authentication, payments, and seamless user experiences together in one place.
</p>

<p align="center">
  <b>🚀 Full-Stack • 🔐 Secure • 💳 Payments • ⚡ Modern UI</b>
</p>

---

## 🌟 ABOUT EVENTORA

**Eventora** is a modern full-stack event management and discovery platform designed to make finding, joining, and managing events simple, fast, and engaging.

Instead of jumping between multiple platforms to discover events, view details, register, authenticate, and manage participation, Eventora brings the complete experience together in one place.

> **Make every event easier to discover and every experience easier to manage.**

---

## ✨ FEATURES

- 🎟️ **Event Discovery** — Explore upcoming and available events through a modern interface.
- 📋 **Event Registration** — Register for events directly through the platform.
- 🔐 **Secure Authentication** — Authentication and protected application flows.
- 🔵 **Google OAuth** — Fast and convenient Google sign-in.
- 💳 **Razorpay Integration** — Payment infrastructure for paid event registrations.
- 👤 **User Management** — User-specific profiles, information, and activity.
- 🛡️ **Validation & Middleware** — Requests are validated and processed securely.
- ⚡ **Modern UI** — Clean, responsive, and interactive user experience.
- 📱 **Responsive Design** — Designed for desktop, tablet, and mobile devices.
- 🔄 **API Architecture** — Structured communication between frontend and backend.
- 🧩 **Modular Backend** — Controllers, routes, services, models, middleware, and validators are separated for maintainability.

---

## 🧠 ARCHITECTURE

```text
                         ┌──────────────────────┐
                         │       USER / WEB     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    NEXT.JS FRONTEND  │
                         │                      │
                         │  App Router          │
                         │  Components          │
                         │  Contexts            │
                         │  Services            │
                         │  Types               │
                         └──────────┬───────────┘
                                    │
                              API Requests
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    EXPRESS BACKEND   │
                         │                      │
                         │  Routes              │
                         │  Controllers         │
                         │  Middleware          │
                         │  Services            │
                         │  Models              │
                         │  Validators          │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    ▼               ▼                ▼
              ┌──────────┐   ┌────────────┐   ┌───────────┐
              │ Database │   │ Google OAuth│   │ Razorpay  │
              └──────────┘   └────────────┘   
