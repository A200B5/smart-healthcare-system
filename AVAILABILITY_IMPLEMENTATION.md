# Doctor Availability System – Implementation Guide

## Overview

This document explains the new doctor availability system that replaces the hardcoded schedule strings with a real, database-driven availability management system.

---

## What Changed

### Before
- Doctor schedules stored as comma-separated strings in `Doctors.schedule` (e.g., `'Mon,Wed,Fri'`)
- Appointment booking used hardcoded time slots: `['9:00 AM', '10:00 AM', ..., '5:00 PM']`
- No real availability validation
- Patients couldn't see actual available time slots

### After
- New `DoctorAvailability` table stores structured availability:
  - Day of week (0-6)
  - Start time (HH:MM format)
  - End time (HH:MM format)
  - Slot duration (15-480 minutes, default 30)
  - Is available flag
- Real-time availability checking during appointment booking
- Patients see actual available slots for each doctor on their selected date
- Doctors can manage their weekly schedule via API

---

## Database Schema

### New Table: DoctorAvailability

```sql
CREATE TABLE DoctorAvailability (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    doctor_id               INT NOT NULL (FK to Doctors),
    day_of_week             INT NOT NULL (0-6, Sunday to Saturday),
    start_time              TIME(0) NOT NULL (e.g., 09:00),
    end_time                TIME(0) NOT NULL (e.g., 17:00),
    is_available            BIT NOT NULL DEFAULT 1,
    slot_duration_minutes   INT NOT NULL DEFAULT 30,
    created_at              DATETIME2 NOT NULL,
    updated_at              DATETIME2 NOT NULL
);
```

### Day of Week Mapping
- `0` = Sunday
- `1` = Monday
- `2` = Tuesday
- `3` = Wednesday
- `4` = Thursday
- `5` = Friday
- `6` = Saturday

### Example Data
```sql
-- Dr. Sarah (Cardiology) works Monday-Friday, 9 AM - 5 PM, 30-min slots
INSERT INTO DoctorAvailability VALUES
(1, 1, '09:00', '17:00', 1, 30),  -- Monday
(1, 2, '09:00', '17:00', 1, 30),  -- Tuesday
(1, 3, '09:00', '17:00', 1, 30),  -- Wednesday
(1, 4, '09:00', '17:00', 1, 30),  -- Thursday
(1, 5, '09:00', '17:00', 1, 30);  -- Friday
```

---

## Setup Instructions

### Step 1: Run the Migration

1. Open **SQL Server Management Studio (SSMS)**
2. Open the migration file: `database/migration_add_availability.sql`
3. Press **F5** to execute
4. The migration will:
   - Create the `DoctorAvailability` table
   - Create indexes for performance
   - Populate availability from existing doctor schedules
   - Create helper views and stored procedures
   - Update the appointment booking logic

### Step 2: Verify Migration Success

```sql
-- Check if table was created
SELECT * FROM DoctorAvailability;

-- Check if data was seeded
SELECT COUNT(*) FROM DoctorAvailability;  -- Should be > 0

-- View helper view
SELECT * FROM vw_DoctorAvailabilityDetails;
```

### Step 3: Restart Backend

```bash
cd backend
npm run dev
```

The backend will automatically use the updated stored procedures.

---

## API Endpoints

### 1. Get Available Slots for a Doctor (PUBLIC)

