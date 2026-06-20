# Doctor Availability System – Quick Code Reference

Use this file to quickly view all code changes and copy them into your project.

---

## 1. Updated File: backend/src/server.js

**What to change:** Add availability route import and registration

**Find this section:**
```javascript
const authRoutes        = require('./routes/auth');
const doctorRoutes      = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const userRoutes        = require('./routes/users');

const app  = express();
```

**Change to:**
```javascript
const authRoutes        = require('./routes/auth');
const doctorRoutes      = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const userRoutes        = require('./routes/users');
const availabilityRoutes = require('./routes/availability');  // ADD THIS LINE

const app  = express();
```

**Find this section:**
```javascript
// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users',        userRoutes);
```

**Change to:**
```javascript
// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/availability', availabilityRoutes);  // ADD THIS LINE
```

---

## 2. Updated File: frontend/src/services/api.ts

**What to change:** Add availabilityAPI object

**Find the end of the file (after usersAPI):**
```typescript
// ── Users (Admin) ─────────────────────────────────────────────
export const usersAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/users`, { headers: getHeaders() }).then(handleResponse),

  getStats: () =>
    fetch(`${BASE_URL}/users/stats`, { headers: getHeaders() }).then(handleResponse),

  delete: (id: string | number) =>
    fetch(`${BASE_URL}/users/${id}`, {
      method:  'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),
};
```

**Add after it:**
```typescript
// ── Availability ──────────────────────────────────────────────
export const availabilityAPI = {
  // Get available time slots for a doctor on a specific date (public)
  getAvailableSlots: (doctorId: string | number, date: string) =>
    fetch(`${BASE_URL}/availability/doctors/${doctorId}/slots?date=${date}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Get doctor's full weekly schedule (public)
  getDoctorSchedule: (doctorId: string | number) =>
    fetch(`${BASE_URL}/availability/doctors/${doctorId}/schedule`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Get authenticated doctor's own schedule (doctor only)
  getMySchedule: () =>
    fetch(`${BASE_URL}/availability/my-schedule`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Update doctor's availability for a specific day (doctor only)
  updateSchedule: (
    doctorId: string | number,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    isAvailable: boolean,
    slotDuration?: number
  ) =>
    fetch(`${BASE_URL}/availability/doctors/${doctorId}/schedule`, {
      method:  'PUT',
      headers: getHeaders(),
      body:    JSON.stringify({
        dayOfWeek,
        startTime,
        endTime,
        isAvailable,
        slotDuration: slotDuration || 30,
      }),
    }).then(handleResponse),
};
```

---

## 3. Created File: backend/src/routes/availability.js

**File location:** `backend/src/routes/availability.js`

**Create this as a new file with:**
```javascript
// backend/src/routes/availability.js
// Doctor availability management & available slots lookup.
// Allows patients to find available time slots and doctors to manage their schedule.

const express  = require('express');
const router   = express.Router();
const { getPool, sql } = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// ── GET /api/availability/doctors/:doctorId/slots ────────────────────────────────────
// Returns available time slots for a specific doctor on a given date (public route).
// Query params: date (YYYY-MM-DD)
// Used by: Patients booking appointments
router.get('/doctors/:doctorId/slots', async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'date query parameter is required (format: YYYY-MM-DD)',
    });
  }

  try {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD',
      });
    }

    // Prevent booking for dates in the past
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments for past dates',
      });
    }

    const pool   = getPool();
    const result = await pool.request()
      .input('doctorId', sql.Int, req.params.doctorId)
      .input('date',     sql.Date, date)
      .execute('sp_GetDoctorAvailableSlots');

    res.json({
      success: true,
      doctorId: req.params.doctorId,
      date: date,
      availableSlots: result.recordset.map(slot => ({
        time: slot.availableSlot,
        isBooked: slot.isBooked === 1,
      })),
    });
  } catch (err) {
    console.error('Get available slots error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/availability/doctors/:doctorId/schedule ────────────────────────────────
// Returns full schedule (availability) for a doctor (public route).
// Shows which days and times the doctor is available.
// Used by: Public doctor profiles
router.get('/doctors/:doctorId/schedule', async (req, res) => {
  try {
    const pool   = getPool();
    const result = await pool.request()
      .input('doctorId', sql.Int, req.params.doctorId)
      .query(`
        SELECT * FROM vw_DoctorAvailabilityDetails
        WHERE doctor_id = @doctorId
        ORDER BY day_of_week, startTime
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or has no availability set',
      });
    }

    res.json({
      success: true,
      doctorId: req.params.doctorId,
      doctorName: result.recordset[0].doctorName,
      specialty: result.recordset[0].specialty,
      schedule: result.recordset.map(row => ({
        id: row.id,
        dayOfWeek: row.day_of_week,
        dayName: row.dayName,
        startTime: row.startTime,
        endTime: row.endTime,
        isAvailable: row.is_available === 1,
        slotDuration: row.slot_duration_minutes,
      })),
    });
  } catch (err) {
    console.error('Get doctor schedule error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PUT /api/availability/doctors/:doctorId/schedule ────────────────────────────────
// Updates doctor's availability for a specific day (doctor only).
// Request body: { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true, slotDuration: 30 }
// Used by: Doctors setting their working hours
router.put(
  '/doctors/:doctorId/schedule',
  authMiddleware,
  requireRole('doctor'),
  async (req, res) => {
    const { dayOfWeek, startTime, endTime, isAvailable, slotDuration } = req.body;

    if (
      dayOfWeek === undefined ||
      !startTime ||
      !endTime ||
      isAvailable === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'dayOfWeek, startTime, endTime, and isAvailable are required',
      });
    }

    try {
      const pool = getPool();

      // Verify the doctor exists and belongs to the authenticated user
      const doctorCheck = await pool.request()
        .input('doctorId', sql.Int, req.params.doctorId)
        .input('userId', sql.Int, req.user.id)
        .query('SELECT id FROM Doctors WHERE id = @doctorId AND user_id = @userId');

      if (doctorCheck.recordset.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own availability',
        });
      }

      // Call the stored procedure to set/update availability
      const result = await pool.request()
        .input('doctorId', sql.Int, req.params.doctorId)
        .input('dayOfWeek', sql.Int, dayOfWeek)
        .input('startTime', sql.NVarChar, startTime)
        .input('endTime', sql.NVarChar, endTime)
        .input('isAvailable', sql.Bit, isAvailable ? 1 : 0)
        .input('slotDurationMinutes', sql.Int, slotDuration || 30)
        .execute('sp_SetDoctorAvailability');

      const row = result.recordset[0];

      if (row.success === 0) {
        return res.status(400).json({
          success: false,
          message: row.message,
        });
      }

      res.json({
        success: true,
        message: row.message,
        data: {
          doctorId: req.params.doctorId,
          dayOfWeek,
          startTime,
          endTime,
          isAvailable,
          slotDuration: slotDuration || 30,
        },
      });
    } catch (err) {
      console.error('Update doctor availability error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// ── GET /api/availability/my-schedule ────────────────────────────────────────────────
// Returns authenticated doctor's full schedule (doctor only).
// Used by: Doctor dashboard to view/manage their own schedule
router.get('/my-schedule', authMiddleware, requireRole('doctor'), async (req, res) => {
  try {
    const pool = getPool();

    // Get doctor's ID from their user account
    const doctorQuery = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .query('SELECT id FROM Doctors WHERE user_id = @userId');

    if (doctorQuery.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    const doctorId = doctorQuery.recordset[0].id;

    // Get full schedule
    const result = await pool.request()
      .input('doctorId', sql.Int, doctorId)
      .query(`
        SELECT * FROM vw_DoctorAvailabilityDetails
        WHERE doctor_id = @doctorId
        ORDER BY day_of_week, startTime
      `);

    res.json({
      success: true,
      doctorId,
      doctorName: req.user.name,
      schedule: result.recordset.map(row => ({
        id: row.id,
        dayOfWeek: row.day_of_week,
        dayName: row.dayName,
        startTime: row.startTime,
        endTime: row.endTime,
        isAvailable: row.is_available === 1,
        slotDuration: row.slot_duration_minutes,
      })),
    });
  } catch (err) {
    console.error('Get my schedule error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
```

---

## 4. Updated File: frontend/src/pages/BookAppointment.tsx

**Replace entire file with:**

See the main BookAppointment.tsx file in the project (updated earlier) or copy from the repository at the line where BookAppointment component is defined.

**Key changes:**
- Import `availabilityAPI` from services
- Add `useEffect` to fetch slots when date changes
- Add state for `availableSlots`, `loadingSlots`, `slotsError`
- Convert time format from 24h to 12h with AM/PM
- Show loading/error states in UI
- Disable submit while loading

---

## 5. Database Migration

**File:** `database/migration_add_availability.sql`

**This file is pre-created in the project.** To run it:

1. Open SQL Server Management Studio (SSMS)
2. File → Open → Select `migration_add_availability.sql`
3. Press F5 or click Execute
4. Wait for completion (should see: "Doctor Availability System successfully added!")

---

## Testing the Implementation

### Test 1: Verify Database Objects
```sql
-- Run in SSMS
SELECT * FROM DoctorAvailability;  -- Should show data
SELECT * FROM vw_DoctorAvailabilityDetails;  -- Should show availability with names
```

### Test 2: Backend API Test
```bash
# Get available slots for doctor 1 on 2026-05-20
curl "http://localhost:5000/api/availability/doctors/1/slots?date=2026-05-20"

# Should return something like:
# {
#   "success": true,
#   "doctorId": "1",
#   "date": "2026-05-20",
#   "availableSlots": [
#     { "time": "09:00", "isBooked": false },
#     { "time": "09:30", "isBooked": false },
#     ...
#   ]
# }
```

### Test 3: Frontend Integration
1. Open browser → `http://localhost:5173`
2. Navigate to Doctor → Book Appointment
3. Select a date
4. Should see loading indicator briefly
5. Should see actual available time slots (not hardcoded list)
6. Select a time and book
7. Should confirm successful booking

---

## Checklist

- [ ] Run SQL migration: `migration_add_availability.sql`
- [ ] Verify `DoctorAvailability` table has data
- [ ] Update `backend/src/server.js` (add availability routes)
- [ ] Create `backend/src/routes/availability.js` (new file)
- [ ] Update `frontend/src/services/api.ts` (add availabilityAPI)
- [ ] Update `frontend/src/pages/BookAppointment.tsx` (dynamic slots)
- [ ] Restart backend: `npm run dev`
- [ ] Test in browser: book an appointment
- [ ] Verify slots load dynamically
- [ ] Confirm booking works

---

## File Sizes

- `migration_add_availability.sql`: ~500 lines
- `backend/src/routes/availability.js`: ~200 lines
- `frontend/src/services/api.ts`: +50 lines
- `frontend/src/pages/BookAppointment.tsx`: ~280 lines (updated)

**Total new code**: ~730 lines

---

## Dependencies

No new npm packages required. Uses existing:
- Express (backend routing)
- React (frontend UI)
- SQL Server mssql driver (already in use)

---

**Quick Reference Complete**

All files are ready to use. Copy code from the sections above into your project files.
