const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// All routes in this file require authentication and admin role
router.use(authMiddleware, requireRole('admin'));

// GET /api/admin/pending-doctors
router.get('/pending-doctors', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        d.id as doctorId,
        d.user_id as userId,
        u.name,
        u.email,
        d.specialty,
        d.experience,
        d.location,
        d.price,
        d.license_number as licenseNumber,
        u.created_at as createdAt
      FROM Doctors d
      JOIN Users u ON d.user_id = u.id
      WHERE d.verification_status = 'pending'
    `);
    
    res.json({ success: true, count: result.recordset.length, data: result.recordset });
  } catch (err) {
    console.error('Error fetching pending doctors:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/admin/doctors/:doctorId/approve
router.put('/doctors/:doctorId/approve', async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const adminId = req.user.id;
    const pool = getPool();
    
    const checkResult = await pool.request()
      .input('doctorId', sql.Int, doctorId)
      .query('SELECT verification_status FROM Doctors WHERE id = @doctorId');
      
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    const currentStatus = checkResult.recordset[0].verification_status;
    if (currentStatus === 'approved') {
      return res.status(400).json({ success: false, message: 'Doctor is already approved' });
    }
    if (currentStatus === 'rejected') {
      return res.status(400).json({ success: false, message: 'Doctor is already rejected' });
    }
    
    await pool.request()
      .input('doctorId', sql.Int, doctorId)
      .input('adminId', sql.Int, adminId)
      .query(`
        UPDATE Doctors 
        SET verification_status = 'approved',
            rejection_reason = NULL,
            verified_at = GETDATE(),
            verified_by = @adminId
        WHERE id = @doctorId
      `);
      
    res.json({ success: true, message: 'Doctor approved successfully' });
  } catch (err) {
    console.error('Error approving doctor:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/admin/doctors/:doctorId/reject
router.put('/doctors/:doctorId/reject', async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const adminId = req.user.id;
    const { rejectionReason } = req.body;
    
    if (!rejectionReason || String(rejectionReason).trim() === '') {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }
    
    const pool = getPool();
    
    const checkResult = await pool.request()
      .input('doctorId', sql.Int, doctorId)
      .query('SELECT verification_status FROM Doctors WHERE id = @doctorId');
      
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    const currentStatus = checkResult.recordset[0].verification_status;
    if (currentStatus === 'approved') {
      return res.status(400).json({ success: false, message: 'Doctor is already approved' });
    }
    if (currentStatus === 'rejected') {
      return res.status(400).json({ success: false, message: 'Doctor is already rejected' });
    }
    
    await pool.request()
      .input('doctorId', sql.Int, doctorId)
      .input('adminId', sql.Int, adminId)
      .input('reason', sql.NVarChar, rejectionReason)
      .query(`
        UPDATE Doctors 
        SET verification_status = 'rejected',
            rejection_reason = @reason,
            verified_at = GETDATE(),
            verified_by = @adminId
        WHERE id = @doctorId
      `);
      
    res.json({ success: true, message: 'Doctor rejected successfully' });
  } catch (err) {
    console.error('Error rejecting doctor:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
