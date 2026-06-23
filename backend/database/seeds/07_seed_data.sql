-- =========================================================================
-- DEPI Graduation Project | Smart Healthcare System
-- Seed Script
-- 
-- Execution Instructions:
-- Step 1: Run migrations:
--   01_create_tables.sql
--   02_create_views.sql
--   03_create_reviews_sps.sql
--   04_create_availability_sps.sql
--   05_add_doctor_verification.sql
--   06_doctor_license_unique.sql
-- 
-- Step 2: Run this file:
--   07_seed_data.sql
-- =========================================================================

-- =========================================================================
-- Test Credentials:
-- Admin:    admin@depi.com          / Admin@2026_Secure!
-- Doctor:   sabry8818@gmail.com     / 123456
-- Patient:  ab163545@gmail.com      / 123456
-- =========================================================================

USE [depi];
GO

PRINT 'Cleaning existing dev data safely (Reverse Dependency Order)...';
-- Clean existing dev data safely (Reverse Dependency Order)
DELETE FROM [dbo].[Appointments];
DELETE FROM [dbo].[Reviews];
DELETE FROM [dbo].[DoctorAvailability];
DELETE FROM [dbo].[Doctors];
DELETE FROM [dbo].[Users];

PRINT 'Reseeding identity columns...';
-- Reseed identity columns
DBCC CHECKIDENT ('[dbo].[Users]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[Doctors]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[Appointments]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[Reviews]', RESEED, 0);
DBCC CHECKIDENT ('[dbo].[DoctorAvailability]', RESEED, 0);
GO

PRINT 'Seeding Users...';
-- 1. Seed Users
DECLARE @adminHash NVARCHAR(255) = '$2a$10$Tp0gHoJgqP3kH9xphNxcKeIqAUt9rhQoMxHy/VXDAWML7dL1EQVOi';
DECLARE @userHash NVARCHAR(255)  = '$2a$10$1sTlLUeYbxPkXysUgDHEVeA3/Xoz7jVUam4ggm8NWCqsKJWxLF7E.';

INSERT INTO [dbo].[Users] (name, email, password, role, is_active) VALUES
(N'Admin User',        'admin@depi.com',       @adminHash, 'admin',   1),   -- ID 1
(N'Dr. Sabry',         'sabry8818@gmail.com',  @userHash,  'doctor',  1),   -- ID 2
(N'Dr. Ahmed Hassan',  'ahmed@depi.com',       @userHash,  'doctor',  1),   -- ID 3
(N'Dr. Mona Khalil',   'mona@depi.com',        @userHash,  'doctor',  1),   -- ID 4
(N'Dr. Omar Farouk',   'omar@depi.com',        @userHash,  'doctor',  1),   -- ID 5
(N'Dr. Layla Mansour', 'layla@depi.com',       @userHash,  'doctor',  1),   -- ID 6
(N'John Patient',      'ab163545@gmail.com',   @userHash,  'patient', 1),   -- ID 7
(N'Sara Ali',          'sara@depi.com',        @userHash,  'patient', 1),   -- ID 8
(N'Mohamed Kareem',    'mk@depi.com',          @userHash,  'patient', 1);   -- ID 9
GO

PRINT 'Seeding Doctors...';
-- 2. Seed Doctors
INSERT INTO [dbo].[Doctors] 
    (user_id, specialty, rating, reviews, experience, available, avatar, price, location, bio, schedule, verification_status, license_number, verified_by, verified_at, rejection_reason) 
