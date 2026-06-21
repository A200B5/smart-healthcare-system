-- ============================================================
--   DEPI Graduation Project  |  Smart Healthcare System
--   SQL Server Script  -  Version 3.0  (Production Ready)
--   Run this file on SSMS, then configure backend/.env
--   Compatible: SQL Server 2016+
-- ============================================================

USE master;
GO

-- ============================================================
-- STEP 1: Drop & Recreate database safely
--         Kills all open connections before dropping
-- ============================================================
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'depi')
BEGIN
    -- Kill every active session connected to the database
    DECLARE @killSessions NVARCHAR(MAX) = '';
    SELECT @killSessions += 'KILL ' + CAST(session_id AS NVARCHAR(10)) + '; '
    FROM sys.dm_exec_sessions
    WHERE database_id = DB_ID(N'depi')
      AND session_id  <> @@SPID;  -- do not kill our own session

    IF LEN(@killSessions) > 0
        EXEC sp_executesql @killSessions;

    ALTER DATABASE depi SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE depi;
    PRINT 'Previous [depi] database dropped successfully.';
END
GO

CREATE DATABASE depi
    COLLATE Arabic_CI_AS;   -- supports Arabic & English text
GO

USE depi;
GO

PRINT '============================================================';
PRINT '  Database [depi] created. Building schema...';
PRINT '============================================================';

-- ============================================================
-- STEP 2: Tables
-- ============================================================

-- ── 2.1  Users  ──────────────────────────────────────────────
-- Stores all system users: patients, doctors, admins
CREATE TABLE Users (
    id          INT            IDENTITY(1,1)   PRIMARY KEY,
    name        NVARCHAR(100)  NOT NULL,
    email       NVARCHAR(150)  NOT NULL        UNIQUE,
    password    NVARCHAR(255)  NOT NULL,
    role        NVARCHAR(20)   NOT NULL
                    CONSTRAINT CK_Users_Role
                    CHECK (role IN ('patient', 'doctor', 'admin')),
    is_active   BIT            NOT NULL        DEFAULT 1,  -- soft-ban without deleting
    created_at  DATETIME2      NOT NULL        DEFAULT SYSDATETIME()
);
GO

-- ── 2.2  Doctors  ────────────────────────────────────────────
-- Extended profile for users with role = 'doctor'
CREATE TABLE Doctors (
    id          INT            IDENTITY(1,1)   PRIMARY KEY,
    user_id     INT            NOT NULL
                    CONSTRAINT FK_Doctors_Users
                    REFERENCES Users(id) ON DELETE CASCADE,
    specialty   NVARCHAR(100)  NOT NULL,
    rating      DECIMAL(3,1)   NOT NULL        DEFAULT 0.0
                    CONSTRAINT CK_Doctors_Rating CHECK (rating BETWEEN 0.0 AND 5.0),
    reviews     INT            NOT NULL        DEFAULT 0,
    experience  INT            NOT NULL
                    CONSTRAINT CK_Doctors_Exp   CHECK (experience >= 0),
    available   BIT            NOT NULL        DEFAULT 1,
    avatar      NVARCHAR(20)   NOT NULL        DEFAULT N'👨‍⚕️',
    price       DECIMAL(10,2)  NOT NULL
                    CONSTRAINT CK_Doctors_Price CHECK (price >= 0),
    location    NVARCHAR(200)  NOT NULL,
    bio         NVARCHAR(1000) NOT NULL        DEFAULT '',
    schedule    NVARCHAR(100)  NOT NULL        DEFAULT ''  -- stored as 'Mon,Wed,Fri'
);
GO

