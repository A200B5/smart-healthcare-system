/****** Object:  Table [dbo].[Users]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](100) COLLATE Arabic_CI_AS NOT NULL,
	[email] [nvarchar](150) COLLATE Arabic_CI_AS NOT NULL,
	[password] [nvarchar](255) COLLATE Arabic_CI_AS NOT NULL,
	[role] [nvarchar](20) COLLATE Arabic_CI_AS NOT NULL,
	[is_active] [bit] NOT NULL,
	[created_at] [datetime2](7) NOT NULL,
	[phone] [nvarchar](20) COLLATE Arabic_CI_AS NULL,
	[gender] [nvarchar](20) COLLATE Arabic_CI_AS NULL,
	[date_of_birth] [date] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Doctors]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Doctors](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[specialty] [nvarchar](100) COLLATE Arabic_CI_AS NOT NULL,
	[rating] [decimal](3, 1) NOT NULL,
	[reviews] [int] NOT NULL,
	[experience] [int] NOT NULL,
	[available] [bit] NOT NULL,
	[avatar] [nvarchar](20) COLLATE Arabic_CI_AS NOT NULL,
	[price] [decimal](10, 2) NOT NULL,
	[location] [nvarchar](200) COLLATE Arabic_CI_AS NOT NULL,
	[bio] [nvarchar](1000) COLLATE Arabic_CI_AS NOT NULL,
	[schedule] [nvarchar](100) COLLATE Arabic_CI_AS NOT NULL,
	[license_number] [nvarchar](100) COLLATE Arabic_CI_AS NULL,
	[verification_status] [nvarchar](20) COLLATE Arabic_CI_AS NOT NULL,
	[rejection_reason] [nvarchar](500) COLLATE Arabic_CI_AS NULL,
	[verified_at] [datetime2](7) NULL,
	[verified_by] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Doctors_LicenseNumber] UNIQUE NONCLUSTERED 
(
	[license_number] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Appointments]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Appointments](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[doctor_id] [int] NOT NULL,
	[patient_id] [int] NOT NULL,
	[appointment_date] [date] NOT NULL,
	[appointment_time] [nvarchar](20) COLLATE Arabic_CI_AS NOT NULL,
	[status] [nvarchar](20) COLLATE Arabic_CI_AS NOT NULL,
	[notes] [nvarchar](500) COLLATE Arabic_CI_AS NOT NULL,
	[created_at] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_AppointmentDetails]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ============================================================
-- STEP 4: Views  (used directly by backend routes)
-- ============================================================

-- ── 4.1  Full appointment details with doctor + patient names
--  Used by: GET /api/appointments  (all roles)
CREATE   VIEW vw_AppointmentDetails AS
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
    a.appointment_time                            AS [time],
    a.status,
    a.notes,
    CONVERT(VARCHAR(19), a.created_at, 120)       AS createdAt
FROM  Appointments a
JOIN  Doctors d      ON a.doctor_id  = d.id
JOIN  Users   u_doc  ON d.user_id    = u_doc.id
JOIN  Users   u_pat  ON a.patient_id = u_pat.id;

GO
/****** Object:  View [dbo].[vw_DoctorList]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ── 4.2  Doctor list joined with user name & email
--  Used by: GET /api/doctors  (public)
CREATE   VIEW vw_DoctorList AS
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
WHERE u.is_active = 1 AND d.verification_status = 'approved';

GO
/****** Object:  View [dbo].[vw_UserList]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ── 4.3  User list with their total appointment count
--  Used by: GET /api/users  (admin only)
CREATE   VIEW vw_UserList AS
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
/****** Object:  View [dbo].[vw_AdminStats]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ── 4.4  Admin dashboard statistics (single-row summary)
--  Used by: GET /api/users/stats  (admin only)
CREATE   VIEW vw_AdminStats AS
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
/****** Object:  Table [dbo].[DoctorAvailability]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DoctorAvailability](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[doctor_id] [int] NOT NULL,
	[day_of_week] [int] NOT NULL,
	[start_time] [time](0) NOT NULL,
	[end_time] [time](0) NOT NULL,
	[is_available] [bit] NOT NULL,
	[slot_duration_minutes] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_DoctorAvailability_Day] UNIQUE NONCLUSTERED 
(
	[doctor_id] ASC,
	[day_of_week] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_DoctorAvailabilityDetails]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- 02_create_views.sql

-- Create vw_DoctorAvailabilityDetails View
CREATE   VIEW [dbo].[vw_DoctorAvailabilityDetails]
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
/****** Object:  Table [dbo].[Reviews]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Reviews](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[patient_id] [int] NOT NULL,
	[doctor_id] [int] NOT NULL,
	[rating] [int] NOT NULL,
	[comment] [nvarchar](1000) COLLATE Arabic_CI_AS NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Users_Email]    Script Date: 6/22/2026 9:52:03 PM ******/
