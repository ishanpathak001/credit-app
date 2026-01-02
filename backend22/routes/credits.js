const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

/* ======================================================
   ✅ POST /api/credits - create a credit/transaction
   ====================================================== */
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

    res.status(201).json({
      success: true,
      transaction: result.rows[0],
    });
  } catch (err) {
    console.error('Create credit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ======================================================
   ✅ PATCH /api/credits/:id/settle
   ====================================================== */
router.patch('/:id/settle', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const creditId = Number(req.params.id);

    if (!creditId) {
      return res.status(400).json({ message: 'Invalid transaction id' });
    }

    // 1️⃣ Verify ownership & status
    const check = await pool.query(
      `
      SELECT id, status, amount
      FROM credits
      WHERE id = $1 AND user_id = $2
      `,
      [creditId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (check.rows[0].status === 'settled') {
      return res.status(400).json({ message: 'Transaction already settled' });
    }

    // 2️⃣ Mark as settled
    const update = await pool.query(
      `
      UPDATE credits
      SET status = 'settled', settled_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
      `,
      [creditId, userId]
    );

    res.json({
      success: true,
      message: 'Transaction settled successfully',
      transaction: update.rows[0],
    });
  } catch (err) {
    console.error('Settle transaction error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
