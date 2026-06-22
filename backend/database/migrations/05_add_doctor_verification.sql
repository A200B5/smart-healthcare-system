-- =========================================================================
-- Migration: Add Doctor Verification System
-- Description: Adds verification columns, constraints, and foreign keys 
--              to the Doctors table. Safe to run multiple times.
-- =========================================================================

-- 1. Add verification_status column
IF NOT EXISTS (
    SELECT * 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Doctors]') 
      AND name = 'verification_status'
)
BEGIN
    ALTER TABLE [dbo].[Doctors] 
    ADD [verification_status] NVARCHAR(20) NOT NULL DEFAULT 'pending';
END
GO

-- 2. Add rejection_reason column
IF NOT EXISTS (
    SELECT * 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Doctors]') 
      AND name = 'rejection_reason'
)
BEGIN
    ALTER TABLE [dbo].[Doctors] 
    ADD [rejection_reason] NVARCHAR(500) NULL;
END
GO

-- 3. Add verified_at column
IF NOT EXISTS (
    SELECT * 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Doctors]') 
      AND name = 'verified_at'
)
BEGIN
    ALTER TABLE [dbo].[Doctors] 
    ADD [verified_at] DATETIME2 NULL;
END
GO

-- 4. Add verified_by column
IF NOT EXISTS (
    SELECT * 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Doctors]') 
      AND name = 'verified_by'
)
BEGIN
    ALTER TABLE [dbo].[Doctors] 
    ADD [verified_by] INT NULL;
END
GO

-- 5. Add CHECK constraint for verification_status
IF NOT EXISTS (
    SELECT * 
    FROM sys.check_constraints 
    WHERE object_id = OBJECT_ID(N'[dbo].[CHK_Doctors_VerificationStatus]') 
      AND parent_object_id = OBJECT_ID(N'[dbo].[Doctors]')
)
BEGIN
    ALTER TABLE [dbo].[Doctors]  
    WITH CHECK ADD CONSTRAINT [CHK_Doctors_VerificationStatus] 
    CHECK ([verification_status] IN ('pending', 'approved', 'rejected'));

    ALTER TABLE [dbo].[Doctors] CHECK CONSTRAINT [CHK_Doctors_VerificationStatus];
END
GO

-- 6. Add FOREIGN KEY constraint for verified_by -> Users(id)
IF NOT EXISTS (
    SELECT * 
    FROM sys.foreign_keys 
    WHERE object_id = OBJECT_ID(N'[dbo].[FK_Doctors_Users_VerifiedBy]') 
      AND parent_object_id = OBJECT_ID(N'[dbo].[Doctors]')
)
BEGIN
    ALTER TABLE [dbo].[Doctors]  
    WITH CHECK ADD CONSTRAINT [FK_Doctors_Users_VerifiedBy] 
    FOREIGN KEY([verified_by]) REFERENCES [dbo].[Users] ([id]);

    ALTER TABLE [dbo].[Doctors] CHECK CONSTRAINT [FK_Doctors_Users_VerifiedBy];
END
GO

-- 7. Update existing doctor records
--    Set verification_status = 'approved' for existing doctors that were just defaulted to 'pending'
UPDATE [dbo].[Doctors]
SET [verification_status] = 'approved'
WHERE [verification_status] = 'pending';
GO

-- =========================================================================
-- Verification Queries
-- (Uncomment to run)
-- =========================================================================

/*
-- 1. SELECT verification_status counts
SELECT 
    verification_status, 
    COUNT(*) as total_count 
FROM [dbo].[Doctors] 
GROUP BY verification_status;

-- 2. SELECT all pending doctors
SELECT * 
FROM [dbo].[Doctors] 
WHERE verification_status = 'pending';

-- 3. SELECT all rejected doctors
SELECT * 
FROM [dbo].[Doctors] 
WHERE verification_status = 'rejected';

-- 4. SELECT all approved doctors
SELECT * 
FROM [dbo].[Doctors] 
WHERE verification_status = 'approved';
*/