CREATE NONCLUSTERED INDEX [IX_Users_Email] ON [dbo].[Users]
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Users_Role]    Script Date: 6/22/2026 9:52:03 PM ******/
CREATE NONCLUSTERED INDEX [IX_Users_Role] ON [dbo].[Users]
(
	[role] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Doctors_Available]    Script Date: 6/22/2026 9:52:03 PM ******/
CREATE NONCLUSTERED INDEX [IX_Doctors_Available] ON [dbo].[Doctors]
(
	[available] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Doctors_Specialty]    Script Date: 6/22/2026 9:52:03 PM ******/
CREATE NONCLUSTERED INDEX [IX_Doctors_Specialty] ON [dbo].[Doctors]
(
	[specialty] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Appointments_Date]    Script Date: 6/22/2026 9:52:03 PM ******/
CREATE NONCLUSTERED INDEX [IX_Appointments_Date] ON [dbo].[Appointments]
(
	[appointment_date] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Appointments_DoctorId]    Script Date: 6/22/2026 9:52:03 PM ******/
CREATE NONCLUSTERED INDEX [IX_Appointments_DoctorId] ON [dbo].[Appointments]
(
	[doctor_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Appointments_PatientId]    Script Date: 6/22/2026 9:52:03 PM ******/
CREATE NONCLUSTERED INDEX [IX_Appointments_PatientId] ON [dbo].[Appointments]
(
	[patient_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Appointments_Status]    Script Date: 6/22/2026 9:52:03 PM ******/
CREATE NONCLUSTERED INDEX [IX_Appointments_Status] ON [dbo].[Appointments]
(
	[status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_Reviews_DoctorId]    Script Date: 6/22/2026 9:52:03 PM ******/
CREATE NONCLUSTERED INDEX [idx_Reviews_DoctorId] ON [dbo].[Reviews]
(
	[doctor_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [idx_Reviews_PatientId]    Script Date: 6/22/2026 9:52:03 PM ******/
CREATE NONCLUSTERED INDEX [idx_Reviews_PatientId] ON [dbo].[Reviews]
(
	[patient_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT (sysdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[Doctors] ADD  DEFAULT ((0.0)) FOR [rating]
GO
ALTER TABLE [dbo].[Doctors] ADD  DEFAULT ((0)) FOR [reviews]
GO
ALTER TABLE [dbo].[Doctors] ADD  DEFAULT ((1)) FOR [available]
GO
ALTER TABLE [dbo].[Doctors] ADD  DEFAULT (N'👨‍⚕️') FOR [avatar]
GO
ALTER TABLE [dbo].[Doctors] ADD  DEFAULT ('') FOR [bio]
GO
ALTER TABLE [dbo].[Doctors] ADD  DEFAULT ('') FOR [schedule]
GO
ALTER TABLE [dbo].[Doctors] ADD  DEFAULT ('pending') FOR [verification_status]
GO
ALTER TABLE [dbo].[DoctorAvailability] ADD  DEFAULT ((1)) FOR [is_available]
GO
ALTER TABLE [dbo].[DoctorAvailability] ADD  DEFAULT ((30)) FOR [slot_duration_minutes]
GO
ALTER TABLE [dbo].[Appointments] ADD  DEFAULT ('pending') FOR [status]
GO
ALTER TABLE [dbo].[Appointments] ADD  DEFAULT ('') FOR [notes]
GO
ALTER TABLE [dbo].[Appointments] ADD  DEFAULT (sysdatetime()) FOR [created_at]
GO
ALTER TABLE [dbo].[Reviews] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Doctors]  WITH CHECK ADD  CONSTRAINT [FK_Doctors_Users] FOREIGN KEY([user_id])
REFERENCES [dbo].[Users] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Doctors] CHECK CONSTRAINT [FK_Doctors_Users]
GO
ALTER TABLE [dbo].[Doctors]  WITH CHECK ADD  CONSTRAINT [FK_Doctors_Users_VerifiedBy] FOREIGN KEY([verified_by])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[Doctors] CHECK CONSTRAINT [FK_Doctors_Users_VerifiedBy]
GO
ALTER TABLE [dbo].[DoctorAvailability]  WITH CHECK ADD  CONSTRAINT [FK_DoctorAvailability_Doctors] FOREIGN KEY([doctor_id])
REFERENCES [dbo].[Doctors] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[DoctorAvailability] CHECK CONSTRAINT [FK_DoctorAvailability_Doctors]
GO
ALTER TABLE [dbo].[Appointments]  WITH CHECK ADD  CONSTRAINT [FK_Appointments_Doctors] FOREIGN KEY([doctor_id])
REFERENCES [dbo].[Doctors] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Appointments] CHECK CONSTRAINT [FK_Appointments_Doctors]
GO
ALTER TABLE [dbo].[Appointments]  WITH CHECK ADD  CONSTRAINT [FK_Appointments_Patients] FOREIGN KEY([patient_id])
REFERENCES [dbo].[Users] ([id])
GO
ALTER TABLE [dbo].[Appointments] CHECK CONSTRAINT [FK_Appointments_Patients]
GO
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD  CONSTRAINT [FK_Reviews_Doctors] FOREIGN KEY([doctor_id])
REFERENCES [dbo].[Doctors] ([id])
GO
ALTER TABLE [dbo].[Reviews] CHECK CONSTRAINT [FK_Reviews_Doctors]
GO
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD  CONSTRAINT [FK_Reviews_Users] FOREIGN KEY([patient_id])
REFERENCES [dbo].[Users] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Reviews] CHECK CONSTRAINT [FK_Reviews_Users]
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [CK_Users_Role] CHECK  (([role]='admin' OR [role]='doctor' OR [role]='patient'))
GO
ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [CK_Users_Role]
GO
ALTER TABLE [dbo].[Doctors]  WITH CHECK ADD  CONSTRAINT [CHK_Doctors_VerificationStatus] CHECK  (([verification_status]='rejected' OR [verification_status]='approved' OR [verification_status]='pending'))
GO
ALTER TABLE [dbo].[Doctors] CHECK CONSTRAINT [CHK_Doctors_VerificationStatus]
GO
ALTER TABLE [dbo].[Doctors]  WITH CHECK ADD  CONSTRAINT [CK_Doctors_Exp] CHECK  (([experience]>=(0)))
GO
ALTER TABLE [dbo].[Doctors] CHECK CONSTRAINT [CK_Doctors_Exp]
GO
ALTER TABLE [dbo].[Doctors]  WITH CHECK ADD  CONSTRAINT [CK_Doctors_Price] CHECK  (([price]>=(0)))
GO
ALTER TABLE [dbo].[Doctors] CHECK CONSTRAINT [CK_Doctors_Price]
GO
ALTER TABLE [dbo].[Doctors]  WITH CHECK ADD  CONSTRAINT [CK_Doctors_Rating] CHECK  (([rating]>=(0.0) AND [rating]<=(5.0)))
GO
ALTER TABLE [dbo].[Doctors] CHECK CONSTRAINT [CK_Doctors_Rating]
GO
ALTER TABLE [dbo].[DoctorAvailability]  WITH CHECK ADD CHECK  (([day_of_week]>=(1) AND [day_of_week]<=(7)))
GO
ALTER TABLE [dbo].[Appointments]  WITH CHECK ADD  CONSTRAINT [CK_Appointments_Status] CHECK  (([status]='completed' OR [status]='rejected' OR [status]='confirmed' OR [status]='pending'))
GO
ALTER TABLE [dbo].[Appointments] CHECK CONSTRAINT [CK_Appointments_Status]
GO
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD CHECK  (([rating]>=(1) AND [rating]<=(5)))
GO
/****** Object:  StoredProcedure [dbo].[sp_UpdateAppointmentStatus]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ── 5.2  Update appointment status
--  Used by: PATCH /api/appointments/:id/status
CREATE   PROCEDURE sp_UpdateAppointmentStatus
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
/****** Object:  StoredProcedure [dbo].[sp_SetDoctorAvailability]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- 04_create_availability_sps.sql

-- sp_SetDoctorAvailability
CREATE   PROCEDURE [dbo].[sp_SetDoctorAvailability]
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
/****** Object:  StoredProcedure [dbo].[sp_GetDoctorReviews]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- sp_GetDoctorReviews
CREATE   PROCEDURE [dbo].[sp_GetDoctorReviews]
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
/****** Object:  StoredProcedure [dbo].[sp_GetDoctorById]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ── 5.4  Get single doctor by ID
--  Used by: GET /api/doctors/:id
CREATE   PROCEDURE sp_GetDoctorById
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM vw_DoctorList WHERE id = @id;
END;

GO
/****** Object:  StoredProcedure [dbo].[sp_GetDoctorAvailableSlots]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- sp_GetDoctorAvailableSlots
CREATE   PROCEDURE [dbo].[sp_GetDoctorAvailableSlots]
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
/****** Object:  StoredProcedure [dbo].[sp_DeleteUser]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ── 5.3  Safe user deletion (prevents deleting admins or leaving orphan FK)
--  Used by: DELETE /api/users/:id
CREATE   PROCEDURE sp_DeleteUser
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

    DELETE FROM Users WHERE id = @userId;

    SELECT 1 AS success, 'User deleted successfully' AS message;
END;

GO
/****** Object:  StoredProcedure [dbo].[sp_DeleteReview]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- sp_DeleteReview
CREATE   PROCEDURE [dbo].[sp_DeleteReview]
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
/****** Object:  StoredProcedure [dbo].[sp_CheckPatientReview]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- sp_CheckPatientReview
CREATE   PROCEDURE [dbo].[sp_CheckPatientReview]
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
/****** Object:  StoredProcedure [dbo].[sp_BookAppointment]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ============================================================
-- STEP 5: Stored Procedures
-- ============================================================

-- ── 5.1  Book a new appointment (with conflict & availability check)
--  Used by: POST /api/appointments
CREATE   PROCEDURE sp_BookAppointment
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
/****** Object:  StoredProcedure [dbo].[sp_AddReview]    Script Date: 6/22/2026 9:52:03 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- 03_create_reviews_sps.sql

-- sp_AddReview
CREATE   PROCEDURE [dbo].[sp_AddReview]
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
SET IDENTITY_INSERT [dbo].[Users] ON 

INSERT [dbo].[Users] ([id], [name], [email], [password], [role], [is_active], [created_at], [phone], [gender], [date_of_birth]) VALUES (1, N'Admin User', N'admin@depi.com', N'$2a$10$Tp0gHoJgqP3kH9xphNxcKeIqAUt9rhQoMxHy/VXDAWML7dL1EQVOi', N'admin', 1, CAST(N'2026-05-12T19:04:20.0123802' AS DateTime2), NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [name], [email], [password], [role], [is_active], [created_at], [phone], [gender], [date_of_birth]) VALUES (2, N'Dr. Sarah Johnson', N'sarah@depi.com', N'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'doctor', 1, CAST(N'2026-05-12T19:04:20.0123802' AS DateTime2), NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [name], [email], [password], [role], [is_active], [created_at], [phone], [gender], [date_of_birth]) VALUES (3, N'Dr. Ahmed Hassan', N'ahmed@depi.com', N'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'doctor', 1, CAST(N'2026-05-12T19:04:20.0123802' AS DateTime2), NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [name], [email], [password], [role], [is_active], [created_at], [phone], [gender], [date_of_birth]) VALUES (4, N'Dr. Mona Khalil', N'mona@depi.com', N'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'doctor', 1, CAST(N'2026-05-12T19:04:20.0123802' AS DateTime2), NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [name], [email], [password], [role], [is_active], [created_at], [phone], [gender], [date_of_birth]) VALUES (5, N'Dr. Omar Farouk', N'omar@depi.com', N'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'doctor', 1, CAST(N'2026-05-12T19:04:20.0123802' AS DateTime2), NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [name], [email], [password], [role], [is_active], [created_at], [phone], [gender], [date_of_birth]) VALUES (6, N'Dr. Layla Mansour', N'layla@depi.com', N'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'doctor', 1, CAST(N'2026-05-12T19:04:20.0123802' AS DateTime2), NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [name], [email], [password], [role], [is_active], [created_at], [phone], [gender], [date_of_birth]) VALUES (7, N'Dr. Karim Nabil', N'karim@depi.com', N'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'doctor', 1, CAST(N'2026-05-12T19:04:20.0123802' AS DateTime2), NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [name], [email], [password], [role], [is_active], [created_at], [phone], [gender], [date_of_birth]) VALUES (8, N'Dr. Nadia Rizk', N'nadia@depi.com', N'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'doctor', 1, CAST(N'2026-05-12T19:04:20.0123802' AS DateTime2), NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [name], [email], [password], [role], [is_active], [created_at], [phone], [gender], [date_of_birth]) VALUES (9, N'Dr. Youssef Tamer', N'youssef@depi.com', N'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'doctor', 1, CAST(N'2026-05-12T19:04:20.0123802' AS DateTime2), NULL, NULL, NULL)
INSERT [dbo].[Users] ([id], [name], [email], [password], [role], [is_active], [created_at], [phone], [gender], [date_of_birth]) VALUES (10, N'John Patient', N'patient@depi.com', N'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'patient', 1, CAST(N'2026-05-12T19:04:20.0123802' AS DateTime2), N'01012345678', N'Male', CAST(N'2003-05-10' AS Date))
INSERT [dbo].[Users] ([id], [name], [email], [password], [role], [is_active], [created_at], [phone], [gender], [date_of_birth]) VALUES (11, N'Sara Ali', N'sara@depi.com', N'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'patient', 1, CAST(N'2026-05-12T19:04:20.0123802' AS DateTime2), N'01198765432', N'Female', CAST(N'2002-09-15' AS Date))
INSERT [dbo].[Users] ([id], [name], [email], [password], [role], [is_active], [created_at], [phone], [gender], [date_of_birth]) VALUES (12, N'Mohamed Kareem', N'mk@depi.com', N'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', N'patient', 1, CAST(N'2026-05-12T19:04:20.0123802' AS DateTime2), N'01055555555', N'Male', CAST(N'2001-08-15' AS Date))
INSERT [dbo].[Users] ([id], [name], [email], [password], [role], [is_active], [created_at], [phone], [gender], [date_of_birth]) VALUES (15, N'Ahmed Bakr', N'ab163545@gmail.com', N'$2a$10$7oxZCp4YMjKztoTYYGXfBOt7i0wJ01vnbbF9NRXsUb32.oXsg2v8G', N'patient', 1, CAST(N'2026-06-22T20:05:53.1743250' AS DateTime2), N'+201099841660', N'Male', CAST(N'2005-12-23' AS Date))
INSERT [dbo].[Users] ([id], [name], [email], [password], [role], [is_active], [created_at], [phone], [gender], [date_of_birth]) VALUES (16, N'Ahmed Sabry', N'sabry8818@gmail.com', N'$2a$10$HlkwcRZs1ovcxVm2peQMB.Upagt5gBAnDiHEUjXar7ooMA4o4YtLa', N'doctor', 1, CAST(N'2026-06-22T20:12:54.5901278' AS DateTime2), N'+201156379992', NULL, NULL)
SET IDENTITY_INSERT [dbo].[Users] OFF
GO
SET IDENTITY_INSERT [dbo].[Doctors] ON 

INSERT [dbo].[Doctors] ([id], [user_id], [specialty], [rating], [reviews], [experience], [available], [avatar], [price], [location], [bio], [schedule], [license_number], [verification_status], [rejection_reason], [verified_at], [verified_by]) VALUES (1, 2, N'Cardiology', CAST(4.9 AS Decimal(3, 1)), 238, 15, 1, N'👩‍⚕️', CAST(150.00 AS Decimal(10, 2)), N'Cairo Medical Center', N'Specialist in cardiovascular diseases with 15 years of experience.', N'Mon,Wed,Fri', N'DOC-2026-1001', N'approved', NULL, NULL, NULL)
INSERT [dbo].[Doctors] ([id], [user_id], [specialty], [rating], [reviews], [experience], [available], [avatar], [price], [location], [bio], [schedule], [license_number], [verification_status], [rejection_reason], [verified_at], [verified_by]) VALUES (2, 3, N'Neurology', CAST(4.8 AS Decimal(3, 1)), 192, 12, 1, N'👨‍⚕️', CAST(180.00 AS Decimal(10, 2)), N'Nile Health Clinic', N'Expert neurologist focusing on brain and nervous system disorders.', N'Tue,Thu,Sat', N'DOC-2026-1002', N'approved', NULL, NULL, NULL)
INSERT [dbo].[Doctors] ([id], [user_id], [specialty], [rating], [reviews], [experience], [available], [avatar], [price], [location], [bio], [schedule], [license_number], [verification_status], [rejection_reason], [verified_at], [verified_by]) VALUES (3, 4, N'Pediatrics', CAST(4.9 AS Decimal(3, 1)), 305, 10, 1, N'👩‍⚕️', CAST(120.00 AS Decimal(10, 2)), N'Children''s Hospital', N'Dedicated pediatrician with a gentle approach for young patients.', N'Mon,Tue,Thu', N'DOC-2026-1003', N'approved', NULL, NULL, NULL)
INSERT [dbo].[Doctors] ([id], [user_id], [specialty], [rating], [reviews], [experience], [available], [avatar], [price], [location], [bio], [schedule], [license_number], [verification_status], [rejection_reason], [verified_at], [verified_by]) VALUES (4, 5, N'Orthopedics', CAST(4.7 AS Decimal(3, 1)), 156, 18, 0, N'👨‍⚕️', CAST(200.00 AS Decimal(10, 2)), N'Sports Medicine Center', N'Orthopedic surgeon specializing in sports injuries and joint replacement.', N'Wed,Fri', N'DOC-2026-1004', N'approved', NULL, NULL, NULL)
INSERT [dbo].[Doctors] ([id], [user_id], [specialty], [rating], [reviews], [experience], [available], [avatar], [price], [location], [bio], [schedule], [license_number], [verification_status], [rejection_reason], [verified_at], [verified_by]) VALUES (5, 6, N'Dermatology', CAST(4.8 AS Decimal(3, 1)), 274, 8, 1, N'👩‍⚕️', CAST(130.00 AS Decimal(10, 2)), N'Skin Care Clinic', N'Dermatologist specializing in skin conditions and cosmetic procedures.', N'Mon,Wed,Sat', N'DOC-2026-1005', N'approved', NULL, NULL, NULL)
INSERT [dbo].[Doctors] ([id], [user_id], [specialty], [rating], [reviews], [experience], [available], [avatar], [price], [location], [bio], [schedule], [license_number], [verification_status], [rejection_reason], [verified_at], [verified_by]) VALUES (6, 7, N'Ophthalmology', CAST(4.6 AS Decimal(3, 1)), 143, 14, 1, N'👨‍⚕️', CAST(140.00 AS Decimal(10, 2)), N'Eye Care Center', N'Eye specialist with expertise in cataract surgery and vision correction.', N'Tue,Thu,Fri', N'DOC-2026-1006', N'approved', NULL, NULL, NULL)
INSERT [dbo].[Doctors] ([id], [user_id], [specialty], [rating], [reviews], [experience], [available], [avatar], [price], [location], [bio], [schedule], [license_number], [verification_status], [rejection_reason], [verified_at], [verified_by]) VALUES (7, 8, N'Gynecology', CAST(4.9 AS Decimal(3, 1)), 321, 16, 1, N'👩‍⚕️', CAST(160.00 AS Decimal(10, 2)), N'Women''s Health Center', N'Gynecologist providing comprehensive women''s health services.', N'Mon,Wed,Thu', N'DOC-2026-1007', N'approved', NULL, NULL, NULL)
INSERT [dbo].[Doctors] ([id], [user_id], [specialty], [rating], [reviews], [experience], [available], [avatar], [price], [location], [bio], [schedule], [license_number], [verification_status], [rejection_reason], [verified_at], [verified_by]) VALUES (8, 9, N'Psychiatry', CAST(4.7 AS Decimal(3, 1)), 198, 11, 0, N'👨‍⚕️', CAST(170.00 AS Decimal(10, 2)), N'Mental Wellness Clinic', N'Psychiatrist dedicated to mental health and emotional wellbeing.', N'Tue,Fri', N'DOC-2026-1008', N'approved', NULL, NULL, NULL)
INSERT [dbo].[Doctors] ([id], [user_id], [specialty], [rating], [reviews], [experience], [available], [avatar], [price], [location], [bio], [schedule], [license_number], [verification_status], [rejection_reason], [verified_at], [verified_by]) VALUES (9, 16, N'Cardiology', CAST(0.0 AS Decimal(3, 1)), 0, 9, 1, N'', CAST(149.00 AS Decimal(10, 2)), N'Cairo', N'', N'', N'DOC-2005', N'approved', NULL, CAST(N'2026-06-22T20:38:00.7300000' AS DateTime2), 1)
SET IDENTITY_INSERT [dbo].[Doctors] OFF
GO
SET IDENTITY_INSERT [dbo].[Appointments] ON 

INSERT [dbo].[Appointments] ([id], [doctor_id], [patient_id], [appointment_date], [appointment_time], [status], [notes], [created_at]) VALUES (1, 1, 10, CAST(N'2026-05-15' AS Date), N'10:00 AM', N'confirmed', N'Chest pain follow-up', CAST(N'2026-05-12T19:04:20.0459871' AS DateTime2))
INSERT [dbo].[Appointments] ([id], [doctor_id], [patient_id], [appointment_date], [appointment_time], [status], [notes], [created_at]) VALUES (2, 2, 10, CAST(N'2026-05-20' AS Date), N'02:00 PM', N'pending', N'Headache and dizziness', CAST(N'2026-05-12T19:04:20.0459871' AS DateTime2))
INSERT [dbo].[Appointments] ([id], [doctor_id], [patient_id], [appointment_date], [appointment_time], [status], [notes], [created_at]) VALUES (3, 3, 11, CAST(N'2026-05-18' AS Date), N'11:00 AM', N'completed', N'Annual checkup for child', CAST(N'2026-05-12T19:04:20.0459871' AS DateTime2))
INSERT [dbo].[Appointments] ([id], [doctor_id], [patient_id], [appointment_date], [appointment_time], [status], [notes], [created_at]) VALUES (4, 5, 12, CAST(N'2026-05-22' AS Date), N'03:00 PM', N'rejected', N'Skin rash consultation', CAST(N'2026-05-12T19:04:20.0459871' AS DateTime2))
INSERT [dbo].[Appointments] ([id], [doctor_id], [patient_id], [appointment_date], [appointment_time], [status], [notes], [created_at]) VALUES (5, 1, 11, CAST(N'2026-05-25' AS Date), N'09:00 AM', N'pending', N'Blood pressure monitoring', CAST(N'2026-05-12T19:04:20.0459871' AS DateTime2))
INSERT [dbo].[Appointments] ([id], [doctor_id], [patient_id], [appointment_date], [appointment_time], [status], [notes], [created_at]) VALUES (6, 7, 10, CAST(N'2026-05-28' AS Date), N'01:00 PM', N'confirmed', N'Routine checkup', CAST(N'2026-05-12T19:04:20.0459871' AS DateTime2))
INSERT [dbo].[Appointments] ([id], [doctor_id], [patient_id], [appointment_date], [appointment_time], [status], [notes], [created_at]) VALUES (7, 2, 12, CAST(N'2026-06-01' AS Date), N'10:00 AM', N'pending', N'Migraine episodes', CAST(N'2026-05-12T19:04:20.0459871' AS DateTime2))
INSERT [dbo].[Appointments] ([id], [doctor_id], [patient_id], [appointment_date], [appointment_time], [status], [notes], [created_at]) VALUES (8, 4, 11, CAST(N'2026-06-03' AS Date), N'02:00 PM', N'confirmed', N'Sports knee injury review', CAST(N'2026-05-12T19:04:20.0459871' AS DateTime2))
INSERT [dbo].[Appointments] ([id], [doctor_id], [patient_id], [appointment_date], [appointment_time], [status], [notes], [created_at]) VALUES (9, 6, 10, CAST(N'2026-06-05' AS Date), N'11:00 AM', N'pending', N'Annual eye examination', CAST(N'2026-05-12T19:04:20.0459871' AS DateTime2))
INSERT [dbo].[Appointments] ([id], [doctor_id], [patient_id], [appointment_date], [appointment_time], [status], [notes], [created_at]) VALUES (10, 3, 12, CAST(N'2026-06-08' AS Date), N'09:00 AM', N'completed', N'Toddler vaccination follow-up', CAST(N'2026-05-12T19:04:20.0459871' AS DateTime2))
SET IDENTITY_INSERT [dbo].[Appointments] OFF
GO
