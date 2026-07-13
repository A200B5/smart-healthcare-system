/**
 * Payment Service
 */

import api from './axios';

// Helper to generate a mock transaction ID
export const generateMockTransactionId = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 9000 + 1000);
    return `PAY-${dateStr}-${randomNum}`;
};

/**
 * Initiates a checkout session.
 * In the future, this will call the backend to create a Stripe Checkout Session
 * and return the session URL or ID.
 * 
 * @param {Object} paymentDetails Details of the appointment and doctor
 * @returns {Promise<Object>} Mock response with success status and transaction ID
 */
export const createCheckoutSession = async (paymentDetails) => {
    try {
        const response = await api.post('/payments/create-session', paymentDetails);
        return response.data;
    } catch (error) {
        console.error("Failed to create checkout session:", error);
        return { success: false, message: error.response?.data?.message || "Payment initiation failed" };
    }
};

/**
 * Verifies the status of a payment after returning from checkout.
 * 
 * @param {string} sessionId The session ID from the checkout redirect
 * @returns {Promise<Object>} Mock response
 */
export const verifyPayment = async (sessionId) => {
    try {
        const response = await api.get(`/payments/verify/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to verify payment:", error);
        return { success: false, message: error.response?.data?.message || "Payment verification failed" };
    }
};

/**
 * Retrieves the payment history for the current patient.
 * 
 * @returns {Promise<Array>} Mock list of past payments
 */
export const getPaymentHistory = async () => {
    try {
        const response = await api.get('/payments/history');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch payment history:", error);
        return { success: false, message: error.response?.data?.message || "Failed to load payment history" };
    }
};

/**
 * Downloads a receipt for a specific transaction.
 * 
 * @param {string} transactionId The ID of the transaction
 * @returns {Promise<Blob>} Mock receipt data
 */
export const downloadReceipt = async (transactionId) => {

    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Downloading mock receipt for ${transactionId}`);
            resolve(new Blob(["Mock Receipt Content"], { type: 'text/plain' }));
        }, 500);
    });
};
