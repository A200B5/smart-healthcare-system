-- =========================================================================
-- DEPI Graduation Project | Smart Healthcare System
-- COMPLETE DATABASE BOOTSTRAP SCRIPT
-- =========================================================================
-- Execution Instructions:
-- 1. Ensure you are connected to an empty SQL Server database named 'depi'.
-- 2. Open this script in SQL Server Management Studio (SSMS) or Azure Data Studio.
-- 3. Run the entire script (F5). 
-- 4. The script will safely rebuild all schemas, constraints, views, stored procedures,
--    and inject fully working development seed data.
-- =========================================================================

USE [depi];
GO

PRINT '============================================================';
PRINT '  Phase 1: Safe Teardown (Idempotency)';
PRINT '============================================================';

-- Drop Foreign Keys if they exist to prevent drop errors
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) + 
               N' DROP CONSTRAINT ' + QUOTENAME(name) + N';' + CHAR(13)
FROM sys.foreign_keys;
EXEC sp_executesql @sql;
GO

-- Drop tables safely
IF OBJECT_ID('dbo.DoctorAvailability', 'U') IS NOT NULL DROP TABLE dbo.DoctorAvailability;
IF OBJECT_ID('dbo.Reviews', 'U') IS NOT NULL DROP TABLE dbo.Reviews;
IF OBJECT_ID('dbo.Appointments', 'U') IS NOT NULL DROP TABLE dbo.Appointments;
IF OBJECT_ID('dbo.Doctors', 'U') IS NOT NULL DROP TABLE dbo.Doctors;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;

-- Drop Views
IF OBJECT_ID('dbo.vw_DoctorAvailabilityDetails', 'V') IS NOT NULL DROP VIEW dbo.vw_DoctorAvailabilityDetails;
IF OBJECT_ID('dbo.vw_AdminStats', 'V') IS NOT NULL DROP VIEW dbo.vw_AdminStats;
IF OBJECT_ID('dbo.vw_UserList', 'V') IS NOT NULL DROP VIEW dbo.vw_UserList;
IF OBJECT_ID('dbo.vw_DoctorList', 'V') IS NOT NULL DROP VIEW dbo.vw_DoctorList;
IF OBJECT_ID('dbo.vw_AppointmentDetails', 'V') IS NOT NULL DROP VIEW dbo.vw_AppointmentDetails;

