-- 01_create_tables.sql

-- Create Reviews Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Reviews]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Reviews] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [patient_id] INT NOT NULL,
        [doctor_id] INT NOT NULL,
        [rating] INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        [comment] NVARCHAR(1000) NULL,
        [created_at] DATETIME DEFAULT GETDATE(),
        CONSTRAINT [FK_Reviews_Users] FOREIGN KEY ([patient_id]) REFERENCES [dbo].[Users] ([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Reviews_Doctors] FOREIGN KEY ([doctor_id]) REFERENCES [dbo].[Doctors] ([id]) ON DELETE NO ACTION
    );
END
GO

-- Create DoctorAvailability Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DoctorAvailability]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[DoctorAvailability] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [doctor_id] INT NOT NULL,
        [day_of_week] INT NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
        [start_time] TIME(0) NOT NULL,
        [end_time] TIME(0) NOT NULL,
        [is_available] BIT NOT NULL DEFAULT 1,
        [slot_duration_minutes] INT NOT NULL DEFAULT 30,
        CONSTRAINT [FK_DoctorAvailability_Doctors] FOREIGN KEY ([doctor_id]) REFERENCES [dbo].[Doctors] ([id]) ON DELETE CASCADE,
        CONSTRAINT [UQ_DoctorAvailability_Day] UNIQUE ([doctor_id], [day_of_week])
    );
END
GO

-- Create Indexes for Reviews Table
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_Reviews_DoctorId')
    CREATE INDEX idx_Reviews_DoctorId ON [dbo].[Reviews]([doctor_id]);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_Reviews_PatientId')
    CREATE INDEX idx_Reviews_PatientId ON [dbo].[Reviews]([patient_id]);
GO
