-- 04_create_availability_sps.sql

-- sp_SetDoctorAvailability
CREATE OR ALTER PROCEDURE [dbo].[sp_SetDoctorAvailability]
    @doctorId INT,
    @dayOfWeek INT,
    @startTime NVARCHAR(10),
    @endTime NVARCHAR(10),
    @isAvailable BIT,
    @slotDurationMinutes INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS(SELECT 1 FROM DoctorAvailability WHERE doctor_id = @doctorId AND day_of_week = @dayOfWeek)
    BEGIN
        UPDATE DoctorAvailability
        SET start_time = CAST(@startTime AS TIME),
            end_time = CAST(@endTime AS TIME),
            is_available = @isAvailable,
            slot_duration_minutes = @slotDurationMinutes
        WHERE doctor_id = @doctorId AND day_of_week = @dayOfWeek;
    END
    ELSE
    BEGIN
        INSERT INTO DoctorAvailability (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes)
        VALUES (@doctorId, @dayOfWeek, CAST(@startTime AS TIME), CAST(@endTime AS TIME), @isAvailable, @slotDurationMinutes);
    END
    
    SELECT 1 AS success, 'Availability updated successfully' AS message;
END
GO

-- sp_GetDoctorAvailableSlots
CREATE OR ALTER PROCEDURE [dbo].[sp_GetDoctorAvailableSlots]
    @doctorId INT,
    @date DATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- ((DATEPART(dw, @date) + @@DATEFIRST - 2) % 7) + 1 makes Monday=1, Sunday=7 independent of DATEFIRST
    DECLARE @dayOfWeek INT = ((DATEPART(dw, @date) + @@DATEFIRST - 2) % 7) + 1;
    
    DECLARE @startTime TIME;
    DECLARE @endTime TIME;
    DECLARE @isAvailable BIT;
    DECLARE @slotDuration INT;
    
    SELECT 
        @startTime = start_time,
        @endTime = end_time,
        @isAvailable = is_available,
        @slotDuration = slot_duration_minutes
    FROM DoctorAvailability
    WHERE doctor_id = @doctorId AND day_of_week = @dayOfWeek;
    
    DECLARE @Slots TABLE (
        availableSlot VARCHAR(5),
        isBooked BIT
    );
    
    IF @isAvailable = 1 AND @slotDuration > 0
    BEGIN
        DECLARE @currentSlot TIME = @startTime;
        
        WHILE @currentSlot < @endTime
        BEGIN
            DECLARE @slotStr VARCHAR(5) = CONVERT(VARCHAR(5), @currentSlot, 108);
            
            DECLARE @booked BIT = 0;
            -- Check if slot is booked in Appointments (assumes 'time' column is VARCHAR/TIME matching HH:MM)
            IF EXISTS(
    SELECT 1 FROM Appointments
    WHERE doctor_id = @doctorId
      AND appointment_date = @date
      AND appointment_time = @slotStr
      AND status IN ('pending', 'confirmed')
)
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