-- Drop Procedures
IF OBJECT_ID('dbo.sp_SetDoctorAvailability', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_SetDoctorAvailability;
IF OBJECT_ID('dbo.sp_GetDoctorAvailableSlots', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetDoctorAvailableSlots;
IF OBJECT_ID('dbo.sp_DeleteReview', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_DeleteReview;
IF OBJECT_ID('dbo.sp_CheckPatientReview', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_CheckPatientReview;
IF OBJECT_ID('dbo.sp_GetDoctorReviews', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetDoctorReviews;
IF OBJECT_ID('dbo.sp_AddReview', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_AddReview;
IF OBJECT_ID('dbo.sp_DeleteUser', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_DeleteUser;
IF OBJECT_ID('dbo.sp_UpdateAppointmentStatus', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_UpdateAppointmentStatus;
IF OBJECT_ID('dbo.sp_BookAppointment', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_BookAppointment;
IF OBJECT_ID('dbo.sp_GetDoctorById', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetDoctorById;
GO


PRINT '============================================================';
PRINT '  Phase 2: Table Creation';
PRINT '============================================================';

CREATE TABLE dbo.Users (
    id          INT            IDENTITY(1,1)   PRIMARY KEY,
    name        NVARCHAR(100)  NOT NULL,
    email       NVARCHAR(150)  NOT NULL        UNIQUE,
    password    NVARCHAR(255)  NOT NULL,
    role        NVARCHAR(20)   NOT NULL        CONSTRAINT CK_Users_Role CHECK (role IN ('patient', 'doctor', 'admin')),
    is_active   BIT            NOT NULL        DEFAULT 1,
    created_at  DATETIME2      NOT NULL        DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.Doctors (
    id                  INT            IDENTITY(1,1)   PRIMARY KEY,
    user_id             INT            NOT NULL        CONSTRAINT FK_Doctors_Users REFERENCES dbo.Users(id) ON DELETE CASCADE,
    specialty           NVARCHAR(100)  NOT NULL,
    rating              DECIMAL(3,1)   NOT NULL        DEFAULT 0.0 CONSTRAINT CK_Doctors_Rating CHECK (rating BETWEEN 0.0 AND 5.0),
    reviews             INT            NOT NULL        DEFAULT 0,
    experience          INT            NOT NULL        CONSTRAINT CK_Doctors_Exp CHECK (experience >= 0),
    available           BIT            NOT NULL        DEFAULT 1,
    avatar              NVARCHAR(20)   NOT NULL        DEFAULT N'👨‍⚕️',
    price               DECIMAL(10,2)  NOT NULL        CONSTRAINT CK_Doctors_Price CHECK (price >= 0),
    location            NVARCHAR(200)  NOT NULL,
    bio                 NVARCHAR(1000) NOT NULL        DEFAULT '',
    schedule            NVARCHAR(100)  NOT NULL        DEFAULT '',
    verification_status NVARCHAR(20)   NOT NULL        DEFAULT 'pending' CONSTRAINT CHK_Doctors_VerificationStatus CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    rejection_reason    NVARCHAR(500)  NULL,
    verified_at         DATETIME2      NULL,
    verified_by         INT            NULL            CONSTRAINT FK_Doctors_Users_VerifiedBy REFERENCES dbo.Users(id),
    license_number      NVARCHAR(20)   NULL            CONSTRAINT UQ_Doctors_LicenseNumber UNIQUE
);
GO

CREATE TABLE dbo.Appointments (
    id                INT            IDENTITY(1,1)   PRIMARY KEY,
    doctor_id         INT            NOT NULL        CONSTRAINT FK_Appointments_Doctors REFERENCES dbo.Doctors(id) ON DELETE CASCADE,
    patient_id        INT            NOT NULL        CONSTRAINT FK_Appointments_Patients REFERENCES dbo.Users(id),
    appointment_date  DATE           NOT NULL,
    appointment_time  TIME(0)        NOT NULL,
    status            NVARCHAR(20)   NOT NULL        DEFAULT 'pending' CONSTRAINT CK_Appointments_Status CHECK (status IN ('pending','confirmed','rejected','completed')),
    notes             NVARCHAR(500)  NOT NULL        DEFAULT '',
    created_at        DATETIME2      NOT NULL        DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.Reviews (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    patient_id  INT NOT NULL      CONSTRAINT FK_Reviews_Users REFERENCES dbo.Users(id) ON DELETE CASCADE,
    doctor_id   INT NOT NULL      CONSTRAINT FK_Reviews_Doctors REFERENCES dbo.Doctors(id) ON DELETE NO ACTION,
    rating      INT NOT NULL      CHECK (rating >= 1 AND rating <= 5),
    comment     NVARCHAR(1000) NULL,
    created_at  DATETIME          DEFAULT GETDATE()
);
GO

CREATE TABLE dbo.DoctorAvailability (
    id                    INT IDENTITY(1,1) PRIMARY KEY,
    doctor_id             INT NOT NULL      CONSTRAINT FK_DoctorAvailability_Doctors REFERENCES dbo.Doctors(id) ON DELETE CASCADE,
    day_of_week           INT NOT NULL      CHECK (day_of_week >= 1 AND day_of_week <= 7),
    start_time            TIME(0) NOT NULL,
    end_time              TIME(0) NOT NULL,
    is_available          BIT NOT NULL      DEFAULT 1,
    slot_duration_minutes INT NOT NULL      DEFAULT 30,
    CONSTRAINT UQ_DoctorAvailability_Day UNIQUE (doctor_id, day_of_week)
);
GO


PRINT '============================================================';
PRINT '  Phase 3: Indexes';
PRINT '============================================================';

CREATE INDEX IX_Appointments_PatientId ON dbo.Appointments (patient_id);
CREATE INDEX IX_Appointments_DoctorId  ON dbo.Appointments (doctor_id);
CREATE INDEX IX_Appointments_Date      ON dbo.Appointments (appointment_date);
CREATE INDEX IX_Appointments_Status    ON dbo.Appointments (status);
CREATE INDEX IX_Doctors_Specialty      ON dbo.Doctors (specialty);
CREATE INDEX IX_Doctors_Available      ON dbo.Doctors (available);
CREATE INDEX IX_Users_Email            ON dbo.Users (email);
CREATE INDEX IX_Users_Role             ON dbo.Users (role);
CREATE INDEX idx_Reviews_DoctorId      ON dbo.Reviews (doctor_id);
CREATE INDEX idx_Reviews_PatientId     ON dbo.Reviews (patient_id);
GO


PRINT '============================================================';
PRINT '  Phase 4: Views';
PRINT '============================================================';

CREATE OR ALTER VIEW dbo.vw_AppointmentDetails AS
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
    CONVERT(VARCHAR(5), a.appointment_time, 108)  AS [time],
    a.status,
    a.notes,
    CONVERT(VARCHAR(19), a.created_at, 120)       AS createdAt
FROM  dbo.Appointments a
JOIN  dbo.Doctors d      ON a.doctor_id  = d.id
JOIN  dbo.Users   u_doc  ON d.user_id    = u_doc.id
JOIN  dbo.Users   u_pat  ON a.patient_id = u_pat.id;
GO

CREATE OR ALTER VIEW dbo.vw_DoctorList AS
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
    d.schedule,
    d.verification_status,
    d.license_number,
    d.verified_at,
    u.created_at AS createdAt
FROM  dbo.Doctors d
JOIN  dbo.Users   u ON d.user_id = u.id
WHERE u.is_active = 1 AND d.verification_status = 'approved';
GO

CREATE OR ALTER VIEW dbo.vw_UserList AS
SELECT
    u.id,
    u.name,
    u.email,
    u.role,
    u.is_active                                   AS isActive,
    CONVERT(VARCHAR(10), u.created_at, 23)        AS joined,
    COUNT(a.id)                                   AS appointments
FROM  dbo.Users u
LEFT JOIN dbo.Appointments a ON u.id = a.patient_id
GROUP BY u.id, u.name, u.email, u.role, u.is_active, u.created_at;
GO

CREATE OR ALTER VIEW dbo.vw_AdminStats AS
SELECT
    (SELECT COUNT(*) FROM dbo.Users)                                             AS totalUsers,
    (SELECT COUNT(*) FROM dbo.Users  WHERE role = 'patient')                     AS totalPatients,
    (SELECT COUNT(*) FROM dbo.Users  WHERE role = 'doctor')                      AS totalDoctors,
    (SELECT COUNT(*) FROM dbo.Doctors)                                           AS totalDoctorProfiles,
    (SELECT COUNT(*) FROM dbo.Doctors WHERE available = 1)                       AS availableDoctors,
    (SELECT COUNT(*) FROM dbo.Appointments)                                      AS totalAppointments,
    (SELECT COUNT(*) FROM dbo.Appointments WHERE status = 'pending')             AS pendingAppointments,
    (SELECT COUNT(*) FROM dbo.Appointments WHERE status = 'confirmed')           AS confirmedAppointments,
    (SELECT COUNT(*) FROM dbo.Appointments WHERE status = 'completed')           AS completedAppointments,
    (SELECT COUNT(*) FROM dbo.Appointments WHERE status = 'rejected')            AS rejectedAppointments,
    (SELECT COUNT(*) FROM dbo.Appointments
     WHERE CAST(created_at AS DATE) = CAST(SYSDATETIME() AS DATE))               AS todayAppointments;
GO

CREATE OR ALTER VIEW dbo.vw_DoctorAvailabilityDetails AS
SELECT 
    da.id,
    da.doctor_id,
    u.name AS doctorName,
    d.specialty,
    da.day_of_week,
    CHOOSE(da.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') AS dayName,
    CONVERT(VARCHAR(5), da.start_time, 108) AS startTime,
    CONVERT(VARCHAR(5), da.end_time, 108) AS endTime,
    da.is_available,
    da.slot_duration_minutes
FROM 
    dbo.DoctorAvailability da
INNER JOIN 
    dbo.Doctors d ON da.doctor_id = d.id
INNER JOIN 
    dbo.Users u ON d.user_id = u.id;
GO


PRINT '============================================================';
PRINT '  Phase 5: Stored Procedures';
PRINT '============================================================';

CREATE OR ALTER PROCEDURE dbo.sp_GetDoctorById
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM dbo.vw_DoctorList WHERE id = @id;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_BookAppointment
    @doctorId   INT,
    @patientId  INT,
    @date       DATE,
    @time       NVARCHAR(20),
    @notes      NVARCHAR(500) = ''
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM dbo.Doctors WHERE id = @doctorId AND available = 1)
    BEGIN
        SELECT -1 AS result, 'Doctor not found or not available' AS message; RETURN;
    END
    IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE id = @patientId AND role = 'patient' AND is_active = 1)
    BEGIN
        SELECT -2 AS result, 'Patient account not found or inactive' AS message; RETURN;
    END
    IF EXISTS (SELECT 1 FROM dbo.Appointments WHERE doctor_id = @doctorId AND appointment_date = @date AND appointment_time = @time AND status NOT IN ('rejected'))
    BEGIN
        SELECT -3 AS result, 'This time slot is already booked' AS message; RETURN;
    END

    INSERT INTO dbo.Appointments (doctor_id, patient_id, appointment_date, appointment_time, status, notes)
    VALUES (@doctorId, @patientId, @date, @time, 'pending', @notes);

    SELECT SCOPE_IDENTITY() AS result, 'Appointment booked successfully' AS message;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_UpdateAppointmentStatus
    @appointmentId  INT,
    @newStatus      NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    IF @newStatus NOT IN ('pending','confirmed','rejected','completed')
    BEGIN
        SELECT 0 AS success, 'Invalid status value' AS message; RETURN;
    END
    IF NOT EXISTS (SELECT 1 FROM dbo.Appointments WHERE id = @appointmentId)
    BEGIN
        SELECT 0 AS success, 'Appointment not found' AS message; RETURN;
    END

    UPDATE dbo.Appointments SET status = @newStatus WHERE id = @appointmentId;
    SELECT 1 AS success, 'Status updated to ' + @newStatus AS message;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_AddReview
    @patientId INT,
    @doctorId INT,
    @rating INT,
    @comment NVARCHAR(1000)
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS(SELECT 1 FROM dbo.Doctors WHERE id = @doctorId)
    BEGIN
        SELECT -2 AS success, 'Doctor not found' AS message; RETURN;
    END
    IF EXISTS(SELECT 1 FROM dbo.Reviews WHERE patient_id = @patientId AND doctor_id = @doctorId)
    BEGIN
        SELECT -3 AS success, 'You have already reviewed this doctor' AS message; RETURN;
    END
    IF NOT EXISTS(SELECT 1 FROM dbo.Appointments WHERE patient_id = @patientId AND doctor_id = @doctorId AND status = 'completed')
    BEGIN
        SELECT -4 AS success, 'You can only review doctors after a completed appointment' AS message; RETURN;
    END

    INSERT INTO dbo.Reviews (patient_id, doctor_id, rating, comment)
    VALUES (@patientId, @doctorId, @rating, @comment);
    
    DECLARE @newId INT = SCOPE_IDENTITY();
    
    UPDATE dbo.Doctors
    SET reviews = (SELECT COUNT(*) FROM dbo.Reviews WHERE doctor_id = @doctorId),
        rating = ISNULL((SELECT CAST(AVG(CAST(rating AS DECIMAL(10,2))) AS DECIMAL(10,1)) FROM dbo.Reviews WHERE doctor_id = @doctorId), 0.0)
    WHERE id = @doctorId;

    SELECT @newId AS success, 'Review submitted successfully' AS message;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetDoctorReviews
    @doctorId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        r.id, r.patient_id, u.name AS patientName, r.rating, r.comment, r.created_at AS createdAt,
        DATEDIFF(day, r.created_at, GETDATE()) AS daysAgo
    FROM dbo.Reviews r
    INNER JOIN dbo.Users u ON r.patient_id = u.id
    WHERE r.doctor_id = @doctorId
    ORDER BY r.created_at DESC;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_CheckPatientReview
    @patientId INT,
    @doctorId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, rating, comment, created_at AS createdAt
    FROM dbo.Reviews
    WHERE patient_id = @patientId AND doctor_id = @doctorId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_DeleteReview
    @reviewId INT,
    @requesterRole NVARCHAR(50),
    @requesterId INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @doctorId INT;
    SELECT @doctorId = doctor_id FROM dbo.Reviews WHERE id = @reviewId;

    IF @doctorId IS NULL
    BEGIN
        SELECT 0 AS success, 'Review not found' AS message; RETURN;
    END

    DELETE FROM dbo.Reviews WHERE id = @reviewId;
    
    UPDATE dbo.Doctors
    SET reviews = (SELECT COUNT(*) FROM dbo.Reviews WHERE doctor_id = @doctorId),
        rating = ISNULL((SELECT CAST(AVG(CAST(rating AS DECIMAL(10,2))) AS DECIMAL(10,1)) FROM dbo.Reviews WHERE doctor_id = @doctorId), 0.0)
    WHERE id = @doctorId;

    SELECT 1 AS success, 'Review deleted successfully' AS message;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_SetDoctorAvailability
    @doctorId INT,
    @dayOfWeek INT,
    @startTime NVARCHAR(10),
    @endTime NVARCHAR(10),
    @isAvailable BIT,
    @slotDurationMinutes INT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS(SELECT 1 FROM dbo.DoctorAvailability WHERE doctor_id = @doctorId AND day_of_week = @dayOfWeek)
    BEGIN
        UPDATE dbo.DoctorAvailability
        SET start_time = CAST(@startTime AS TIME), end_time = CAST(@endTime AS TIME),
            is_available = @isAvailable, slot_duration_minutes = @slotDurationMinutes
        WHERE doctor_id = @doctorId AND day_of_week = @dayOfWeek;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.DoctorAvailability (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes)
        VALUES (@doctorId, @dayOfWeek, CAST(@startTime AS TIME), CAST(@endTime AS TIME), @isAvailable, @slotDurationMinutes);
    END
    SELECT 1 AS success, 'Availability updated successfully' AS message;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_GetDoctorAvailableSlots
    @doctorId INT,
    @date DATE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @dayOfWeek INT = ((DATEPART(dw, @date) + @@DATEFIRST - 2) % 7) + 1;
    DECLARE @startTime TIME, @endTime TIME, @isAvailable BIT, @slotDuration INT;
    
    SELECT @startTime = start_time, @endTime = end_time, @isAvailable = is_available, @slotDuration = slot_duration_minutes
    FROM dbo.DoctorAvailability
    WHERE doctor_id = @doctorId AND day_of_week = @dayOfWeek;
    
    DECLARE @Slots TABLE (availableSlot VARCHAR(5), isBooked BIT);
    
    IF @isAvailable = 1 AND @slotDuration > 0
    BEGIN
        DECLARE @currentSlot TIME = @startTime;
        WHILE @currentSlot < @endTime
        BEGIN
            DECLARE @slotStr VARCHAR(5) = CONVERT(VARCHAR(5), @currentSlot, 108);
            DECLARE @booked BIT = 0;
            IF EXISTS(SELECT 1 FROM dbo.Appointments WHERE doctor_id = @doctorId AND appointment_date = @date AND appointment_time = @slotStr AND status IN ('pending', 'confirmed'))
            BEGIN
                SET @booked = 1;
            END
            INSERT INTO @Slots (availableSlot, isBooked) VALUES (@slotStr, @booked);
            SET @currentSlot = DATEADD(minute, @slotDuration, @currentSlot);
        END
    END
    SELECT * FROM @Slots;
END
GO


PRINT '============================================================';
PRINT '  Phase 6: Seed Development Data';
PRINT '============================================================';

-- Empty the tables and reseed identity so we can hardcode deterministic references.
DELETE FROM dbo.Appointments;
DELETE FROM dbo.Reviews;
DELETE FROM dbo.DoctorAvailability;
DELETE FROM dbo.Doctors;
DELETE FROM dbo.Users;

DBCC CHECKIDENT ('dbo.Users', RESEED, 0);
DBCC CHECKIDENT ('dbo.Doctors', RESEED, 0);
DBCC CHECKIDENT ('dbo.Appointments', RESEED, 0);
DBCC CHECKIDENT ('dbo.Reviews', RESEED, 0);
DBCC CHECKIDENT ('dbo.DoctorAvailability', RESEED, 0);
GO

DECLARE @adminHash NVARCHAR(255) = '$2a$10$Tp0gHoJgqP3kH9xphNxcKeIqAUt9rhQoMxHy/VXDAWML7dL1EQVOi'; -- Admin@2026_Secure!
DECLARE @userHash NVARCHAR(255)  = '$2a$10$1sTlLUeYbxPkXysUgDHEVeA3/Xoz7jVUam4ggm8NWCqsKJWxLF7E.'; -- 123456

INSERT INTO dbo.Users (name, email, password, role, is_active) VALUES
(N'Admin User',        'admin@depi.com',       @adminHash, 'admin',   1),   -- ID 1
(N'Dr. Sabry',         'sabry8818@gmail.com',  @userHash,  'doctor',  1),   -- ID 2
(N'Dr. Ahmed Hassan',  'ahmed@depi.com',       @userHash,  'doctor',  1),   -- ID 3
(N'Dr. Mona Khalil',   'mona@depi.com',        @userHash,  'doctor',  1),   -- ID 4
(N'Dr. Omar Farouk',   'omar@depi.com',        @userHash,  'doctor',  1),   -- ID 5
(N'John Patient',      'ab163545@gmail.com',   @userHash,  'patient', 1),   -- ID 6
(N'Sara Ali',          'sara@depi.com',        @userHash,  'patient', 1),   -- ID 7
(N'Mohamed Kareem',    'mk@depi.com',          @userHash,  'patient', 1);   -- ID 8

INSERT INTO dbo.Doctors 
    (user_id, specialty, rating, reviews, experience, available, avatar, price, location, bio, schedule, verification_status, license_number, verified_by, verified_at, rejection_reason) 
VALUES
(2, N'Cardiology',    4.9, 238, 15, 1, N'👨‍⚕️', 150.00, N'Cairo Medical Center', N'Specialist in cardiovascular diseases with 15 years of experience.', N'Mon,Wed,Fri', 'approved', 'DOC-2026-1001', 1, GETDATE(), NULL), -- ID 1
(3, N'Neurology',     4.8, 192, 12, 1, N'👨‍⚕️', 180.00, N'Nile Health Clinic', N'Expert neurologist focusing on brain and nervous system disorders.', N'Tue,Thu,Sat', 'pending', 'DOC-2026-1002', NULL, NULL, NULL), -- ID 2
(4, N'Pediatrics',    4.9, 305, 10, 1, N'👩‍⚕️', 120.00, N'Children''s Hospital', N'Dedicated pediatrician with a gentle approach for young patients.', N'Mon,Tue,Thu', 'approved', 'DOC-2026-1003', 1, GETDATE(), NULL), -- ID 3
(5, N'Orthopedics',   0.0, 0,   18, 0, N'👨‍⚕️', 200.00, N'Sports Medicine Center', N'Orthopedic surgeon specializing in sports injuries and joint replacement.', N'', 'rejected', 'DOC-2026-1004', 1, GETDATE(), 'License number is invalid.'); -- ID 4

INSERT INTO dbo.DoctorAvailability (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes) VALUES
(1, 2, '09:00', '17:00', 1, 30),
(1, 4, '09:00', '17:00', 1, 30),
(1, 6, '09:00', '13:00', 1, 30),
(3, 2, '10:00', '18:00', 1, 30),
(3, 3, '10:00', '18:00', 1, 30),
(3, 5, '10:00', '18:00', 1, 30);

INSERT INTO dbo.Appointments (doctor_id, patient_id, appointment_date, appointment_time, status, notes) VALUES
(1, 6, CAST(GETDATE() + 2 AS DATE), '10:00:00', 'confirmed', N'Chest pain follow-up'),
(2, 6, CAST(GETDATE() + 5 AS DATE), '14:00:00', 'pending',   N'Headache and dizziness'),
(3, 7, CAST(GETDATE() - 2 AS DATE), '11:00:00', 'completed', N'Annual checkup for child'),
(4, 8, CAST(GETDATE() + 7 AS DATE), '15:00:00', 'rejected',  N'Sports knee injury review'),
(1, 7, CAST(GETDATE() + 10 AS DATE),'09:00:00', 'pending',   N'Blood pressure monitoring'),
(3, 8, CAST(GETDATE() - 10 AS DATE),'09:00:00', 'completed', N'Toddler vaccination follow-up');

INSERT INTO dbo.Reviews (patient_id, doctor_id, rating, comment) VALUES
(7, 3, 5, N'Dr. Mona was absolutely wonderful with my child. Very patient and clear.'),
(8, 3, 5, N'Excellent doctor. Highly recommended.');
GO


PRINT '============================================================';
PRINT '  Phase 7: Verification Queries';
PRINT '============================================================';

SELECT 'Users'        AS [Table], COUNT(*) AS [Rows] FROM dbo.Users
UNION ALL
SELECT 'Doctors',                  COUNT(*) FROM dbo.Doctors
UNION ALL
SELECT 'Appointments',             COUNT(*) FROM dbo.Appointments
UNION ALL
SELECT 'Reviews',                  COUNT(*) FROM dbo.Reviews
UNION ALL
SELECT 'DoctorAvailability',       COUNT(*) FROM dbo.DoctorAvailability;

SELECT name AS [View]      FROM sys.views      ORDER BY name;
SELECT name AS [Procedure] FROM sys.procedures ORDER BY name;

PRINT '============================================================';
PRINT '  Bootstrap complete! System ready for use.';
PRINT '============================================================';
GO