-- ── 2.3  Appointments  ───────────────────────────────────────
-- Booking records linking patients to doctors
CREATE TABLE Appointments (
    id                INT            IDENTITY(1,1)   PRIMARY KEY,
    doctor_id         INT            NOT NULL
                          CONSTRAINT FK_Appointments_Doctors
                          REFERENCES Doctors(id) ON DELETE CASCADE,
    patient_id        INT            NOT NULL
                          CONSTRAINT FK_Appointments_Patients
                          REFERENCES Users(id),
    appointment_date  DATE           NOT NULL,
    appointment_time  TIME(0)        NOT NULL,  -- store time as TIME so slot comparisons are exact
    status            NVARCHAR(20)   NOT NULL        DEFAULT 'pending'
                          CONSTRAINT CK_Appointments_Status
                          CHECK (status IN ('pending','confirmed','rejected','completed')),
    notes             NVARCHAR(500)  NOT NULL        DEFAULT '',
    created_at        DATETIME2      NOT NULL        DEFAULT SYSDATETIME()
);
GO

-- ============================================================
-- STEP 3: Performance Indexes
-- ============================================================
CREATE INDEX IX_Appointments_PatientId  ON Appointments (patient_id);
CREATE INDEX IX_Appointments_DoctorId   ON Appointments (doctor_id);
CREATE INDEX IX_Appointments_Date       ON Appointments (appointment_date);
CREATE INDEX IX_Appointments_Status     ON Appointments (status);
CREATE INDEX IX_Doctors_Specialty       ON Doctors      (specialty);
CREATE INDEX IX_Doctors_Available       ON Doctors      (available);
CREATE INDEX IX_Users_Email             ON Users        (email);
CREATE INDEX IX_Users_Role              ON Users        (role);
GO

PRINT 'Tables and indexes created.';
GO

-- ============================================================
-- STEP 4: Views  (used directly by backend routes)
-- ============================================================

-- ── 4.1  Full appointment details with doctor + patient names
--  Used by: GET /api/appointments  (all roles)
CREATE OR ALTER VIEW vw_AppointmentDetails AS
SELECT
    a.id,
    a.doctor_id                                   AS doctorId,
    u_doc.name                                    AS doctorName,
    d.specialty,
    d.avatar,
    a.patient_id                                  AS patientId,
    u_pat.name                                    AS patientName,
    u_pat.email                                   AS patientEmail,
    CONVERT(VARCHAR(10), a.appointment_date, 23)  AS [date],
    CONVERT(VARCHAR(5), a.appointment_time, 108)  AS [time],  -- format TIME(0) as 'HH:mm'
    a.status,
    a.notes,
    CONVERT(VARCHAR(19), a.created_at, 120)       AS createdAt
FROM  Appointments a
JOIN  Doctors d      ON a.doctor_id  = d.id
JOIN  Users   u_doc  ON d.user_id    = u_doc.id
JOIN  Users   u_pat  ON a.patient_id = u_pat.id;
GO

-- ── 4.2  Doctor list joined with user name & email
--  Used by: GET /api/doctors  (public)
CREATE OR ALTER VIEW vw_DoctorList AS
SELECT
    d.id,
    u.name,
    u.email,
    d.specialty,
    d.rating,
    d.reviews,
    d.experience,
    d.available,
    d.avatar,
    d.price,
    d.location,
    d.bio,
    d.schedule
FROM  Doctors d
JOIN  Users   u ON d.user_id = u.id
WHERE u.is_active = 1;
GO

-- ── 4.3  User list with their total appointment count
--  Used by: GET /api/users  (admin only)
CREATE OR ALTER VIEW vw_UserList AS
SELECT
    u.id,
    u.name,
    u.email,
    u.role,
    u.is_active                                   AS isActive,
    CONVERT(VARCHAR(10), u.created_at, 23)        AS joined,
    COUNT(a.id)                                   AS appointments
FROM  Users u
LEFT JOIN Appointments a ON u.id = a.patient_id
GROUP BY u.id, u.name, u.email, u.role, u.is_active, u.created_at;
GO

