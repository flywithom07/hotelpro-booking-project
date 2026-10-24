# HotelPro — Luxury Hotel Booking & Management System

HotelPro is a full-stack hotel reservation and property management application built using the MERN stack (**React + Vite**, **Node.js**, **Express**, and **MongoDB with Mongoose**).

The system features robust role-based access control (RBAC), atomic overlapping reservation prevention, server-side pricing validation, automated session handling, and an administrative control suite.

---

## 🏗️ Architecture & Data Flow

```text
React 18 + Vite (Client)
   │ (HTTP / Axios with Bearer JWT interceptors)
   ▼
Express REST API (Server)
   │
   ├─► CORS & JSON Body Parsing
   ├─► Authentication Middleware (`verifyToken`)
   ├─► Authorization Guard (`requireAdmin`)
   ├─► Controllers (Auth, Rooms, Bookings, Admin)
   │
   ▼
Mongoose ODM (Models & Schemas)
   │
   ▼
MongoDB (Database with Compound Indexes)
```

---

## 🌟 Core Features

### 👤 Customer Experience
- **Responsive Landing Page**: Hero banner with date-availability search widget, featured suites carousel, amenities showcase, and guest reviews.
- **Customer Registration & Authentication**: Strict client and server validation. Public registrations are securely restricted to `userType: 'ordinary'`.
- **Rooms & Suites Catalog**: Dynamic filtering by keyword, room type (`Single`, `Double`, `Deluxe`, `Suite`, `Family`), price range, and calendar availability dates.
- **Detailed Room View**: High-resolution image preview, amenities list, booked date calendars, and interactive booking widget.
- **Server-Side Pricing Engine**: Booking duration (`totalDays`) and cost (`totalAmount`) are strictly calculated on the backend to prevent malicious price tampering.
- **My Reservations**: List of active and past bookings, check-in/out dates, pricing breakdown, and interactive booking cancellation with instant date release.
- **Personalized Dashboard**: Guest welcome header, reservation statistics, and profile summary.

### 🛡️ Administrative Portal
- **Executive Operations Dashboard**: High-level KPI summary cards for Total Revenue, Confirmed Bookings, Room Inventory, and Registered Guests.
- **Tab 1 — All Bookings**: Global reservation view with guest contact information, room details, status filtering, and administrative cancellation capabilities.
- **Tab 2 — All Rooms**: Live inventory table with instant room availability toggling (`Available` / `Unavailable`) and safe deletion guards.
- **Tab 3 — Add Room**: Creation form with room number uniqueness validation, category selection, pricing, descriptions, features, and image URLs.
- **Tab 4 — All Users**: Comprehensive directory of registered customer and administrative accounts with creation timestamps and roles.

---

## 🔒 Security Audit & Best Practices Implemented

1. **Role Escalation Protection**: Public signup (`POST /api/auth/signup`) explicitly ignores any client-supplied `userType` (e.g. `userType: 'admin'`) and unconditionally forces `'ordinary'`.
2. **Password Protection**: Passwords are hashed using `bcryptjs` with salt factor 10. User schemas configure `password: { select: false }` so hashes are never exposed in API queries or responses.
3. **Session & JWT Security**: JSON Web Tokens are signed using `process.env.JWT_SECRET` with configurable expiration. Axios interceptors automatically attach the `Authorization: Bearer <token>` header and clear expired credentials upon 401 responses.
4. **Reservation Integrity**: Overlapping bookings for the same room during confirmed reservation dates are strictly prevented via MongoDB queries:
   `fromDate < newCheckOut AND toDate > newCheckIn`. Cancelled reservations immediately free inventory.
5. **Authorization Guards**: Customers can only inspect or cancel their own bookings. Administrative routes (`/api/admin/*`, `POST /api/rooms`, etc.) require both a valid token and `userType === 'admin'`.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **MongoDB**: Either a local MongoDB instance (`mongodb://localhost:27017/hotelpro`), a MongoDB Atlas connection string, or rely on the built-in zero-config in-memory fallback.

---

### Step 1: Install Dependencies

```powershell
# In the Server directory:
cd Server
npm install

# In the Client directory:
cd ../Client
npm install
```

---

### Step 2: Environment Configuration

The backend is configured via `Server/.env`. A default configuration is pre-created:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hotelpro
JWT_SECRET=hotelpro_super_secret_jwt_key_2026_secure_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **Zero-Config Database Support**: If a local MongoDB service is not currently active on port 27017, the server will automatically launch an in-memory MongoDB daemon in development mode and auto-seed sample rooms and accounts!

---

### Step 3: Run the Application

#### Start the Backend API Server:
```powershell
cd Server
npm start
# Server listens at http://localhost:5000
# API Healthcheck: http://localhost:5000/api/health
```

#### Start the React + Vite Frontend:
```powershell
cd Client
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 🧪 Testing

The backend includes an automated integration test suite covering security rules, duplicate account prevention, room CRUD, availability overlaps, server-side pricing, and role authorization.

Run all tests from the `Server` folder:
```powershell
cd Server
npm test
```

### Test Suite Coverage:
- `✔ 1. Security: Public signup enforces userType "ordinary" and ignores "admin" escalation`
- `✔ 2. Security: Registration prevents duplicate emails`
- `✔ 3. Auth: Login fails with invalid password`
- `✔ 4. Auth: Setup Admin and Customer tokens`
- `✔ 5. Auth: Protected route /api/auth/me returns current user`
- `✔ 6. Room: Ordinary user cannot create a room (403 Forbidden)`
- `✔ 7. Room: Admin can create room and duplicate room numbers are rejected`
- `✔ 8. Room: Public can list rooms`
- `✔ 9. Booking: Date validation rejects past check-in and checkout <= checkin`
- `✔ 10. Booking: Server correctly calculates totalDays and totalAmount`
- `✔ 11. Booking: Overlapping reservation is strictly rejected (409 Conflict)`
- `✔ 12. Booking: Unauthorized user cannot cancel another user booking (403 Forbidden)`
- `✔ 13. Booking: Owner can cancel booking and freed dates can now be booked`
- `✔ 14. Admin: Ordinary user cannot access admin users list or stats (403 Forbidden)`
- `✔ 15. Admin: Admin can access users list and dashboard stats (200 OK)`

---

## 🔑 Default Seed & Demo Credentials

When the database is empty or seeded, the following accounts are available for testing:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@hotelpro.com` | `AdminPassword123!` | Full Admin Portal, All Rooms, All Bookings, User Directory |
| **Customer** | `customer@hotelpro.com` | `CustomerPass123!` | Room Reservations, Personal Dashboard, Booking History |

> 💡 *On the Login page (`/login`), click the "Demo Customer" or "Demo Admin" buttons to instantly fill in these credentials.*

---

## 📡 API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/signup` — Register customer account (public).
- `POST /api/auth/login` — Sign in and receive JWT token (public).
- `GET /api/auth/me` — Retrieve current authenticated user profile (`Bearer <token>`).

### Rooms (`/api/rooms`)
- `GET /api/rooms` — List rooms with optional filters (`type`, `minPrice`, `maxPrice`, `search`, `fromDate`, `toDate`).
- `GET /api/rooms/:id` — Get room details & booked date ranges.
- `POST /api/rooms` — Create room (Admin only).
- `PUT /api/rooms/:id` — Update room fields or availability (Admin only).
- `DELETE /api/rooms/:id` — Delete room without active bookings (Admin only).

### Bookings (`/api/bookings`)
- `POST /api/bookings` — Create a new reservation with dates and server price calculation.
- `GET /api/bookings/my` — Retrieve the logged-in customer's reservations.
- `PATCH /api/bookings/:id/cancel` — Cancel a reservation (Owner or Admin).
- `GET /api/bookings` — List all reservations across all guests (Admin only).

### Administration (`/api/admin`)
- `GET /api/admin/users` — List registered users without password hashes (Admin only).
- `GET /api/admin/stats` — Summary statistics: revenue, room count, bookings (Admin only).
