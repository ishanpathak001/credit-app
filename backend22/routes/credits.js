const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// POST /api/credits - create a credit/transaction
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

module.exports = router;
