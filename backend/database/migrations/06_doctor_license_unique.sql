-- =========================================================================
-- Migration: Doctor License Unique Constraint and Mock Data
-- Description: Assigns unique licenses to existing doctors and 
--              adds a UNIQUE constraint on license_number.
-- =========================================================================

-- 1. Populate missing license numbers with a standard format
WITH MissingLicenses AS (
    SELECT 
        id,
        ROW_NUMBER() OVER(ORDER BY id) as seq
    FROM [dbo].[Doctors]
    WHERE license_number IS NULL OR license_number = ''
)
UPDATE [dbo].[Doctors]
SET license_number = 'DOC-2026-' + CAST(1000 + ml.seq AS NVARCHAR(20))
FROM [dbo].[Doctors] d
INNER JOIN MissingLicenses ml ON d.id = ml.id;
GO

-- 2. Resolve any existing duplicates (just in case there are mock duplicates)
WITH Duplicates AS (
    SELECT 
        id,
        license_number,
        ROW_NUMBER() OVER(PARTITION BY license_number ORDER BY id) as seq
    FROM [dbo].[Doctors]
)
UPDATE [dbo].[Doctors]
SET license_number = license_number + '-' + CAST(dup.seq AS NVARCHAR(10))
FROM [dbo].[Doctors] d
INNER JOIN Duplicates dup ON d.id = dup.id
WHERE dup.seq > 1;
GO

-- 3. Add UNIQUE constraint on license_number
IF NOT EXISTS (
    SELECT * 
    FROM sys.indexes 
    WHERE name = 'UQ_Doctors_LicenseNumber' 
      AND object_id = OBJECT_ID(N'[dbo].[Doctors]')
)
BEGIN
    ALTER TABLE [dbo].[Doctors] 
    ADD CONSTRAINT [UQ_Doctors_LicenseNumber] UNIQUE ([license_number]);
END
GO

-- =========================================================================
-- Verification Queries
-- =========================================================================
/*
-- 1. Check for duplicates (should return 0 rows)
SELECT 
    license_number, 
    COUNT(*) as duplicate_count 
FROM [dbo].[Doctors] 
GROUP BY license_number 
HAVING COUNT(*) > 1;

-- 2. View all doctors and their newly generated license numbers
SELECT 
    id, 
    user_id, 
    specialty, 
    license_number
FROM [dbo].[Doctors]
ORDER BY id;
*/
