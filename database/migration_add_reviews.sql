-- ============================================================
--   DEPI Healthcare System | Doctor Reviews & Ratings Migration
--   Adds doctor review system with automatic rating calculation
--   Run this after the initial depi_database.sql setup
-- ============================================================

USE depi;
GO

PRINT '============================================================';
PRINT '  Adding Doctor Reviews & Ratings System...';
PRINT '============================================================';
GO

-- ============================================================
-- STEP 1: Create Reviews Table
-- ============================================================

CREATE TABLE Reviews (
    id              INT            IDENTITY(1,1)   PRIMARY KEY,
    patient_id      INT            NOT NULL
                        CONSTRAINT FK_Reviews_Patients
                        REFERENCES Users(id) ON DELETE CASCADE,
    doctor_id       INT            NOT NULL
                        CONSTRAINT FK_Reviews_Doctors
                        REFERENCES Doctors(id) ON DELETE NO ACTION,  -- NO ACTION: the user->doctor->reviews path would otherwise create multiple cascade paths
    rating          INT            NOT NULL
                        CONSTRAINT CK_Reviews_Rating CHECK (rating BETWEEN 1 AND 5),
    comment         NVARCHAR(1000) NOT NULL        DEFAULT '',
    created_at      DATETIME2      NOT NULL        DEFAULT SYSDATETIME(),
    -- Ensure one patient can only review a doctor once
    CONSTRAINT UQ_Reviews_Unique UNIQUE (patient_id, doctor_id)
);
GO

PRINT 'Reviews table created.';
GO

-- ============================================================
-- STEP 2: Create Indexes for Performance
-- ============================================================

CREATE INDEX IX_Reviews_PatientId    ON Reviews (patient_id);
CREATE INDEX IX_Reviews_DoctorId     ON Reviews (doctor_id);
CREATE INDEX IX_Reviews_CreatedAt    ON Reviews (created_at DESC);
GO

PRINT 'Indexes created.';
GO

-- ============================================================
-- STEP 3: Create Stored Procedure to Recalculate Doctor Ratings
-- ============================================================

CREATE OR ALTER PROCEDURE sp_RecalculateDoctorRating
    @doctorId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @avgRating DECIMAL(3,1);
    DECLARE @reviewCount INT;

    -- Calculate average rating and count of reviews
    SELECT
        @avgRating = CAST(AVG(CAST(rating AS DECIMAL(10,1))) AS DECIMAL(3,1)),
        @reviewCount = COUNT(*)
    FROM Reviews
    WHERE doctor_id = @doctorId;

    -- Handle case where there are no reviews
    IF @avgRating IS NULL
    BEGIN
        SET @avgRating = 0.0;
        SET @reviewCount = 0;
    END

    -- Update the Doctors table with new rating and review count
    UPDATE Doctors
    SET rating = @avgRating,
        reviews = @reviewCount
    WHERE id = @doctorId;

    RETURN 0;
END;
GO

PRINT 'Stored procedure sp_RecalculateDoctorRating created.';
GO

-- ============================================================
-- STEP 4: Create Trigger to Auto-Update Ratings on Review Insert
-- ============================================================

CREATE OR ALTER TRIGGER trg_Reviews_Insert
ON Reviews
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Get the doctor_id from the inserted row
    DECLARE @doctorId INT;
    SELECT @doctorId = doctor_id FROM inserted;

    -- Recalculate rating for this doctor
    EXEC sp_RecalculateDoctorRating @doctorId;
END;
GO

PRINT 'Trigger trg_Reviews_Insert created.';
GO

-- ============================================================
-- STEP 5: Create Trigger to Auto-Update Ratings on Review Delete
-- ============================================================

CREATE OR ALTER TRIGGER trg_Reviews_Delete
ON Reviews
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Get the doctor_id from the deleted row
    DECLARE @doctorId INT;
    SELECT @doctorId = doctor_id FROM deleted;

    -- Recalculate rating for this doctor
    EXEC sp_RecalculateDoctorRating @doctorId;
END;
GO

PRINT 'Trigger trg_Reviews_Delete created.';
GO

-- ============================================================
-- STEP 6: Create View for Review Details
-- ============================================================

CREATE OR ALTER VIEW vw_ReviewDetails AS
SELECT
    r.id,
    r.patient_id,
    u.name AS patientName,
    r.doctor_id,
    d.id AS docId,
    u2.name AS doctorName,
    r.rating,
    r.comment,
    CONVERT(VARCHAR(19), r.created_at, 120) AS createdAt,
    DATEDIFF(DAY, r.created_at, SYSDATETIME()) AS daysAgo
FROM Reviews r
JOIN Users u ON r.patient_id = u.id
JOIN Doctors d ON r.doctor_id = d.id
JOIN Users u2 ON d.user_id = u2.id;
GO

PRINT 'View vw_ReviewDetails created.';
GO

-- ============================================================
-- STEP 7: Create Stored Procedure to Get Doctor Reviews
-- ============================================================

CREATE OR ALTER PROCEDURE sp_GetDoctorReviews
    @doctorId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        id,
        patient_id,
        patientName,
        rating,
        comment,
        createdAt,
        daysAgo
    FROM vw_ReviewDetails
    WHERE doctor_id = @doctorId
    ORDER BY createdAt DESC;
