-- 03_create_reviews_sps.sql

-- sp_AddReview
CREATE OR ALTER PROCEDURE [dbo].[sp_AddReview]
    @patientId INT,
    @doctorId INT,
    @rating INT,
    @comment NVARCHAR(1000)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Verify doctor exists
    IF NOT EXISTS(SELECT 1 FROM Doctors WHERE id = @doctorId)
    BEGIN
        SELECT -2 AS success, 'Doctor not found' AS message;
        RETURN;
    END

    -- Verify patient hasn't already reviewed
    IF EXISTS(SELECT 1 FROM Reviews WHERE patient_id = @patientId AND doctor_id = @doctorId)
    BEGIN
        SELECT -3 AS success, 'You have already reviewed this doctor' AS message;
        RETURN;
    END

    INSERT INTO Reviews (patient_id, doctor_id, rating, comment)
    VALUES (@patientId, @doctorId, @rating, @comment);
    
    DECLARE @newId INT = SCOPE_IDENTITY();
    
    -- Update Doctor stats
    UPDATE Doctors
    SET reviews = (SELECT COUNT(*) FROM Reviews WHERE doctor_id = @doctorId),
        rating = ISNULL((SELECT CAST(AVG(CAST(rating AS DECIMAL(10,2))) AS DECIMAL(10,1)) FROM Reviews WHERE doctor_id = @doctorId), 0.0)
    WHERE id = @doctorId;

    SELECT @newId AS success, 'Review submitted successfully' AS message;
END
GO

-- sp_GetDoctorReviews
CREATE OR ALTER PROCEDURE [dbo].[sp_GetDoctorReviews]
    @doctorId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        r.id,
        r.patient_id,
        u.name AS patientName,
        r.rating,
        r.comment,
        r.created_at AS createdAt,
        DATEDIFF(day, r.created_at, GETDATE()) AS daysAgo
    FROM Reviews r
    INNER JOIN Users u ON r.patient_id = u.id
    WHERE r.doctor_id = @doctorId
    ORDER BY r.created_at DESC;
END
GO

-- sp_CheckPatientReview
CREATE OR ALTER PROCEDURE [dbo].[sp_CheckPatientReview]
    @patientId INT,
    @doctorId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, rating, comment, created_at AS createdAt
    FROM Reviews
    WHERE patient_id = @patientId AND doctor_id = @doctorId;
END
GO

-- sp_DeleteReview
CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteReview]
    @reviewId INT,
    @requesterRole NVARCHAR(50),
    @requesterId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @doctorId INT;
    SELECT @doctorId = doctor_id FROM Reviews WHERE id = @reviewId;

    IF @doctorId IS NULL
    BEGIN
        SELECT 0 AS success, 'Review not found' AS message;
        RETURN;
    END

    DELETE FROM Reviews WHERE id = @reviewId;
    
    -- Update Doctor stats
    UPDATE Doctors
    SET reviews = (SELECT COUNT(*) FROM Reviews WHERE doctor_id = @doctorId),
        rating = ISNULL((SELECT CAST(AVG(CAST(rating AS DECIMAL(10,2))) AS DECIMAL(10,1)) FROM Reviews WHERE doctor_id = @doctorId), 0.0)
    WHERE id = @doctorId;

    SELECT 1 AS success, 'Review deleted successfully' AS message;
END
GO