-- ── 4.4  Admin dashboard statistics (single-row summary)
--  Used by: GET /api/users/stats  (admin only)
CREATE OR ALTER VIEW vw_AdminStats AS
SELECT
    (SELECT COUNT(*) FROM Users)                                             AS totalUsers,
    (SELECT COUNT(*) FROM Users  WHERE role = 'patient')                    AS totalPatients,
    (SELECT COUNT(*) FROM Users  WHERE role = 'doctor')                     AS totalDoctors,
    (SELECT COUNT(*) FROM Doctors)                                           AS totalDoctorProfiles,
    (SELECT COUNT(*) FROM Doctors WHERE available = 1)                      AS availableDoctors,
    (SELECT COUNT(*) FROM Appointments)                                      AS totalAppointments,
    (SELECT COUNT(*) FROM Appointments WHERE status = 'pending')             AS pendingAppointments,
    (SELECT COUNT(*) FROM Appointments WHERE status = 'confirmed')           AS confirmedAppointments,
    (SELECT COUNT(*) FROM Appointments WHERE status = 'completed')           AS completedAppointments,
    (SELECT COUNT(*) FROM Appointments WHERE status = 'rejected')            AS rejectedAppointments,
    (SELECT COUNT(*) FROM Appointments
     WHERE CAST(created_at AS DATE) = CAST(SYSDATETIME() AS DATE))          AS todayAppointments;
GO

PRINT 'Views created.';
GO

-- ============================================================
-- STEP 5: Stored Procedures
-- ============================================================

-- ── 5.1  Book a new appointment (with conflict & availability check)
--  Used by: POST /api/appointments
CREATE OR ALTER PROCEDURE sp_BookAppointment
    @doctorId   INT,
    @patientId  INT,
    @date       DATE,
    @time       NVARCHAR(20),
    @notes      NVARCHAR(500) = ''
AS
BEGIN
    SET NOCOUNT ON;

    -- Verify doctor exists and is available
    IF NOT EXISTS (
        SELECT 1 FROM Doctors WHERE id = @doctorId AND available = 1
    )
    BEGIN
        SELECT -1 AS result, 'Doctor not found or not available' AS message;
        RETURN;
    END

    -- Verify patient account is active
    IF NOT EXISTS (
        SELECT 1 FROM Users
        WHERE id = @patientId AND role = 'patient' AND is_active = 1
    )
    BEGIN
        SELECT -2 AS result, 'Patient account not found or inactive' AS message;
        RETURN;
    END

    -- Check for time-slot conflict
    IF EXISTS (
        SELECT 1 FROM Appointments
        WHERE doctor_id        = @doctorId
          AND appointment_date = @date
          AND appointment_time = @time
          AND status NOT IN ('rejected')
    )
    BEGIN
        SELECT -3 AS result, 'This time slot is already booked' AS message;
        RETURN;
    END

    -- Insert and return new appointment ID
    INSERT INTO Appointments
        (doctor_id, patient_id, appointment_date, appointment_time, status, notes)
    VALUES
        (@doctorId, @patientId, @date, @time, 'pending', @notes);

    SELECT SCOPE_IDENTITY() AS result, 'Appointment booked successfully' AS message;
END;
GO

-- ── 5.2  Update appointment status
--  Used by: PATCH /api/appointments/:id/status
CREATE OR ALTER PROCEDURE sp_UpdateAppointmentStatus
    @appointmentId  INT,
    @newStatus      NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    IF @newStatus NOT IN ('pending','confirmed','rejected','completed')
    BEGIN
        SELECT 0 AS success, 'Invalid status value' AS message;
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM Appointments WHERE id = @appointmentId)
    BEGIN
        SELECT 0 AS success, 'Appointment not found' AS message;
        RETURN;
    END

    UPDATE Appointments
    SET    status = @newStatus
    WHERE  id = @appointmentId;

    SELECT 1 AS success, 'Status updated to ' + @newStatus AS message;
END;
GO