VALUES
(2, N'Cardiology',    4.9, 238, 15, 1, N'👨‍⚕️', 150.00, N'Cairo Medical Center', N'Specialist in cardiovascular diseases with 15 years of experience.', N'Mon,Wed,Fri', 'approved', 'DOC-2026-1001', 1, GETDATE(), NULL), -- ID 1
(3, N'Neurology',     4.8, 192, 12, 1, N'👨‍⚕️', 180.00, N'Nile Health Clinic', N'Expert neurologist focusing on brain and nervous system disorders.', N'Tue,Thu,Sat', 'pending', 'DOC-2026-1002', NULL, NULL, NULL), -- ID 2
(4, N'Pediatrics',    4.9, 305, 10, 1, N'👩‍⚕️', 120.00, N'Children''s Hospital', N'Dedicated pediatrician with a gentle approach for young patients.', N'Mon,Tue,Thu', 'approved', 'DOC-2026-1003', 1, GETDATE(), NULL), -- ID 3
(5, N'Orthopedics',   0.0, 0,   18, 0, N'👨‍⚕️', 200.00, N'Sports Medicine Center', N'Orthopedic surgeon specializing in sports injuries and joint replacement.', N'', 'rejected', 'DOC-2026-1004', 1, GETDATE(), 'License number format is invalid.'), -- ID 4
(6, N'Dermatology',   4.8, 274, 8,  1, N'👩‍⚕️', 130.00, N'Skin Care Clinic', N'Dermatologist specializing in skin conditions and cosmetic procedures.', N'Mon,Wed,Sat', 'approved', 'DOC-2026-1005', 1, GETDATE(), NULL); -- ID 5
GO

PRINT 'Seeding DoctorAvailability...';
-- 3. Seed DoctorAvailability
INSERT INTO [dbo].[DoctorAvailability] (doctor_id, day_of_week, start_time, end_time, is_available, slot_duration_minutes) VALUES
(1, 2, '09:00', '17:00', 1, 30), -- Monday
(1, 4, '09:00', '17:00', 1, 30), -- Wednesday
(1, 6, '09:00', '13:00', 1, 30), -- Friday
(3, 2, '10:00', '18:00', 1, 30), -- Monday
(3, 3, '10:00', '18:00', 1, 30), -- Tuesday
(3, 5, '10:00', '18:00', 1, 30), -- Thursday
(5, 2, '08:00', '16:00', 1, 30), -- Monday
(5, 4, '08:00', '16:00', 1, 30), -- Wednesday
(5, 7, '08:00', '16:00', 1, 30); -- Saturday
GO

PRINT 'Seeding Appointments...';
-- 4. Seed Appointments
-- Patient 7: John Patient, Patient 8: Sara Ali, Patient 9: Mohamed Kareem
INSERT INTO [dbo].[Appointments] (doctor_id, patient_id, appointment_date, appointment_time, status, notes) VALUES
(1, 7, CAST(GETDATE() + 2 AS DATE), '10:00:00', 'confirmed', N'Chest pain follow-up'),
(2, 7, CAST(GETDATE() + 5 AS DATE), '14:00:00', 'pending',   N'Headache and dizziness'),
(3, 8, CAST(GETDATE() - 2 AS DATE), '11:00:00', 'completed', N'Annual checkup for child'),
(4, 9, CAST(GETDATE() + 7 AS DATE), '15:00:00', 'rejected',  N'Sports knee injury review'),
(1, 8, CAST(GETDATE() + 10 AS DATE),'09:00:00', 'pending',   N'Blood pressure monitoring'),
(5, 7, CAST(GETDATE() - 5 AS DATE), '11:00:00', 'completed', N'Skin rash consultation'),
(3, 9, CAST(GETDATE() - 10 AS DATE),'09:00:00', 'completed', N'Toddler vaccination follow-up');
GO

PRINT 'Seeding Reviews...';
-- 5. Seed Reviews
INSERT INTO [dbo].[Reviews] (patient_id, doctor_id, rating, comment) VALUES
(8, 3, 5, N'Dr. Mona was absolutely wonderful with my child. Very patient and clear.'),
(7, 5, 4, N'Great dermatologist, the treatment prescribed worked very quickly.'),
(9, 3, 5, N'Excellent doctor. Highly recommended.');
GO

PRINT '============================================================';
PRINT '  Seed data inserted successfully!';
PRINT '============================================================';
