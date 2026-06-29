const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authMiddleware } = require('../middleware/auth');
const { getPool, sql } = require('../config/db');

// POST /api/payments/create-session
// Creates a Stripe Checkout Session for booking an appointment
router.post('/create-session', authMiddleware, async (req, res) => {
    try {
        const { doctorId, date, time, fee, doctorName, specialty, notes } = req.body;
        const patientId = req.user.id;
        
        // Calculate amount in cents (Stripe expects smallest currency unit)
        const unitAmount = Math.round(fee * 100);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd', // Adjust currency as needed (e.g. 'egp')
                        product_data: {
                            name: `Appointment with ${doctorName || 'Doctor'}`,
                            description: `Date: ${date}, Time: ${time}`,
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            metadata: {
                doctorId,
                patientId,
                date,
                time,
                notes: notes || '',
                doctorName,
                specialty: specialty || 'General'
            },
            // success_url and cancel_url must match your frontend routes
            // Stripe will append ?session_id={CHECKOUT_SESSION_ID} automatically if you add it
            success_url: `${process.env.FRONTEND_URL}/patient/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/patient/payment-failed`,
        });

        res.json({ success: true, url: session.url });
    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create checkout session' });
    }
});

// GET /api/payments/verify/:sessionId
// Verifies a Stripe Checkout Session and processes the payment/appointment
router.get('/verify/:sessionId', authMiddleware, async (req, res) => {
    try {
        const { sessionId } = req.params;

        // 1. Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ success: false, message: 'Payment not completed' });
        }

        // 2. Extract metadata
        const metadata = session.metadata || {};
        const doctorId = metadata.doctorId;
        const patientId = metadata.patientId;
        const date = metadata.date;
        const time = metadata.time;
        const notes = metadata.notes;
        const amount = session.amount_total / 100;
        const currency = session.currency;
        const paymentIntent = session.payment_intent;
        const paymentStatus = session.payment_status;
        const paymentMethod = 'card'; // Simplified for now

        // 3. Process payment and appointment idempotently via Stored Procedure
        const pool = getPool();
        const result = await pool.request()
            .input('sessionId', sql.NVarChar(255), sessionId)
            .input('paymentIntent', sql.NVarChar(255), paymentIntent)
            .input('amount', sql.Decimal(18,2), amount)
            .input('currency', sql.NVarChar(10), currency)
            .input('paymentMethod', sql.NVarChar(50), paymentMethod)
            .input('paymentStatus', sql.NVarChar(50), paymentStatus)
            .input('doctorId', sql.Int, doctorId)
            .input('patientId', sql.Int, patientId)
            .input('date', sql.Date, date)
            .input('time', sql.NVarChar(20), time)
            .input('notes', sql.NVarChar(500), notes)
            .execute('sp_ProcessStripePayment');

        const paymentData = result.recordset[0];

        res.json({ success: true, payment: paymentData });
    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify payment' });
    }
});

// GET /api/payments/history
// Returns the payment history for the currently authenticated patient
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request()
            .input('patientId', sql.Int, req.user.id)
            .query(`
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
                WHERE p.patient_id = @patientId
                ORDER BY p.paid_at DESC, p.created_at DESC
            `);
            
        res.json({ success: true, payments: result.recordset });
    } catch (error) {
        console.error('Fetch Payment History Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
    }
});

module.exports = router;