END;
GO

PRINT 'Stored procedure sp_GetDoctorReviews created.';
GO

-- ============================================================
-- STEP 8: Create Stored Procedure to Add a Review
-- ============================================================

CREATE OR ALTER PROCEDURE sp_AddReview
    @patientId INT,
    @doctorId INT,
    @rating INT,
    @comment NVARCHAR(1000) = ''
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate rating range
    IF @rating < 1 OR @rating > 5
    BEGIN
        SELECT 0 AS success, 'Rating must be between 1 and 5' AS message;
        RETURN;
    END

    -- Verify patient exists and is active
    IF NOT EXISTS (SELECT 1 FROM Users WHERE id = @patientId AND role = 'patient' AND is_active = 1)
    BEGIN
        SELECT -1 AS success, 'Patient not found or inactive' AS message;
        RETURN;
    END

    -- Verify doctor exists
    IF NOT EXISTS (SELECT 1 FROM Doctors WHERE id = @doctorId)
    BEGIN
        SELECT -2 AS success, 'Doctor not found' AS message;
        RETURN;
    END

    -- Check if patient already reviewed this doctor
    IF EXISTS (SELECT 1 FROM Reviews WHERE patient_id = @patientId AND doctor_id = @doctorId)
    BEGIN
        SELECT -3 AS success, 'You have already reviewed this doctor' AS message;
        RETURN;
    END

    -- Insert the review
    BEGIN TRY
        INSERT INTO Reviews (patient_id, doctor_id, rating, comment)
        VALUES (@patientId, @doctorId, @rating, @comment);

        -- Trigger will automatically recalculate the doctor's rating
        SELECT SCOPE_IDENTITY() AS success, 'Review added successfully' AS message;
    END TRY
    BEGIN CATCH
        SELECT 0 AS success, 'Error adding review' AS message;
    END CATCH
END;
GO

PRINT 'Stored procedure sp_AddReview created.';
GO

-- ============================================================
-- STEP 9: Create Stored Procedure to Delete a Review
-- ============================================================

CREATE OR ALTER PROCEDURE sp_DeleteReview
    @reviewId INT,
    @requesterRole NVARCHAR(20) = 'admin',
    @requesterId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @doctorId INT;
    DECLARE @patientId INT;

    -- Get review details
    SELECT @doctorId = doctor_id, @patientId = patient_id
    FROM Reviews
    WHERE id = @reviewId;

    -- Check if review exists
    IF @doctorId IS NULL
    BEGIN
        SELECT 0 AS success, 'Review not found' AS message;
        RETURN;
    END

    -- Only admin or the patient who wrote it can delete
    IF @requesterRole <> 'admin' AND @patientId <> @requesterId
    BEGIN
        SELECT 0 AS success, 'You do not have permission to delete this review' AS message;
        RETURN;
    END

    -- Delete the review
    BEGIN TRY
        DELETE FROM Reviews WHERE id = @reviewId;

        -- Trigger will automatically recalculate the doctor's rating
        SELECT 1 AS success, 'Review deleted successfully' AS message;
    END TRY
    BEGIN CATCH
        SELECT 0 AS success, 'Error deleting review' AS message;
    END CATCH
END;
GO

PRINT 'Stored procedure sp_DeleteReview created.';
GO

-- ============================================================
-- STEP 10: Create Stored Procedure to Check if Patient Reviewed Doctor
-- ============================================================

CREATE OR ALTER PROCEDURE sp_CheckPatientReview
    @patientId INT,
    @doctorId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        id,
        rating,
        comment,
        CONVERT(VARCHAR(19), created_at, 120) AS createdAt
    FROM Reviews
    WHERE patient_id = @patientId
      AND doctor_id = @doctorId;
END;
GO

PRINT 'Stored procedure sp_CheckPatientReview created.';
GO

-- ============================================================
-- STEP 11: Verification
-- ============================================================

SELECT 'Reviews Table' AS [Object Type], COUNT(*) AS [Count]
FROM Reviews
UNION ALL
SELECT 'Indexes', COUNT(*) FROM sys.indexes WHERE object_id = OBJECT_ID('Reviews')
UNION ALL
SELECT 'Stored Procedures', COUNT(*) FROM sys.procedures WHERE name LIKE 'sp_%Review%' OR name = 'sp_RecalculateDoctorRating'
UNION ALL
SELECT 'Triggers', COUNT(*) FROM sys.triggers WHERE name LIKE 'trg_Reviews%'
UNION ALL
SELECT 'Views', COUNT(*) FROM sys.views WHERE name LIKE 'vw_Review%';

GO

PRINT '============================================================';
PRINT '  Doctor Reviews & Ratings System successfully added!';
PRINT '  Table: Reviews';
PRINT '  Views: vw_ReviewDetails';
PRINT '  Stored Procedures:';
PRINT '    - sp_RecalculateDoctorRating';
PRINT '    - sp_GetDoctorReviews';
PRINT '    - sp_AddReview';
PRINT '    - sp_DeleteReview';
PRINT '    - sp_CheckPatientReview';
PRINT '  Triggers:';
PRINT '    - trg_Reviews_Insert (auto-updates ratings)';
PRINT '    - trg_Reviews_Delete (auto-updates ratings)';
PRINT '============================================================';
GO