-- ── 5.3  Safe user deletion (prevents deleting admins or leaving orphan FK)
--  Used by: DELETE /api/users/:id
CREATE OR ALTER PROCEDURE sp_DeleteUser
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @role NVARCHAR(20);
    SELECT @role = role FROM Users WHERE id = @userId;

    IF @role IS NULL
    BEGIN
        SELECT 0 AS success, 'User not found' AS message;
        RETURN;
    END

    IF @role = 'admin'
    BEGIN
        SELECT 0 AS success, 'Cannot delete admin accounts' AS message;
        RETURN;
    END

    -- Delete patient appointments first to avoid FK_Appointments_Patients conflict
    -- (doctor appointments are handled by ON DELETE CASCADE via FK_Appointments_Doctors)
    IF @role = 'patient'
        DELETE FROM Appointments WHERE patient_id = @userId;

    -- Reviews are not cascade-deleted on the doctor relationship, so a doctor's
    -- received reviews must be removed explicitly before the user row (and its
    -- cascaded Doctors row) is deleted.
    IF @role = 'doctor'
    BEGIN
        DECLARE @docId INT;
        SELECT @docId = id FROM Doctors WHERE user_id = @userId;
        IF @docId IS NOT NULL
            DELETE FROM Reviews WHERE doctor_id = @docId;
    END

    DELETE FROM Users WHERE id = @userId;

    SELECT 1 AS success, 'User deleted successfully' AS message;
END;
GO

-- ── 5.4  Get single doctor by ID
--  Used by: GET /api/doctors/:id
CREATE OR ALTER PROCEDURE sp_GetDoctorById
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM vw_DoctorList WHERE id = @id;
END;
GO

PRINT 'Stored procedures created.';

-- ============================================================
-- STEP 6: Seed Data  (test accounts for development)
-- ============================================================

-- All passwords = "password123"
-- bcrypt hash (10 rounds) generated with:
--   node -e "require('bcryptjs').hash('password123',10).then(h=>console.log(h))"
-- Replace the hash below with a freshly generated one before demo.

DECLARE @hash NVARCHAR(255) = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

INSERT INTO Users (name, email, password, role) VALUES
-- Admin
(N'Admin User',        'admin@depi.com',    @hash, 'admin'),
-- Doctors
(N'Dr. Sarah Johnson', 'sarah@depi.com',    @hash, 'doctor'),
(N'Dr. Ahmed Hassan',  'ahmed@depi.com',    @hash, 'doctor'),
(N'Dr. Mona Khalil',   'mona@depi.com',     @hash, 'doctor'),
(N'Dr. Omar Farouk',   'omar@depi.com',     @hash, 'doctor'),
(N'Dr. Layla Mansour', 'layla@depi.com',    @hash, 'doctor'),
(N'Dr. Karim Nabil',   'karim@depi.com',    @hash, 'doctor'),
(N'Dr. Nadia Rizk',    'nadia@depi.com',    @hash, 'doctor'),
(N'Dr. Youssef Tamer', 'youssef@depi.com',  @hash, 'doctor'),
-- Patients
(N'John Patient',      'patient@depi.com',  @hash, 'patient'),
(N'Sara Ali',          'sara@depi.com',     @hash, 'patient'),
(N'Mohamed Kareem',    'mk@depi.com',       @hash, 'patient');
GO

-- Doctor profiles (user_id 2–9 are the doctors inserted above)
INSERT INTO Doctors
    (user_id, specialty, rating, reviews, experience, available, avatar, price, location, bio, schedule)
