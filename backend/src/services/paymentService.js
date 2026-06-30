const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getPool, sql } = require('../config/db');

/**
 * Core business logic to process a Stripe refund and safely update the database.
 * @param {Object} payment - The payment record from the database.
 * @param {String} reason - The reason for the refund.
 * @param {Number} adminId - ID of the admin or system user executing the refund.
 * @returns {Object} The refund result from the database.
 */
const processStripeRefund = async (payment, reason, adminId) => {
    if (!payment.stripe_payment_intent) {
        throw new Error('No Stripe PaymentIntent found for this payment');
    }

    let stripeRefundId = null;
    let stripeStatus = null;
    let balanceTransaction = null;
    
    // Check if Stripe already has a refund for this PaymentIntent
    const stripeRefundsList = await stripe.refunds.list({
        payment_intent: payment.stripe_payment_intent,
        limit: 1
    });

    if (stripeRefundsList.data.length > 0) {
        console.log(`[Refund] Stripe already has a refund for PaymentIntent ${payment.stripe_payment_intent}. Synching DB.`);
        const existingStripeRefund = stripeRefundsList.data[0];
        stripeRefundId = existingStripeRefund.id;
        stripeStatus = existingStripeRefund.status;
        balanceTransaction = existingStripeRefund.balance_transaction;
    } else {
        // Create Stripe Refund (Sandbox)
        console.log(`[Refund] Initiating Stripe Refund for PaymentIntent ${payment.stripe_payment_intent}...`);
        const stripeRefund = await stripe.refunds.create({
            payment_intent: payment.stripe_payment_intent,
            reason: reason === 'fraudulent' || reason === 'duplicate' || reason === 'requested_by_customer' ? reason : 'requested_by_customer'
        });
        
        stripeRefundId = stripeRefund.id;
        stripeStatus = stripeRefund.status;
        balanceTransaction = stripeRefund.balance_transaction;
        console.log(`[Refund] Stripe Refund created: ${stripeRefundId}`);
    }

    // Persist Refund idempotently in Database
    const pool = getPool();
    const dbResult = await pool.request()
        .input('paymentId', sql.Int, payment.id)
        .input('appointmentId', sql.Int, payment.appointment_id)
        .input('patientId', sql.Int, payment.patient_id)
        .input('stripeRefundId', sql.NVarChar(255), stripeRefundId)
        .input('stripeBalanceTransactionId', sql.NVarChar(255), balanceTransaction || '')
        .input('refundAmount', sql.Decimal(18,2), payment.amount)
        .input('refundReason', sql.NVarChar(255), reason || '')
        .input('refundStatus', sql.NVarChar(50), stripeStatus)
        .input('createdByUserId', sql.Int, adminId)
        .execute('sp_CreateRefund');

    return dbResult.recordset[0];
};

module.exports = {
    processStripeRefund
};
