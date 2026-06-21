-- ============================================================
--   DEPI Healthcare System | Core System Updates Migration
--   Refines appointment time storage and review relationships.
--
--   Run order: after depi_database.sql, migration_add_availability.sql,
--   and migration_add_reviews.sql have already been applied.
--
--   NOTE: For a brand-new install, the base scripts already reflect these
--   definitions; this migration upgrades an already-deployed database in place
--   without losing existing data.
-- ============================================================

USE depi;
GO

PRINT '============================================================';
PRINT '  Applying core system updates...';
PRINT '============================================================';
GO

-- ============================================================
-- Appointment time storage
--   Store appointment_time as TIME(0) instead of free-form text so that
--   slot comparisons operate on real time values. String storage allowed
--   equivalent slots (e.g. '10:00' and '10:00 AM') to be treated as different,
--   which let the same slot be booked more than once. Using TIME makes the
--   conflict check exact and consistent.
-- ============================================================

-- Existing string values ('10:00', '10:00 AM', '02:00 PM', ...) are
-- converted implicitly by SQL Server during the ALTER.
IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('Appointments')
      AND name = 'appointment_time'
      AND system_type_id = TYPE_ID('nvarchar')
)
BEGIN
    ALTER TABLE Appointments
        ALTER COLUMN appointment_time TIME(0) NOT NULL;
    PRINT 'Appointments.appointment_time converted to TIME(0).';
END
ELSE
    PRINT 'Appointments.appointment_time already TIME(0) - skipped.';
GO

-- Recreate the appointment-details view so the API continues to return a
-- normalized 'HH:mm' string, keeping the existing JSON shape for the frontend
-- now that the underlying column is a TIME value.
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
    CONVERT(VARCHAR(5), a.appointment_time, 108)  AS [time],   -- format TIME(0) as 'HH:mm'
    a.status,
    a.notes,
    CONVERT(VARCHAR(19), a.created_at, 120)       AS createdAt
FROM  Appointments a
JOIN  Doctors d      ON a.doctor_id  = d.id
JOIN  Users   u_doc  ON d.user_id    = u_doc.id
JOIN  Users   u_pat  ON a.patient_id = u_pat.id;
GO
PRINT 'vw_AppointmentDetails updated.';
GO

-- Recreate sp_BookAppointment so the availability check, conflict check, and
-- INSERT all use the parsed TIME value. This keeps booking consistent
-- regardless of whether the client sends 12-hour or 24-hour time.
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

    IF NOT EXISTS (SELECT 1 FROM Doctors WHERE id = @doctorId AND available = 1)
    BEGIN
        SELECT -1 AS result, 'Doctor not found or not available' AS message;
        RETURN;
    END

    IF NOT EXISTS (
        SELECT 1 FROM Users WHERE id = @patientId AND role = 'patient' AND is_active = 1
    )
    BEGIN
        SELECT -2 AS result, 'Patient account not found or inactive' AS message;
        RETURN;
    END

    SET @dayOfWeek = (DATEPART(WEEKDAY, @date) - 1) % 7;

    -- Accept both 12-hour (AM/PM) and 24-hour input, parsed into a TIME value.
    BEGIN TRY
        IF @time LIKE '%AM' OR @time LIKE '%PM'
            SET @appointmentTime = CONVERT(TIME(0), @time, 100);
        ELSE
            SET @appointmentTime = CONVERT(TIME(0), @time);
    END TRY
    BEGIN CATCH
        SELECT -4 AS result, 'Invalid time format. Use HH:MM or HH:MM AM/PM' AS message;
        RETURN;
    END CATCH

    SET @availabilityExists = (
        SELECT CASE WHEN EXISTS (
            SELECT 1 FROM DoctorAvailability
            WHERE doctor_id = @doctorId
              AND day_of_week = @dayOfWeek
              AND is_available = 1
              AND @appointmentTime >= start_time
              AND @appointmentTime < end_time
        ) THEN 1 ELSE 0 END
    );

    IF @availabilityExists = 0
    BEGIN
        SELECT -5 AS result, 'Doctor is not available at this date and time' AS message;
        RETURN;
    END

    -- Compare against the parsed TIME value so equivalent slots match exactly.
    IF EXISTS (
        SELECT 1 FROM Appointments
        WHERE doctor_id        = @doctorId
          AND appointment_date = @date
          AND appointment_time = @appointmentTime
          AND status NOT IN ('rejected')
    )
    BEGIN
        SELECT -3 AS result, 'This time slot is already booked' AS message;
        RETURN;
    END

    INSERT INTO Appointments
        (doctor_id, patient_id, appointment_date, appointment_time, status, notes)
    VALUES
        (@doctorId, @patientId, @date, @appointmentTime, 'pending', @notes);  -- persist the parsed TIME

    SELECT SCOPE_IDENTITY() AS result, 'Appointment booked successfully' AS message;
END;
GO
PRINT 'sp_BookAppointment updated.';
GO

-- ============================================================
-- Review relationships
--   A doctor row links back to a user, and that user already cascades to its
--   reviews through the patient relationship. Cascading deletes on the doctor
--   relationship as well creates two delete paths into Reviews from Users,
--   which SQL Server does not permit. Use NO ACTION on the doctor link and
--   remove a doctor's reviews explicitly during deletion instead.
-- ============================================================

-- Applies only when the Reviews table exists; on a fresh install the base
-- review migration already declares this relationship as NO ACTION.
IF OBJECT_ID('Reviews', 'U') IS NOT NULL
   AND EXISTS (
       SELECT 1 FROM sys.foreign_keys
       WHERE name = 'FK_Reviews_Doctors' AND delete_referential_action = 1  -- 1 = CASCADE
   )
BEGIN
    ALTER TABLE Reviews DROP CONSTRAINT FK_Reviews_Doctors;
    ALTER TABLE Reviews
        ADD CONSTRAINT FK_Reviews_Doctors
        FOREIGN KEY (doctor_id) REFERENCES Doctors(id) ON DELETE NO ACTION;
    PRINT 'FK_Reviews_Doctors changed to ON DELETE NO ACTION.';
END
ELSE
    PRINT 'FK_Reviews_Doctors already NO ACTION or Reviews table absent - skipped.';
GO

-- Recreate sp_DeleteUser so a doctor's received reviews are removed before the
-- user (and its cascaded Doctors row) is deleted, matching the NO ACTION rule
-- on the review-to-doctor relationship.
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

    IF @role = 'patient'
        DELETE FROM Appointments WHERE patient_id = @userId;

    -- Doctor reviews do not cascade, so remove them explicitly first.
    IF @role = 'doctor'
    BEGIN
        DECLARE @docId INT;
        SELECT @docId = id FROM Doctors WHERE user_id = @userId;
        IF @docId IS NOT NULL AND OBJECT_ID('Reviews', 'U') IS NOT NULL
            DELETE FROM Reviews WHERE doctor_id = @docId;
    END

    DELETE FROM Users WHERE id = @userId;

    SELECT 1 AS success, 'User deleted successfully' AS message;
END;
GO
PRINT 'sp_DeleteUser updated.';
GO

PRINT '============================================================';
PRINT '  Core system updates applied successfully.';
PRINT '============================================================';
GO