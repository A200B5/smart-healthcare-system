USE master;
GO

USE depi;
GO

-- 1. Create Payments table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Payments')
BEGIN
    CREATE TABLE Payments (
        id                      INT             IDENTITY(1,1) PRIMARY KEY,
        appointment_id          INT             NOT NULL
                                                CONSTRAINT FK_Payments_Appointments
                                                REFERENCES Appointments(id) ON DELETE CASCADE,
        patient_id              INT             NOT NULL
                                                CONSTRAINT FK_Payments_Users
                                                REFERENCES Users(id),
        amount                  DECIMAL(18,2)   NOT NULL,
        currency                NVARCHAR(10)    NOT NULL DEFAULT 'usd',
        payment_method          NVARCHAR(50)    NOT NULL DEFAULT 'card',
        payment_status          NVARCHAR(50)    NOT NULL,
        transaction_id          NVARCHAR(255)   NOT NULL,
        stripe_session_id       NVARCHAR(255)   NOT NULL UNIQUE,
        stripe_payment_intent   NVARCHAR(255)   NULL,
        paid_at                 DATETIME2       NULL DEFAULT SYSDATETIME(),
        created_at              DATETIME2       NOT NULL DEFAULT SYSDATETIME()
    );
END
GO

-- 2. Create Stored Procedure for processing Stripe Payments idempotently
CREATE OR ALTER PROCEDURE sp_ProcessStripePayment
    @sessionId NVARCHAR(255),
    @paymentIntent NVARCHAR(255),
    @amount DECIMAL(18,2),
    @currency NVARCHAR(10),
    @paymentMethod NVARCHAR(50),
    @paymentStatus NVARCHAR(50),
    @doctorId INT,
    @patientId INT,
    @date DATE,
    @time NVARCHAR(20),
    @notes NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Check Idempotency: Has this session already been processed?
        DECLARE @existingPaymentId INT;
        SELECT @existingPaymentId = id FROM Payments WHERE stripe_session_id = @sessionId;

        IF @existingPaymentId IS NOT NULL
        BEGIN
            COMMIT TRANSACTION;
            
            -- Return existing payment details
            SELECT 
                p.id AS paymentId,
                p.stripe_session_id AS sessionId,
                p.amount,
                p.currency,
                p.payment_status AS paymentStatus,
                p.transaction_id AS transactionId,
                p.payment_method AS paymentMethod,
                p.paid_at AS paidAt,
                a.id AS appointmentId,
                a.appointment_date AS date,
                CAST(a.appointment_time AS NVARCHAR(20)) AS time,
                u.name AS doctorName,
                d.specialty AS doctorSpecialty
            FROM Payments p
            JOIN Appointments a ON p.appointment_id = a.id
            JOIN Doctors d ON a.doctor_id = d.id
            JOIN Users u ON d.user_id = u.id
            WHERE p.id = @existingPaymentId;
            
            RETURN;
        END

        -- If not processed, create the appointment
        -- We set status to 'confirmed' directly since payment succeeded.
        DECLARE @newAppointmentId INT;
        INSERT INTO Appointments (doctor_id, patient_id, appointment_date, appointment_time, notes, status)
        VALUES (@doctorId, @patientId, @date, @time, @notes, 'confirmed');

        SET @newAppointmentId = SCOPE_IDENTITY();

        -- Create the payment record
        DECLARE @newPaymentId INT;
        INSERT INTO Payments (
            appointment_id, patient_id, amount, currency, payment_method, 
            payment_status, transaction_id, stripe_session_id, stripe_payment_intent, paid_at
        )
        VALUES (
            @newAppointmentId, @patientId, @amount, @currency, @paymentMethod,
            @paymentStatus, @paymentIntent, @sessionId, @paymentIntent, SYSDATETIME()
        );

        SET @newPaymentId = SCOPE_IDENTITY();

        COMMIT TRANSACTION;

        -- Return newly created data
        SELECT 
            p.id AS paymentId,
            p.stripe_session_id AS sessionId,
            p.amount,
            p.currency,
            p.payment_status AS paymentStatus,
            p.transaction_id AS transactionId,
            p.payment_method AS paymentMethod,
            p.paid_at AS paidAt,
            a.id AS appointmentId,
            a.appointment_date AS date,
            CAST(a.appointment_time AS NVARCHAR(20)) AS time,
            u.name AS doctorName,
            d.specialty AS doctorSpecialty
        FROM Payments p
        JOIN Appointments a ON p.appointment_id = a.id
        JOIN Doctors d ON a.doctor_id = d.id
        JOIN Users u ON d.user_id = u.id
        WHERE p.id = @newPaymentId;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO
