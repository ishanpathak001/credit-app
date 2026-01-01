const express = require('express');
const router = express.Router();
const pool = require('../db'); // your PostgreSQL pool
const { authenticateToken } = require('../middleware/auth');

// ✅ POST /api/transactions - create a credit/transaction
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, description, customer_id } = req.body;

    if (amount == null) return res.status(400).json({ message: 'Amount is required' });

    const result = await pool.query(
      'INSERT INTO credits (user_id, amount, description, customer_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, amount, description || null, customer_id || null]
    );

    res.status(201).json({ success: true, transaction: result.rows[0] });
  } catch (err) {
    console.error('Create credit error:', err);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});

// ✅ GET /api/transactions/all-transactions?filter=15d|1m|all
router.get('/all-transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const filter = req.query.filter || '15d'; // default filter

    // Build date condition based on filter
    let dateCondition = '';
    if (filter === '15d') dateCondition = `AND c.created_at >= NOW() - INTERVAL '15 days'`;
    else if (filter === '1m') dateCondition = `AND c.created_at >= NOW() - INTERVAL '1 month'`;
    // 'all' → no dateCondition

    const q = `
      SELECT c.id, c.amount, c.description, c.customer_id, c.created_at,
             cu.full_name AS "customerName",
             cu.phone_number AS "customerPhone"
      FROM credits c
      LEFT JOIN customers cu ON c.customer_id = cu.id
      WHERE c.user_id = $1
      ${dateCondition}
      ORDER BY c.created_at DESC
    `;

    const result = await pool.query(q, [userId]);

    const transactions = result.rows.map(row => ({
      id: row.id,
      amount: parseFloat(row.amount),
      description: row.description,
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      date: row.created_at,
    }));

    res.json({ transactions });
  } catch (err) {
    console.error('Fetch all transactions error:', err);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});

// ✅ GET /api/transactions/total-credit - total credit for Home.tsx
router.get('/total-credit', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      'SELECT COALESCE(SUM(amount),0) AS total_credit FROM credits WHERE user_id = $1',
      [userId]
    );

    res.json({ totalCredit: parseFloat(result.rows[0].total_credit) });
  } catch (err) {
    console.error('Fetch total credit error:', err);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});

module.exports = router;