VALUES
(2,  N'Cardiology',    4.9, 238, 15, 1, N'👩‍⚕️', 150.00, N'Cairo Medical Center',    N'Specialist in cardiovascular diseases with 15 years of experience.',       N'Mon,Wed,Fri'),
(3,  N'Neurology',     4.8, 192, 12, 1, N'👨‍⚕️', 180.00, N'Nile Health Clinic',       N'Expert neurologist focusing on brain and nervous system disorders.',        N'Tue,Thu,Sat'),
(4,  N'Pediatrics',    4.9, 305, 10, 1, N'👩‍⚕️', 120.00, N'Children''s Hospital',     N'Dedicated pediatrician with a gentle approach for young patients.',         N'Mon,Tue,Thu'),
(5,  N'Orthopedics',   4.7, 156, 18, 0, N'👨‍⚕️', 200.00, N'Sports Medicine Center',  N'Orthopedic surgeon specializing in sports injuries and joint replacement.', N'Wed,Fri'),
(6,  N'Dermatology',   4.8, 274,  8, 1, N'👩‍⚕️', 130.00, N'Skin Care Clinic',         N'Dermatologist specializing in skin conditions and cosmetic procedures.',    N'Mon,Wed,Sat'),
(7,  N'Ophthalmology', 4.6, 143, 14, 1, N'👨‍⚕️', 140.00, N'Eye Care Center',          N'Eye specialist with expertise in cataract surgery and vision correction.',  N'Tue,Thu,Fri'),
(8,  N'Gynecology',    4.9, 321, 16, 1, N'👩‍⚕️', 160.00, N'Women''s Health Center',   N'Gynecologist providing comprehensive women''s health services.',            N'Mon,Wed,Thu'),
(9,  N'Psychiatry',    4.7, 198, 11, 0, N'👨‍⚕️', 170.00, N'Mental Wellness Clinic',   N'Psychiatrist dedicated to mental health and emotional wellbeing.',          N'Tue,Fri');
GO

-- Sample appointments
-- patient_id 10 = John, 11 = Sara, 12 = Mohamed
INSERT INTO Appointments
    (doctor_id, patient_id, appointment_date, appointment_time, status, notes)
VALUES
(1, 10, '2026-05-15', '10:00 AM', 'confirmed',  N'Chest pain follow-up'),
(2, 10, '2026-05-20', '02:00 PM', 'pending',    N'Headache and dizziness'),
(3, 11, '2026-05-18', '11:00 AM', 'completed',  N'Annual checkup for child'),
(5, 12, '2026-05-22', '03:00 PM', 'rejected',   N'Skin rash consultation'),
(1, 11, '2026-05-25', '09:00 AM', 'pending',    N'Blood pressure monitoring'),
(7, 10, '2026-05-28', '01:00 PM', 'confirmed',  N'Routine checkup'),
(2, 12, '2026-06-01', '10:00 AM', 'pending',    N'Migraine episodes'),
(4, 11, '2026-06-03', '02:00 PM', 'confirmed',  N'Sports knee injury review'),
(6, 10, '2026-06-05', '11:00 AM', 'pending',    N'Annual eye examination'),
(3, 12, '2026-06-08', '09:00 AM', 'completed',  N'Toddler vaccination follow-up');
GO

PRINT 'Seed data inserted.';

-- ============================================================
-- STEP 7: Reference Queries  (mirror every backend API route)
-- ============================================================

-- ── GET /api/doctors  (public – all doctors sorted by rating)
-- SELECT * FROM vw_DoctorList ORDER BY rating DESC;

-- ── GET /api/doctors/:id  (single doctor)
-- EXEC sp_GetDoctorById @id = 1;

-- ── GET /api/appointments  → patient view
-- SELECT * FROM vw_AppointmentDetails
-- WHERE patientId = <req.user.id>
-- ORDER BY [date] DESC;

-- ── GET /api/appointments  → doctor view
-- SELECT * FROM vw_AppointmentDetails
-- WHERE doctorId IN (SELECT id FROM Doctors WHERE user_id = <req.user.id>)
-- ORDER BY [date] DESC;

-- ── GET /api/appointments  → admin view (all)
-- SELECT * FROM vw_AppointmentDetails ORDER BY [date] DESC;

-- ── POST /api/appointments  (book new – conflict check included)
-- EXEC sp_BookAppointment
--     @doctorId  = 1,
--     @patientId = 10,
--     @date      = '2026-07-01',
--     @time      = '10:00 AM',
--     @notes     = N'First consultation';

-- ── PATCH /api/appointments/:id/status
-- EXEC sp_UpdateAppointmentStatus @appointmentId = 1, @newStatus = 'confirmed';

-- ── DELETE /api/appointments/:id
-- DELETE FROM Appointments WHERE id = <id>;

-- ── GET /api/users  (admin)
-- SELECT * FROM vw_UserList ORDER BY joined DESC;

