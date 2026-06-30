const { getPool, sql } = require('../config/db');

/**
 * Validates if an appointment slot has any scheduling conflicts.
 * Checks both Doctor availability and Patient availability.
 * 
 * @param {number} patientId 
 * @param {number} doctorId 
 * @param {string} appointmentDate (YYYY-MM-DD)
 * @param {string} appointmentTime (HH:MM)
 * @returns {Promise<{success: boolean, type?: string, message?: string}>}
 */
const validateAppointmentConflict = async (patientId, doctorId, appointmentDate, appointmentTime) => {
    try {
        const pool = getPool();

        // Rule 1: Doctor Conflict Check
        const doctorConflict = await pool.request()
            .input('doctorId', sql.Int, doctorId)
            .input('date', sql.Date, appointmentDate)
            .input('time', sql.NVarChar, appointmentTime)
            .query(`
                SELECT 1 FROM Appointments 
                WHERE doctor_id = @doctorId 
                  AND appointment_date = @date 
                  AND appointment_time = @time 
                  AND status = 'confirmed'
            `);

        if (doctorConflict.recordset.length > 0) {
            return {
                success: false,
                type: "DOCTOR_CONFLICT",
                message: "This time slot is no longer available."
            };
        }

        // Rule 2: Patient Conflict Check
        const patientConflict = await pool.request()
            .input('patientId', sql.Int, patientId)
            .input('date', sql.Date, appointmentDate)
            .input('time', sql.NVarChar, appointmentTime)
            .query(`
                SELECT 1 FROM Appointments 
                WHERE patient_id = @patientId 
                  AND appointment_date = @date 
                  AND appointment_time = @time 
                  AND status = 'confirmed'
            `);

        if (patientConflict.recordset.length > 0) {
            return {
                success: false,
                type: "PATIENT_CONFLICT",
                message: "You already have another appointment at this time."
            };
        }

        return { success: true };
    } catch (error) {
        console.error("Error validating appointment conflict:", error);
        throw error;
    }
};

module.exports = {
    validateAppointmentConflict
};
