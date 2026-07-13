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

// GET /api/admin/doctors/:doctorId
router.get('/doctors/:doctorId', async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const pool = getPool();
    const result = await pool.request()
      .input('doctorId', sql.Int, doctorId)
      .query(`
        SELECT 
          d.*,
          u.name,
          u.email,
          u.created_at
        FROM Doctors d
        JOIN Users u ON d.user_id = u.id
        WHERE d.id = @doctorId
      `);
      
    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    res.json({ success: true, doctor: result.recordset[0] });
  } catch (err) {
    console.error('Error fetching doctor details:', err);
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

// GET /api/admin/dashboard-stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const pool = getPool();
    const statsResult = await pool.request().query('SELECT * FROM vw_AdminStats');
    const revenueResult = await pool.request().query(`
      SELECT ISNULL(SUM(amount - ISNULL(refunded_amount, 0)), 0) as totalRevenue 
      FROM Payments 
      WHERE payment_status IN ('paid', 'succeeded')
    `);
    
    let stats = statsResult.recordset[0] || {};
    stats.totalRevenue = revenueResult.recordset[0]?.totalRevenue || 0;
    
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query('SELECT * FROM vw_UserList');
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/doctors
router.get('/doctors', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        d.id as doctorId,
        d.user_id as userId,
        u.name,
        u.email,
        d.specialty,
        d.rating,
        d.reviews,
        d.experience,
        d.available,
        d.price,
        d.location,
        d.verification_status as verificationStatus,
        d.license_number as licenseNumber,
        u.created_at as createdAt
      FROM Doctors d
      JOIN Users u ON d.user_id = u.id
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('Error fetching all doctors:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/revenue-stats
router.get('/revenue-stats', async (req, res) => {
  try {
    const pool = getPool();
      const result = await pool.request().query(`
        SELECT 
          ISNULL(SUM(CASE WHEN payment_status IN ('paid', 'succeeded') THEN (amount - ISNULL(refunded_amount, 0)) ELSE 0 END), 0) AS totalRevenue,
          ISNULL(SUM(CASE WHEN payment_status IN ('paid', 'succeeded') AND CAST(paid_at AS DATE) = CAST(GETDATE() AS DATE) THEN (amount - ISNULL(refunded_amount, 0)) ELSE 0 END), 0) AS revenueToday,
          ISNULL(SUM(CASE WHEN payment_status IN ('paid', 'succeeded') AND DATEDIFF(week, paid_at, GETDATE()) = 0 THEN (amount - ISNULL(refunded_amount, 0)) ELSE 0 END), 0) AS revenueThisWeek,
          ISNULL(SUM(CASE WHEN payment_status IN ('paid', 'succeeded') AND DATEDIFF(month, paid_at, GETDATE()) = 0 THEN (amount - ISNULL(refunded_amount, 0)) ELSE 0 END), 0) AS revenueThisMonth,
          SUM(CASE WHEN payment_status IN ('paid', 'succeeded') THEN 1 ELSE 0 END) AS successfulPayments,
          ISNULL(AVG(CASE WHEN payment_status IN ('paid', 'succeeded') AND (amount - ISNULL(refunded_amount, 0)) > 0 THEN (amount - ISNULL(refunded_amount, 0)) ELSE NULL END), 0) AS averagePaymentAmount,
          SUM(CASE WHEN payment_status = 'refunded' THEN 1 ELSE 0 END) AS refundedPayments,
          COUNT(*) AS totalTransactions
        FROM Payments
      `);
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    console.error('Error fetching revenue stats:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/recent-transactions
router.get('/recent-transactions', async (req, res) => {
  try {
    const { search, status, sort } = req.query;
    const pool = getPool();
    const request = pool.request();
    
    let query = `
      SELECT 
        p.id as paymentId,
        p.amount,
        p.currency,
        p.payment_method as paymentMethod,
        p.payment_status as paymentStatus,
        p.refund_status as refundStatus,
        p.transaction_id as transactionId,
        p.stripe_session_id as stripeSessionId,
        p.paid_at as paidAt,
        p.created_at as createdAt,
        a.appointment_date as appointmentDate,
        a.appointment_time as appointmentTime,
        a.status as appointmentStatus,
        up.name as patientName,
        ud.name as doctorName
      FROM Payments p
      LEFT JOIN Appointments a ON p.appointment_id = a.id
      LEFT JOIN Users up ON p.patient_id = up.id
      LEFT JOIN Doctors d ON a.doctor_id = d.id
      LEFT JOIN Users ud ON d.user_id = ud.id
      WHERE 1=1
    `;

    if (status && status !== 'All') {
      let dbStatus = status.toLowerCase();
      if (dbStatus === 'succeeded') dbStatus = 'paid';
      
      query += " AND p.payment_status = @status";
      request.input('status', sql.NVarChar, dbStatus);
    }

    if (search) {
      query += " AND (up.name LIKE @search OR ud.name LIKE @search OR p.transaction_id LIKE @search)";
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    if (sort === 'oldest') {
      query += " ORDER BY p.created_at ASC";
    } else if (sort === 'highest') {
      query += " ORDER BY p.amount DESC";
    } else if (sort === 'lowest') {
      query += " ORDER BY p.amount ASC";
    } else {
      // newest first is default
      query += " ORDER BY p.created_at DESC";
    }

    const result = await request.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('Error fetching recent transactions:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/top-doctors
router.get('/top-doctors', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT TOP 5
        ud.name as doctorName,
        d.specialty,
        ISNULL(SUM(p.amount - ISNULL(p.refunded_amount, 0)), 0) as totalRevenue,
        COUNT(p.id) as completedPayments
      FROM Payments p
      LEFT JOIN Appointments a ON p.appointment_id = a.id
      LEFT JOIN Doctors d ON a.doctor_id = d.id
      LEFT JOIN Users ud ON d.user_id = ud.id
      WHERE p.payment_status IN ('paid', 'succeeded')
      GROUP BY d.id, ud.name, d.specialty
      HAVING ISNULL(SUM(p.amount - ISNULL(p.refunded_amount, 0)), 0) > 0
      ORDER BY totalRevenue DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('Error fetching top doctors:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