-- ── GET /api/users/stats  (admin dashboard)
-- SELECT * FROM vw_AdminStats;

-- ── DELETE /api/users/:id  (admin – safe, handles FK)
-- EXEC sp_DeleteUser @userId = <id>;

-- ── POST /api/auth/register  – duplicate email check
-- SELECT id FROM Users WHERE email = @email;

-- ── POST /api/auth/login  – fetch user for password compare
-- SELECT id, name, email, password, role
-- FROM Users WHERE email = @email AND is_active = 1;

-- ── GET /api/auth/me  – current user
-- SELECT id, name, email, role, created_at FROM Users WHERE id = @id;

-- ── POST /api/doctors  – insert new doctor (after user is created)
-- INSERT INTO Doctors (user_id, specialty, experience, available, avatar, price, location, bio, schedule)
-- VALUES (@userId, @specialty, @experience, 1, @avatar, @price, @location, @bio, @schedule);

-- ── PUT /api/doctors/:id  – update doctor fields
-- UPDATE Doctors
-- SET specialty=@s, experience=@e, available=@a, avatar=@av,
--     price=@p, location=@l, bio=@b, schedule=@sc
-- WHERE id = @id;

-- ── DELETE /api/doctors/:id
-- DELETE FROM Doctors WHERE id = @id;

-- ============================================================
-- STEP 8: Useful Analytics Queries (Admin Dashboard extras)
-- ============================================================

-- 8.1  Top 5 most booked doctors
-- SELECT TOP 5
--     u.name AS doctorName, d.specialty,
--     COUNT(a.id) AS totalBookings,
--     SUM(CASE WHEN a.status='completed' THEN 1 ELSE 0 END) AS completed
-- FROM Doctors d
-- JOIN Users u ON d.user_id = u.id
-- LEFT JOIN Appointments a ON a.doctor_id = d.id
-- GROUP BY d.id, u.name, d.specialty
-- ORDER BY totalBookings DESC;

-- 8.2  Upcoming appointments (next 7 days)
-- SELECT * FROM vw_AppointmentDetails
-- WHERE [date] BETWEEN CAST(SYSDATETIME() AS DATE)
--               AND    CAST(DATEADD(DAY, 7, SYSDATETIME()) AS DATE)
--   AND status IN ('pending','confirmed')
-- ORDER BY [date], [time];

-- 8.3  Revenue per doctor (completed sessions)
-- SELECT u.name AS doctorName, d.specialty, d.price,
--        COUNT(a.id) AS completedSessions,
--        CAST(COUNT(a.id) * d.price AS DECIMAL(10,2)) AS totalRevenue
-- FROM Doctors d
-- JOIN Users u ON d.user_id = u.id
-- LEFT JOIN Appointments a ON a.doctor_id = d.id AND a.status = 'completed'
-- GROUP BY u.name, d.specialty, d.price
-- ORDER BY totalRevenue DESC;

-- 8.4  Booking distribution by specialty
-- SELECT d.specialty,
--        COUNT(a.id) AS totalBookings,
--        ROUND(100.0 * COUNT(a.id) / NULLIF(SUM(COUNT(a.id)) OVER(), 0), 1) AS percentage
-- FROM Appointments a
-- JOIN Doctors d ON a.doctor_id = d.id
-- GROUP BY d.specialty
-- ORDER BY totalBookings DESC;

-- ============================================================
-- STEP 9: Final verification
-- ============================================================
SELECT 'Users'        AS [Table], COUNT(*) AS [Rows] FROM Users
UNION ALL
SELECT 'Doctors',                  COUNT(*) FROM Doctors
UNION ALL
SELECT 'Appointments',             COUNT(*) FROM Appointments;

SELECT name AS [View]      FROM sys.views      ORDER BY name;
SELECT name AS [Procedure] FROM sys.procedures ORDER BY name;
GO

PRINT '============================================================';
PRINT '  [depi] database is ready!';
PRINT '  Next step: edit backend/.env and set your DB credentials.';
PRINT '============================================================';
