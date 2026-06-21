-- ============================================================
--   DEPI Healthcare System | Doctor Availability Migration
--   Adds proper doctor availability scheduling system
--   Run this after the initial depi_database.sql setup
-- ============================================================

USE depi;
GO

PRINT '============================================================';
PRINT '  Adding Doctor Availability System...';
PRINT '============================================================';
GO

-- ============================================================
-- STEP 1: Create DoctorAvailability Table
-- ============================================================

CREATE TABLE DoctorAvailability (
    id                      INT            IDENTITY(1,1)   PRIMARY KEY,
    doctor_id               INT            NOT NULL
                                CONSTRAINT FK_DoctorAvailability_Doctors
                                REFERENCES Doctors(id) ON DELETE CASCADE,
    day_of_week             INT            NOT NULL
                                CONSTRAINT CK_DayOfWeek CHECK (day_of_week BETWEEN 0 AND 6),
    -- 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday,
    -- 4 = Thursday, 5 = Friday, 6 = Saturday
    start_time              TIME(0)        NOT NULL,  -- e.g., 09:00
    end_time                TIME(0)        NOT NULL,  -- e.g., 17:00
    is_available            BIT            NOT NULL   DEFAULT 1,
    slot_duration_minutes   INT            NOT NULL   DEFAULT 30
                                CONSTRAINT CK_SlotDuration CHECK (slot_duration_minutes BETWEEN 15 AND 480),
    created_at              DATETIME2      NOT NULL   DEFAULT SYSDATETIME(),
    updated_at              DATETIME2      NOT NULL   DEFAULT SYSDATETIME()
);
GO

PRINT 'DoctorAvailability table created.';
GO

-- ============================================================
-- STEP 2: Create Indexes for Performance
-- ============================================================

CREATE INDEX IX_DoctorAvailability_DoctorId       ON DoctorAvailability (doctor_id);
CREATE INDEX IX_DoctorAvailability_DayOfWeek      ON DoctorAvailability (day_of_week);
CREATE INDEX IX_DoctorAvailability_IsAvailable   ON DoctorAvailability (is_available);
CREATE UNIQUE INDEX UX_DoctorAvailability_Unique ON DoctorAvailability (doctor_id, day_of_week);
GO

PRINT 'Indexes created.';
GO

-- ============================================================
-- STEP 3: Populate DoctorAvailability from existing schedule
-- ============================================================

-- Map existing schedule strings to DoctorAvailability
-- Existing schedules: 'Mon,Wed,Fri', 'Tue,Thu,Sat', etc.
-- We'll create default 9 AM - 5 PM (30-min slots) for now

INSERT INTO DoctorAvailability (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes)
SELECT
    d.id,
    CASE
        WHEN schedule LIKE '%Mon%' THEN 1
        WHEN schedule LIKE '%Tue%' THEN 2
        WHEN schedule LIKE '%Wed%' THEN 3
        WHEN schedule LIKE '%Thu%' THEN 4
        WHEN schedule LIKE '%Fri%' THEN 5
        WHEN schedule LIKE '%Sat%' THEN 6
        WHEN schedule LIKE '%Sun%' THEN 0
    END AS day_of_week,
    CAST('09:00' AS TIME(0)) AS start_time,
    CAST('17:00' AS TIME(0)) AS end_time,
    1 AS is_available,
    30 AS slot_duration_minutes
FROM Doctors d
WHERE CASE
    WHEN schedule LIKE '%Mon%' THEN 1
    WHEN schedule LIKE '%Tue%' THEN 2
    WHEN schedule LIKE '%Wed%' THEN 3
    WHEN schedule LIKE '%Thu%' THEN 4
    WHEN schedule LIKE '%Fri%' THEN 5
    WHEN schedule LIKE '%Sat%' THEN 6
    WHEN schedule LIKE '%Sun%' THEN 0
END IS NOT NULL;
GO

-- Handle schedules with multiple days (comma-separated)
-- First, create a helper to split the schedule string
DECLARE @doctorId INT;
DECLARE @schedule NVARCHAR(100);
DECLARE @dayString NVARCHAR(10);
DECLARE @dayOfWeek INT;

DECLARE doctor_cursor CURSOR FOR
    SELECT id, schedule FROM Doctors WHERE schedule IS NOT NULL AND schedule <> '';

OPEN doctor_cursor;
FETCH NEXT FROM doctor_cursor INTO @doctorId, @schedule;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Parse each day from the comma-separated list
    IF CHARINDEX('Mon', @schedule) > 0
        INSERT INTO DoctorAvailability (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes)
        SELECT @doctorId, 1, '09:00', '17:00', 1, 30
        WHERE NOT EXISTS (SELECT 1 FROM DoctorAvailability WHERE doctor_id = @doctorId AND day_of_week = 1);

    IF CHARINDEX('Tue', @schedule) > 0
        INSERT INTO DoctorAvailability (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes)
        SELECT @doctorId, 2, '09:00', '17:00', 1, 30
        WHERE NOT EXISTS (SELECT 1 FROM DoctorAvailability WHERE doctor_id = @doctorId AND day_of_week = 2);

    IF CHARINDEX('Wed', @schedule) > 0
        INSERT INTO DoctorAvailability (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes)
        SELECT @doctorId, 3, '09:00', '17:00', 1, 30
        WHERE NOT EXISTS (SELECT 1 FROM DoctorAvailability WHERE doctor_id = @doctorId AND day_of_week = 3);

    IF CHARINDEX('Thu', @schedule) > 0
        INSERT INTO DoctorAvailability (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes)
        SELECT @doctorId, 4, '09:00', '17:00', 1, 30
        WHERE NOT EXISTS (SELECT 1 FROM DoctorAvailability WHERE doctor_id = @doctorId AND day_of_week = 4);

    IF CHARINDEX('Fri', @schedule) > 0
        INSERT INTO DoctorAvailability (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes)
        SELECT @doctorId, 5, '09:00', '17:00', 1, 30
        WHERE NOT EXISTS (SELECT 1 FROM DoctorAvailability WHERE doctor_id = @doctorId AND day_of_week = 5);

    IF CHARINDEX('Sat', @schedule) > 0
        INSERT INTO DoctorAvailability (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes)
        SELECT @doctorId, 6, '09:00', '17:00', 1, 30
        WHERE NOT EXISTS (SELECT 1 FROM DoctorAvailability WHERE doctor_id = @doctorId AND day_of_week = 6);

    IF CHARINDEX('Sun', @schedule) > 0
        INSERT INTO DoctorAvailability (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes)
        SELECT @doctorId, 0, '09:00', '17:00', 1, 30
        WHERE NOT EXISTS (SELECT 1 FROM DoctorAvailability WHERE doctor_id = @doctorId AND day_of_week = 0);

    FETCH NEXT FROM doctor_cursor INTO @doctorId, @schedule;
END

CLOSE doctor_cursor;
DEALLOCATE doctor_cursor;
GO

PRINT 'DoctorAvailability seeded from existing schedules.';
GO

-- ============================================================
-- STEP 4: Create Helper View for Day Names
-- ============================================================

CREATE OR ALTER VIEW vw_DoctorAvailabilityDetails AS
SELECT
    da.id,
    da.doctor_id,
    u.name AS doctorName,
    d.specialty,
    CASE da.day_of_week
        WHEN 0 THEN 'Sunday'
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday'
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
    END AS dayName,
    da.day_of_week,
    CONVERT(VARCHAR(5), da.start_time, 108) AS startTime,
    CONVERT(VARCHAR(5), da.end_time, 108) AS endTime,
    da.is_available,
    da.slot_duration_minutes,
    CONVERT(VARCHAR(19), da.created_at, 120) AS createdAt,
    CONVERT(VARCHAR(19), da.updated_at, 120) AS updatedAt
FROM DoctorAvailability da
JOIN Doctors d ON da.doctor_id = d.id
JOIN Users u ON d.user_id = u.id;
GO

PRINT 'View vw_DoctorAvailabilityDetails created.';
GO

-- ============================================================
-- STEP 5: Update sp_BookAppointment to validate availability
-- ============================================================

