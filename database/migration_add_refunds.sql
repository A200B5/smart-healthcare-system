USE master;
GO

USE depi;
GO

-- 1. Extend Payments Table
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Payments') AND name = 'refund_status'
)
BEGIN
    ALTER TABLE Payments ADD refund_status NVARCHAR(50) NULL;
END
GO

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Payments') AND name = 'refunded_amount'
)
BEGIN
    ALTER TABLE Payments ADD refunded_amount DECIMAL(18,2) NULL DEFAULT 0;
END
GO

-- 2. Create Refunds Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Refunds')
BEGIN
    CREATE TABLE Refunds (
        id                              INT             IDENTITY(1,1) PRIMARY KEY,
        payment_id                      INT             NOT NULL
                                                        CONSTRAINT FK_Refunds_Payments
                                                        REFERENCES Payments(id) ON DELETE CASCADE,
        appointment_id                  INT             NOT NULL
                                                        CONSTRAINT FK_Refunds_Appointments
                                                        REFERENCES Appointments(id),
        patient_id                      INT             NOT NULL
                                                        CONSTRAINT FK_Refunds_Users_Patient
                                                        REFERENCES Users(id),
        stripe_refund_id                NVARCHAR(255)   NOT NULL UNIQUE,
        stripe_balance_transaction_id   NVARCHAR(255)   NULL,
        refund_amount                   DECIMAL(18,2)   NOT NULL,
        refund_reason                   NVARCHAR(255)   NULL,
        refund_status                   NVARCHAR(50)    NOT NULL,
        refunded_at                     DATETIME2       NULL DEFAULT SYSDATETIME(),
        created_at                      DATETIME2       NOT NULL DEFAULT SYSDATETIME(),
        created_by_user_id              INT             NULL
                                                        CONSTRAINT FK_Refunds_Users_Admin
                                                        REFERENCES Users(id)
    );
END
GO

-- 3. Create Stored Procedure for Idempotent Refund Creation
CREATE OR ALTER PROCEDURE sp_CreateRefund
    @paymentId INT,
    @appointmentId INT,
    @patientId INT,
    @stripeRefundId NVARCHAR(255),
    @stripeBalanceTransactionId NVARCHAR(255),
    @refundAmount DECIMAL(18,2),
    @refundReason NVARCHAR(255),
    @refundStatus NVARCHAR(50),
    @createdByUserId INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Check Idempotency: Has this refund already been processed?
        DECLARE @existingRefundId INT;
        SELECT @existingRefundId = id FROM Refunds WHERE stripe_refund_id = @stripeRefundId;

        IF @existingRefundId IS NOT NULL
        BEGIN
            COMMIT TRANSACTION;
            
            -- Return existing refund details
            SELECT 
                r.id AS refundId,
                r.payment_id AS paymentId,
                r.stripe_refund_id AS stripeRefundId,
                r.refund_amount AS refundAmount,
                r.refund_status AS refundStatus,
                r.refunded_at AS refundedAt
            FROM Refunds r
            WHERE r.id = @existingRefundId;
            
            RETURN;
        END

        -- Check if a refund record for this payment already exists (Full Refund limitation for now)
        DECLARE @existingRefundsCount INT;
        SELECT @existingRefundsCount = COUNT(*) FROM Refunds WHERE payment_id = @paymentId;

        IF @existingRefundsCount > 0
        BEGIN
            -- Return the existing refund if it already exists for this payment (Prevents duplicate faking)
            SELECT TOP 1
                r.id AS refundId,
                r.payment_id AS paymentId,
                r.stripe_refund_id AS stripeRefundId,
                r.refund_amount AS refundAmount,
                r.refund_status AS refundStatus,
                r.refunded_at AS refundedAt
            FROM Refunds r
            WHERE r.payment_id = @paymentId
            ORDER BY r.created_at DESC;

            COMMIT TRANSACTION;
            RETURN;
        END

        -- Insert the new refund record
        DECLARE @newRefundId INT;
        INSERT INTO Refunds (
            payment_id, appointment_id, patient_id, stripe_refund_id, stripe_balance_transaction_id,
            refund_amount, refund_reason, refund_status, created_by_user_id, refunded_at
        )
        VALUES (
            @paymentId, @appointmentId, @patientId, @stripeRefundId, @stripeBalanceTransactionId,
            @refundAmount, @refundReason, @refundStatus, @createdByUserId, SYSDATETIME()
        );

        SET @newRefundId = SCOPE_IDENTITY();

        -- Update the Payment record
        UPDATE Payments
        SET 
            payment_status = 'refunded',
            refund_status = @refundStatus,
            refunded_amount = ISNULL(refunded_amount, 0) + @refundAmount
        WHERE id = @paymentId;

        COMMIT TRANSACTION;

        -- Return newly created data
        SELECT 
            r.id AS refundId,
            r.payment_id AS paymentId,
            r.stripe_refund_id AS stripeRefundId,
            r.refund_amount AS refundAmount,
            r.refund_status AS refundStatus,
            r.refunded_at AS refundedAt
        FROM Refunds r
        WHERE r.id = @newRefundId;

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
