# DEPI Smart Healthcare Management System
> DEPI Graduation Project – React Frontend Track

---

## Project Structure

```
depi-project/
├── frontend/               React + TypeScript (Vite)
│   ├── public/
│   └── src/
│       ├── components/     Navbar, ProtectedRoute
│       ├── context/        AuthContext, AppContext
│       ├── pages/          All route pages
│       ├── services/       api.ts  (all HTTP calls)
│       └── types/          Shared TypeScript interfaces
│
├── backend/                Node.js + Express + MSSQL
│   └── src/
│       ├── config/         db.js  (SQL Server pool)
│       ├── middleware/     auth.js  (JWT + role guard)
│       └── routes/         auth, doctors, appointments, users
│
├── database/
│   └── depi_database.sql   Full SQL Server script (run on SSMS)
│
└── README.md
```

---

## Quick Start

### Step 1 – Database

1. Open **SSMS**
2. Open `database/depi_database.sql`
3. Press **F5** (Execute)
4. The script creates the `depi` database, all tables, views, stored procedures, and seed data.

### Step 2 – Backend

```bash
cd backend
npm install
# Edit .env → set DB_SERVER, DB_USER, DB_PASSWORD
npm run dev
```

API runs on `http://localhost:5000`

### Step 3 – Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`

---

## Test Accounts  (password: `password123`)

| Role    | Email               |
|---------|---------------------|
| Admin   | admin@depi.com      |
| Doctor  | sarah@depi.com      |
| Patient | patient@depi.com    |

---

## API Endpoints

| Method | Route                          | Auth        |
|--------|-------------------------------|-------------|
| POST   | /api/auth/register             | Public      |
| POST   | /api/auth/login                | Public      |
| GET    | /api/auth/me                   | Any role    |
| GET    | /api/doctors                   | Public      |
| GET    | /api/doctors/:id               | Public      |
| POST   | /api/doctors                   | Admin only  |
| PUT    | /api/doctors/:id               | Admin only  |
| DELETE | /api/doctors/:id               | Admin only  |
| GET    | /api/appointments              | Auth (role-filtered) |
| POST   | /api/appointments              | Patient     |
| PATCH  | /api/appointments/:id/status   | Doctor / Admin |
| DELETE | /api/appointments/:id          | Patient / Admin |
| GET    | /api/users                     | Admin only  |
| GET    | /api/users/stats               | Admin only  |
| DELETE | /api/users/:id                 | Admin only  |

---

## Team

| Name           | Role                                    |
|----------------|-----------------------------------------|
| Ahmed Bakr     | Team Leader – Dashboard & Analytics     |
| Ahmed Sabry    | Authentication & API Integration        |
| Ibrahim Mohamed| Booking System & Doctor Features        |
| Ahmed Hany     | Landing Page & UI/UX Components         |