CREATE OR ALTER PROCEDURE sp_BookAppointment
    @doctorId   INT,
    @patientId  INT,
    @date       DATE,
    @time       NVARCHAR(20),  -- e.g., '10:00 AM' or '10:00'
    @notes      NVARCHAR(500) = ''
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @dayOfWeek INT;
    DECLARE @appointmentTime TIME(0);
    DECLARE @availabilityExists BIT;

    -- Verify doctor exists and is available globally
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

    -- Parse the appointment date to get day of week
    -- DATEPART: 1=Sunday, 2=Monday, ..., 7=Saturday
    -- Convert to 0=Sunday, 1=Monday, ..., 6=Saturday
    SET @dayOfWeek = (DATEPART(WEEKDAY, @date) - 1) % 7;

    -- Convert time string to TIME format
    -- Handle both '10:00 AM' and '10:00' formats
    BEGIN TRY
        IF @time LIKE '%AM' OR @time LIKE '%PM'
        BEGIN
            -- Parse 12-hour format with AM/PM
            SET @appointmentTime = CONVERT(TIME(0), @time, 100);
        END
        ELSE
        BEGIN
            -- Parse 24-hour format
            SET @appointmentTime = CONVERT(TIME(0), @time);
        END
    END TRY
    BEGIN CATCH
        SELECT -4 AS result, 'Invalid time format. Use HH:MM or HH:MM AM/PM' AS message;
        RETURN;
    END

    -- Check if doctor is available on this day of week and time slot
    SET @availabilityExists = (
        SELECT CASE
            WHEN EXISTS (
                SELECT 1 FROM DoctorAvailability
                WHERE doctor_id = @doctorId
                  AND day_of_week = @dayOfWeek
                  AND is_available = 1
                  AND @appointmentTime >= start_time
                  AND @appointmentTime < end_time
            ) THEN 1
            ELSE 0
        END
    );

    IF @availabilityExists = 0
    BEGIN
        SELECT -5 AS result, 'Doctor is not available at this date and time' AS message;
        RETURN;
    END

    -- Check for time-slot conflict (existing appointments at same time)
    IF EXISTS (
        SELECT 1 FROM Appointments
        WHERE doctor_id        = @doctorId
          AND appointment_date = @date
          AND appointment_time = @appointmentTime   -- compare against the parsed TIME value
          AND status NOT IN ('rejected')
    )
    BEGIN
        SELECT -3 AS result, 'This time slot is already booked' AS message;
        RETURN;
    END

    -- All validations passed – insert the appointment
    INSERT INTO Appointments
        (doctor_id, patient_id, appointment_date, appointment_time, status, notes)
    VALUES
        (@doctorId, @patientId, @date, @appointmentTime, 'pending', @notes);  -- persist the parsed TIME value

    SELECT SCOPE_IDENTITY() AS result, 'Appointment booked successfully' AS message;
END;
GO

PRINT 'Stored procedure sp_BookAppointment updated with availability validation.';
GO

-- ============================================================
-- STEP 6: Create new stored procedure to get available slots
-- ============================================================

CREATE OR ALTER PROCEDURE sp_GetDoctorAvailableSlots
    @doctorId   INT,
    @date       DATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @dayOfWeek INT;
    DECLARE @startTime TIME(0);
    DECLARE @endTime TIME(0);
    DECLARE @slotDuration INT;
    DECLARE @currentSlot TIME(0);

    -- Get day of week for the requested date
    SET @dayOfWeek = (DATEPART(WEEKDAY, @date) - 1) % 7;

    -- Get doctor's availability for this day
    SELECT TOP 1
        @startTime = start_time,
        @endTime = end_time,
        @slotDuration = slot_duration_minutes
    FROM DoctorAvailability
    WHERE doctor_id = @doctorId
      AND day_of_week = @dayOfWeek
      AND is_available = 1;

    -- If no availability found, return empty result
    IF @startTime IS NULL
    BEGIN
        SELECT NULL AS availableSlot WHERE 1 = 0;  -- Return empty result set
        RETURN;
    END

    -- Generate available time slots and check for conflicts
    DECLARE @slots TABLE (slotTime TIME(0), isBooked BIT);

    SET @currentSlot = @startTime;

    WHILE @currentSlot < @endTime
    BEGIN
        DECLARE @isBooked BIT = 0;

        -- Check if this slot is already booked
        IF EXISTS (
            SELECT 1 FROM Appointments
            WHERE doctor_id = @doctorId
              AND appointment_date = @date
              AND appointment_time = FORMAT(@currentSlot, 'HH:mm')
              AND status NOT IN ('rejected')
        )
        BEGIN
            SET @isBooked = 1;
        END

        INSERT INTO @slots (slotTime, isBooked) VALUES (@currentSlot, @isBooked);

        SET @currentSlot = DATEADD(MINUTE, @slotDuration, @currentSlot);
    END

    -- Return only available slots
    SELECT
        CONVERT(VARCHAR(5), slotTime, 108) AS availableSlot,
        isBooked
    FROM @slots
    WHERE isBooked = 0
    ORDER BY slotTime;
