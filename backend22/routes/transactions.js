const express = require('express');
const router = express.Router();
const pool = require('../db'); // your PostgreSQL pool
const { authenticateToken } = require('../middleware/auth');

// POST /api/transactions - create a credit/transaction
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, description, customer_id } = req.body;

    if (amount == null) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const result = await pool.query(
      `
      INSERT INTO credits (user_id, amount, description, customer_id, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING *
      `,
      [userId, amount, description || null, customer_id || null]
    );

    res.status(201).json({ success: true, transaction: result.rows[0] });
  } catch (err) {
    console.error('Create credit error:', err);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});

// GET /api/transactions/recent-transactions (last 5 for Home)
router.get('/recent-transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const q = `
      SELECT c.id, c.amount, c.description, c.created_at, c.status,
             cu.full_name AS "customerName"
      FROM credits c
      LEFT JOIN customers cu ON c.customer_id = cu.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
      LIMIT 5
    `;

    const result = await pool.query(q, [userId]);

    const transactions = result.rows.map(row => ({
      id: row.id,
      amount: parseFloat(row.amount),
      description: row.description,
      customerName: row.customerName,
      date: row.created_at,
      status: row.status,
    }));

    res.json({ transactions });
  } catch (err) {
    console.error('Fetch recent transactions error:', err);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});

// GET /api/transactions/all-transactions?filter=15d|1m|all
router.get('/all-transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const filter = req.query.filter || '15d';

    let dateCondition = '';
    if (filter === '15d') dateCondition = `AND c.created_at >= NOW() - INTERVAL '15 days'`;
    else if (filter === '1m') dateCondition = `AND c.created_at >= NOW() - INTERVAL '1 month'`;

    const q = `
      SELECT c.id, c.amount, c.description, c.customer_id, c.created_at, c.status,
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
      status: row.status, // ✅ include status
    }));

    res.json({ transactions });
  } catch (err) {
    console.error('Fetch all transactions error:', err);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});

// GET /api/transactions/total-credit 
router.get('/total-credit', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS total_credit FROM credits WHERE user_id = $1 AND status = $2',
      [userId, 'pending'] //only sum pending credits
    );

    res.json({ totalCredit: parseFloat(result.rows[0].total_credit) });
  } catch (err) {
    console.error('Fetch total credit error:', err);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});

// GET /api/transactions/summary-last-week
router.get('/summary-last-week', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const q = `
      SELECT
        TO_CHAR(c.created_at::date, 'Mon DD') AS day,
        COALESCE(SUM(CASE WHEN status='settled' THEN amount END), 0) AS settled,
        COALESCE(SUM(CASE WHEN status='pending' THEN amount END), 0) AS pending
      FROM credits c
      WHERE c.user_id = $1
        AND c.created_at >= NOW() - INTERVAL '6 days'
      GROUP BY day
      ORDER BY MIN(c.created_at)
    `;

    const result = await pool.query(q, [userId]);

    res.json({ data: result.rows });
  } catch (err) {
    console.error('Fetch last week summary error:', err);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});


module.exports = router;
