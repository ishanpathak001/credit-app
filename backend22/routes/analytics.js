// routes/analytics.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/analytics/customer-usage
router.get('/customer-usage', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const q = `
      SELECT 
        cu.id,
        cu.full_name,
        COALESCE(SUM(CASE WHEN c.status='pending' THEN c.amount ELSE 0 END), 0) AS pending_total,
        COALESCE(cu.credit_limit, u.global_credit_limit) AS effective_limit,
        ROUND(
          COALESCE(SUM(CASE WHEN c.status='pending' THEN c.amount ELSE 0 END),0) 
          * 100.0 / NULLIF(COALESCE(cu.credit_limit, u.global_credit_limit),0), 2
        ) AS usage_percent
      FROM customers cu
      LEFT JOIN credits c ON cu.id = c.customer_id
      CROSS JOIN users u
      WHERE cu.user_id = $1
      GROUP BY cu.id, cu.full_name, cu.credit_limit, u.global_credit_limit
      ORDER BY pending_total DESC;
    `;

    const r = await pool.query(q, [userId]);
    res.json(r.rows);
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