**Endpoint:** `GET /api/availability/doctors/:doctorId/slots?date=YYYY-MM-DD`

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "doctorId": 1,
  "date": "2026-05-20",
  "availableSlots": [
    { "time": "09:00", "isBooked": false },
    { "time": "09:30", "isBooked": false },
    { "time": "10:00", "isBooked": false },
    { "time": "10:30", "isBooked": true },
    { "time": "11:00", "isBooked": false }
  ]
}
```

**Example:**
```typescript
const response = await availabilityAPI.getAvailableSlots(1, '2026-05-20');
```

---

### 2. Get Doctor's Full Schedule (PUBLIC)

**Endpoint:** `GET /api/availability/doctors/:doctorId/schedule`

**Response:**
```json
{
  "success": true,
  "doctorId": 1,
  "doctorName": "Dr. Sarah Johnson",
  "specialty": "Cardiology",
  "schedule": [
    {
      "id": 1,
      "dayOfWeek": 1,
      "dayName": "Monday",
      "startTime": "09:00",
      "endTime": "17:00",
      "isAvailable": true,
      "slotDuration": 30
    },
    {
      "id": 2,
      "dayOfWeek": 2,
      "dayName": "Tuesday",
      "startTime": "09:00",
      "endTime": "17:00",
      "isAvailable": true,
      "slotDuration": 30
    }
    // ... more days
  ]
}
```

**Example:**
```typescript
const response = await availabilityAPI.getDoctorSchedule(1);
```

---

### 3. Get My Schedule (DOCTOR ONLY)

**Endpoint:** `GET /api/availability/my-schedule`

**Headers:** Requires authentication + doctor role

**Response:** Same format as endpoint #2

**Example:**
```typescript
const response = await availabilityAPI.getMySchedule();
```

---

### 4. Update Doctor's Availability (DOCTOR ONLY)

**Endpoint:** `PUT /api/availability/doctors/:doctorId/schedule`

**Headers:** Requires authentication + doctor role

**Request Body:**
```json
{
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "17:00",
  "isAvailable": true,
  "slotDuration": 30
}
```

**Response:**
```json
{
  "success": true,
  "message": "Doctor availability updated successfully",
  "data": {
    "doctorId": 1,
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "17:00",
    "isAvailable": true,
    "slotDuration": 30
  }
}
```

**Example:**
```typescript
await availabilityAPI.updateSchedule(
  1,           // doctorId
  1,           // dayOfWeek (Monday)
  '09:00',     // startTime
  '17:00',     // endTime
  true,        // isAvailable
  30           // slotDuration (optional)
);
```

---

## Updated Stored Procedures

### 1. sp_BookAppointment (UPDATED)

Now validates appointment against `DoctorAvailability` table.

**Logic:**
1. Verify doctor exists and is globally available
2. Verify patient is active
3. Parse appointment date to get day of week
4. Parse appointment time (handles both 24-hour and 12-hour formats)
5. **NEW:** Check if doctor has availability for that day and time
6. Check for time-slot conflicts with existing appointments
7. Insert appointment if all checks pass

**Error Codes:**
- `-1`: Doctor not found or not available
- `-2`: Patient not found or inactive
- `-3`: Time slot already booked
- `-4`: Invalid time format
- `-5`: **NEW** Doctor not available at this date/time

---

### 2. sp_GetDoctorAvailableSlots (NEW)

Returns list of available time slots for a specific doctor on a given date.

**Parameters:**
- `@doctorId`: Doctor ID
- `@date`: Appointment date (DATE format)

**Returns:** Recordset with columns:
- `availableSlot`: Time in HH:MM format
- `isBooked`: 1 if booked, 0 if available

---

### 3. sp_SetDoctorAvailability (NEW)

Sets or updates doctor's availability for a specific day.

**Parameters:**
- `@doctorId`: Doctor ID
- `@dayOfWeek`: 0-6
- `@startTime`: 'HH:MM' format
- `@endTime`: 'HH:MM' format
- `@isAvailable`: 1 or 0
- `@slotDurationMinutes`: 15-480

**Behavior:** UPSERT (updates if exists, inserts if not)

---

## Frontend Changes

### Updated: BookAppointment Component

The booking page now dynamically loads available slots based on the selected date.

**What Changed:**
- Removed hardcoded `times` array
- Added `useEffect` hook to fetch slots when date changes
- Shows "Loading..." while fetching
- Shows "No available slots" if doctor not available that day
- Shows loading state while submitting

**Time Format Conversion:**
- Backend returns slots in 24-hour format: `'09:00'`, `'09:30'`, etc.
- Frontend converts to 12-hour format for display: `'9:00 AM'`, `'9:30 AM'`, etc.

---

## Frontend API Service: availabilityAPI

Added to `src/services/api.ts`:

```typescript
export const availabilityAPI = {
  getAvailableSlots: (doctorId, date) => {...},
  getDoctorSchedule: (doctorId) => {...},
  getMySchedule: () => {...},
  updateSchedule: (doctorId, dayOfWeek, startTime, endTime, isAvailable, slotDuration) => {...},
};
```

---

## Example Usage

### Patient: Booking an Appointment

```typescript
import { availabilityAPI } from '../services/api';

// 1. Fetch available slots for doctor 1 on 2026-05-20
const slotsResponse = await availabilityAPI.getAvailableSlots(1, '2026-05-20');

// 2. Show available slots to patient
const availableSlots = slotsResponse.availableSlots
  .filter(slot => !slot.isBooked)
  .map(slot => convertTo12Hour(slot.time));

// 3. Patient selects a time and books
await appointmentsAPI.book(
  doctorId,
  selectedDate,
  selectedTime,
  patientNotes
);
```

### Doctor: Viewing Their Schedule

```typescript
import { availabilityAPI } from '../services/api';

// Get my full weekly schedule
const scheduleResponse = await availabilityAPI.getMySchedule();
console.log(scheduleResponse.schedule);
// Output:
// [
//   { dayOfWeek: 1, dayName: 'Monday', startTime: '09:00', endTime: '17:00', ... },
//   { dayOfWeek: 2, dayName: 'Tuesday', startTime: '09:00', endTime: '17:00', ... },
//   ...
// ]
```

### Doctor: Changing Availability

```typescript
import { availabilityAPI } from '../services/api';

