# 🏥 Smart Healthcare Management & Analytics System

### DEPI Graduation Project – React Frontend Track

## 📌 Project Overview

Smart Healthcare Management & Analytics System is a modern web application designed to simplify the process of booking medical appointments and managing healthcare data. The system provides an intuitive interface for patients to book appointments, doctors to manage their schedules, and administrators to monitor system performance through advanced analytics dashboards.

The platform focuses on improving efficiency, organization, and user experience by providing real-time appointment management, smart filtering, and data visualization.

---

## 🧩 Problem Statement
Healthcare appointment booking and management is often inefficient due to:
- Manual or fragmented booking processes that waste time for patients and clinics
- Difficulty for patients to find the right doctor based on specialty/availability
- Schedule conflicts and poor visibility for doctors when tracking incoming bookings
- Limited analytics/visibility for administrators to understand platform usage and performance

---

## ✅ Proposed Solution (How It Works)
This project provides a role-based web platform with three main experiences:

- **Patient:** Register/Login → Browse doctors → Filter by specialty/rating/availability → Book appointment → View appointment history  
- **Doctor:** Login → View incoming appointments → Accept/Reject bookings → Manage schedule  
- **Admin:** Login → View dashboard → Monitor statistics & analytics → Manage doctors and users

---

## 🎯 Project Objectives

* Provide an easy-to-use interface for patients to book appointments
* Enable doctors to manage and track their appointments
* Provide administrators with analytics and insights through dashboards
* Implement secure authentication and role-based access
* Build a scalable and maintainable frontend using React and TypeScript
* Follow industry best practices in frontend architecture and design

---

## 👥 Team Members

* Ahmed Bakr — Team Leader & Frontend Developer (Dashboard & Analytics)
* Ahmed Sabry — Frontend Developer (Authentication & API Integration)
* Ibrahim Mohamed — Frontend Developer (Booking System & Doctor Features)
* Ahmed Hany — Frontend Developer (Landing Page & UI/UX Components)

---

## ⭐ Key Features
### Patient Features
- Register and login
- Browse doctors
- Filter doctors by specialty, rating, and availability
- Book appointments
- View appointment history

### Doctor Features
- View appointments
- Accept or reject bookings
- Manage schedule

### Admin Features
- Dashboard with analytics
- View system statistics
- Manage doctors and users
- Monitor platform performance

---

## 🛠 Technologies Used

**Frontend**
- React (Vite)
- JavaScript
- React Router DOM
- Bootstrap
- Axios

Backend:

*  ASP.NET Core
*  SQL Server

Other Tools:

* Git & GitHub
* Docker (optional)
* Chart libraries (Recharts or Chart.js)

---

## 🎨 UI/UX Design

### Figma Make Prototype
[Figma Make Prototype - Fullscreen View](https://www.figma.com/make/TcvVfONZwWwlhTc98y32yA/Refine-Application-Based-on-Code?t=3Z72gN9TKNp9ScwF-20&fullscreen=1)

### UI Preview PDF
Full UI/UX preview and system screens are available here:

docs/MediCare-Pro-UI-Showcase.pdf

### Design Specification
Complete Figma Design System and UI/UX specification:

docs/MediCare-Pro-Figma-Specification.pdf

---

## 🚀 Developer Setup

To set up the project locally for development with exact mock data, follow these steps:

### 1. Clone the Repository
```bash
git clone <repository-url>
cd depi-project
```

### 2. Database Creation & Migrations
Ensure you have SQL Server running locally.

1. Open SSMS (SQL Server Management Studio).
2. Create a database named `depi` (or run a script that creates it).
3. Execute the migration scripts from `backend/database/migrations` in this exact order:
   - `01_create_tables.sql`
   - `02_create_views.sql`
   - `03_create_reviews_sps.sql`
   - `04_create_availability_sps.sql`
   - `05_add_doctor_verification.sql`
   - `06_doctor_license_unique.sql`

### 3. Seed Development Data
Run the seed script to populate the database with standardized test accounts and mock data. This script is idempotent and safely cleans existing development data before inserting.
- Run: `backend/database/seeds/07_seed_data.sql`

#### Available Test Accounts:
- **Admin**: `admin@depi.com` / `Admin@2026_Secure!`
- **Doctor (Approved)**: `sabry8818@gmail.com` / `123456`
- **Patient**: `ab163545@gmail.com` / `123456`

### 4. Start the Application
**Backend:**
```bash
cd backend
npm install
npm run dev
```
*(Make sure to update `backend/.env` with your local SQL Server credentials).*

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

You can now navigate to the local frontend URL and log in using the provided test accounts!

---

## 📅 Project Plan (5 Weeks)

### Week 1: Planning & Setup

* Define project requirements
* Create GitHub repository
* Design wireframes
* Setup project structure

### Week 2: Authentication System

* Build login and registration UI
* Implement protected routes
* Connect to backend API

### Week 3: Core Features

* Doctors listing page
* Booking system
* Appointment management

### Week 4: Dashboard & Analytics

* Admin dashboard
* Charts and statistics
* Role-based access control

### Week 5: Testing & Finalization

* UI improvements
* Fix bugs
* Documentation
* Final deployment preparation

---

## 🧠 System Architecture

The system is built using a role-based architecture with 3 main user roles:

- Patient
- Doctor
- Admin

Each role has its own dashboard and permissions.

### Core Modules:
- Authentication System
- Doctor Management
- Appointment Booking System
- Role-Based Access Control
- Dashboard & Analytics
- Admin Monitoring System

---

## ⚠️ Challenges & Difficulties Faced
- Managing application state cleanly as features and roles expand
- Implementing role-based access control correctly (route protection + authorization)
- Integrating with APIs while handling loading/error states in a consistent UI
- Maintaining clean, scalable component structure and coordination across the team

---

## 🗂 Database Design (ER Diagram)

The backend system is designed using a scalable ER Diagram structure that supports:

- Users
- Patients
- Doctors
- Admins
- Appointments
- Reviews
- Doctor Availability

This ensures clean backend architecture and supports future scalability.

ER Diagram is included inside:

docs/ER-Diagram.pdf

---

## 🔗 API Integration Strategy

Frontend development starts using mock data to allow parallel work with backend development.

Once the ASP.NET backend APIs are completed, frontend services will be connected using Axios for real-time data integration.

Main API modules:
- Authentication APIs
- Doctors APIs
- Appointments APIs
- Dashboard Statistics APIs

---

## 🚀 Future Improvements

* Smart doctor recommendation system
* Real-time notifications
* Dark mode support
* Mobile optimization