END;
GO

PRINT 'Stored procedure sp_GetDoctorAvailableSlots created.';
GO

-- ============================================================
-- STEP 7: Create procedure to manage doctor availability
-- ============================================================

CREATE OR ALTER PROCEDURE sp_SetDoctorAvailability
    @doctorId               INT,
    @dayOfWeek              INT,  -- 0-6, Sunday to Saturday
    @startTime              NVARCHAR(5),  -- HH:MM format
    @endTime                NVARCHAR(5),  -- HH:MM format
    @isAvailable            BIT = 1,
    @slotDurationMinutes    INT = 30
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @startTimeValue TIME(0);
    DECLARE @endTimeValue TIME(0);

    -- Validate inputs
    IF @dayOfWeek NOT BETWEEN 0 AND 6
    BEGIN
        SELECT 0 AS success, 'Invalid day of week (must be 0-6)' AS message;
        RETURN;
    END

    IF @slotDurationMinutes NOT BETWEEN 15 AND 480
    BEGIN
        SELECT 0 AS success, 'Slot duration must be between 15 and 480 minutes' AS message;
        RETURN;
    END

    -- Parse times
    BEGIN TRY
        SET @startTimeValue = CONVERT(TIME(0), @startTime);
        SET @endTimeValue = CONVERT(TIME(0), @endTime);
    END TRY
    BEGIN CATCH
        SELECT 0 AS success, 'Invalid time format (use HH:MM)' AS message;
        RETURN;
    END

    -- Validate time range
    IF @startTimeValue >= @endTimeValue
    BEGIN
        SELECT 0 AS success, 'Start time must be before end time' AS message;
        RETURN;
    END

    -- Check if doctor exists
    IF NOT EXISTS (SELECT 1 FROM Doctors WHERE id = @doctorId)
    BEGIN
        SELECT 0 AS success, 'Doctor not found' AS message;
        RETURN;
    END

    -- Upsert availability (update if exists, insert if not)
    IF EXISTS (
        SELECT 1 FROM DoctorAvailability
        WHERE doctor_id = @doctorId AND day_of_week = @dayOfWeek
    )
    BEGIN
        UPDATE DoctorAvailability
        SET start_time = @startTimeValue,
            end_time = @endTimeValue,
            is_available = @isAvailable,
            slot_duration_minutes = @slotDurationMinutes,
            updated_at = SYSDATETIME()
        WHERE doctor_id = @doctorId AND day_of_week = @dayOfWeek;
    END
    ELSE
    BEGIN
        INSERT INTO DoctorAvailability
            (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes)
        VALUES
            (@doctorId, @dayOfWeek, @startTimeValue, @endTimeValue, @isAvailable, @slotDurationMinutes);
    END

    SELECT 1 AS success, 'Doctor availability updated successfully' AS message;
END;
GO

PRINT 'Stored procedure sp_SetDoctorAvailability created.';
GO

-- ============================================================
-- STEP 8: Verification
-- ============================================================

SELECT 'DoctorAvailability Table' AS [Object Type], COUNT(*) AS [Count]
FROM DoctorAvailability
UNION ALL
SELECT 'Indexes', COUNT(*) FROM sys.indexes WHERE object_id = OBJECT_ID('DoctorAvailability')
UNION ALL
SELECT 'Stored Procedures', COUNT(*) FROM sys.procedures WHERE name LIKE 'sp_%Availability%' OR name = 'sp_BookAppointment';

GO

PRINT '============================================================';
PRINT '  Doctor Availability System successfully added!';
PRINT '  Tables: DoctorAvailability';
PRINT '  Views: vw_DoctorAvailabilityDetails';
PRINT '  Stored Procedures:';
PRINT '    - sp_BookAppointment (updated)';
PRINT '    - sp_GetDoctorAvailableSlots';
PRINT '    - sp_SetDoctorAvailability';
PRINT '============================================================';
GO
