-- 02_create_views.sql

-- Create vw_DoctorAvailabilityDetails View
CREATE OR ALTER VIEW [dbo].[vw_DoctorAvailabilityDetails]
AS
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
    [dbo].[DoctorAvailability] da
INNER JOIN 
    [dbo].[Doctors] d ON da.doctor_id = d.id
INNER JOIN 
    [dbo].[Users] u ON d.user_id = u.id;
GO
