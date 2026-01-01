const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/total-credit -> sums credits for the logged-in user
router.get('/total-credit', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const totalRes = await pool.query('SELECT COALESCE(SUM(amount),0) as total FROM credits WHERE user_id = $1', [userId]);
    res.json({ totalCredit: parseFloat(totalRes.rows[0].total) });
  } catch (err) {
    console.error('total-credit error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/recent-transactions -> last 5 credits for user
router.get('/recent-transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const q = `SELECT c.id, c.amount, c.description, c.created_at, cu.full_name AS customerName, cu.phone_number AS customerPhone
               FROM credits c
               LEFT JOIN customers cu ON c.customer_id = cu.id
               WHERE c.user_id = $1
               ORDER BY c.created_at DESC
               LIMIT 5`;
    const r = await pool.query(q, [userId]);
    const transactions = r.rows.map(row => ({ id: row.id, amount: parseFloat(row.amount), date: row.created_at, description: row.description, customerName: row.customername || null, customerPhone: row.customerphone || null }));
    res.json({ transactions });
  } catch (err) {
    console.error('recent-transactions error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/all-transactions -> all credits for user
router.get('/all-transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const q = `SELECT c.id, c.amount, c.description, c.created_at, cu.full_name AS customerName, cu.phone_number AS customerPhone
               FROM credits c
               LEFT JOIN customers cu ON c.customer_id = cu.id
               WHERE c.user_id = $1
               ORDER BY c.created_at DESC`;
    const r = await pool.query(q, [userId]);
    const transactions = r.rows.map(row => ({ id: row.id, amount: parseFloat(row.amount), date: row.created_at, description: row.description, customerName: row.customername || null, customerPhone: row.customerphone || null }));
    res.json({ transactions });
  } catch (err) {
    console.error('all-transactions error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