// Update Monday to 10 AM - 6 PM with 45-minute slots
await availabilityAPI.updateSchedule(
  myDoctorId,
  1,         // Monday
  '10:00',
  '18:00',
  true,
  45         // 45-minute slots
);
```

---

## Important Notes

### 1. Time Format Conversion

The backend stores times in 24-hour `TIME(0)` format (e.g., `09:00`, `17:00`).

When displaying to patients, convert to 12-hour format with AM/PM:
```typescript
function convertTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}
```

### 2. Slot Duration

Slot duration is configurable per doctor. Default is 30 minutes.

If a doctor has 30-minute slots, available times will be:
- 9:00, 9:30, 10:00, 10:30, ..., 16:30

If changed to 45-minute slots:
- 9:00, 9:45, 10:30, 11:15, ..., 16:15

### 3. Backward Compatibility

The old `Doctors.schedule` column is still present. The migration populated `DoctorAvailability` from it but doesn't use the `schedule` column anymore.

To clean up later (optional):
```sql
ALTER TABLE Doctors DROP COLUMN schedule;
```

### 4. Past Date Protection

The API rejects booking for dates in the past:
```typescript
if (date < today) {
  return 'Cannot book appointments for past dates';
}
```

### 5. Appointment Conflict Prevention

The system checks both availability AND existing appointments:
- First, verify doctor has availability for that day/time
- Then, verify no other appointment is booked at that exact time

This double-check prevents double-booking.

---

## Database Views

### vw_DoctorAvailabilityDetails

Provides friendly display of availability with doctor info:

```sql
SELECT * FROM vw_DoctorAvailabilityDetails;
```

Columns:
- `id`: Availability record ID
- `doctor_id`: Doctor ID
- `doctorName`: Doctor's full name
- `specialty`: Doctor's specialty
- `dayName`: Day name (e.g., 'Monday')
- `day_of_week`: Numeric day (0-6)
- `startTime`: Start time formatted as HH:MM
- `endTime`: End time formatted as HH:MM
- `is_available`: 1 or 0
- `slot_duration_minutes`: Duration in minutes
- `createdAt`: When record was created
- `updatedAt`: When record was last updated

---

## Testing Checklist

- [ ] Migration runs successfully without errors
- [ ] `DoctorAvailability` table has data for all doctors
- [ ] Backend starts without errors
- [ ] `GET /api/availability/doctors/1/slots?date=2026-05-20` returns available slots
- [ ] `GET /api/availability/doctors/1/schedule` returns full doctor schedule
- [ ] `GET /api/availability/my-schedule` works for authenticated doctors
- [ ] BookAppointment page shows available slots dynamically
- [ ] Selecting a date updates available times
- [ ] Booking an appointment works and prevents double-booking
- [ ] Past dates show no available slots
- [ ] Doctor can update their schedule via `PUT /api/availability/doctors/:id/schedule`

---

## Troubleshooting

### Issue: "Doctor not found or not available at this date and time"

**Cause:** Doctor has no availability set for that day or time range.

**Solution:** Check `DoctorAvailability` table and set availability for the desired day:
```sql
INSERT INTO DoctorAvailability (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes)
VALUES (1, 1, '09:00', '17:00', 1, 30);  -- Monday, 9 AM - 5 PM
```

### Issue: Available slots not showing in BookAppointment

**Cause:** Availability not set or API error.

**Solution:**
1. Check browser console for error messages
2. Check SQL: `SELECT * FROM DoctorAvailability WHERE doctor_id = ?`
3. Verify date format is YYYY-MM-DD

### Issue: Time conversion is wrong

**Cause:** Frontend not converting 24-hour to 12-hour format correctly.

**Solution:** Verify the `convertTo12Hour` function handles edge cases:
- 12:00 PM (noon) should not show as "00:00 PM"
- 12:xx AM (midnight hour) should not show as "00:xx AM"

---

## Future Enhancements

1. **Add buffer time between appointments** (travel time, cleanup)
2. **Vacation/blocked dates** – Doctors can block specific dates entirely
3. **Bulk schedule management** – Set recurring schedules
4. **Appointment reminders** – Automated notifications 24h before
5. **No-show tracking** – Track patients who don't show up
6. **Availability history** – Audit trail of schedule changes

---

## File Summary

### Created Files
- `database/migration_add_availability.sql` – Database migration
- `backend/src/routes/availability.js` – New API route handlers

### Modified Files
- `backend/src/server.js` – Registered availability routes
- `frontend/src/services/api.ts` – Added availabilityAPI
- `frontend/src/pages/BookAppointment.tsx` – Uses real availability

### Database Objects Created
- Table: `DoctorAvailability`
- View: `vw_DoctorAvailabilityDetails`
- Stored Procedures:
  - `sp_BookAppointment` (updated)
  - `sp_GetDoctorAvailableSlots` (new)
  - `sp_SetDoctorAvailability` (new)

---

**End of Implementation Guide**
