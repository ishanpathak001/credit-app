const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');


   // GET /api/credits/limit
  
router.get('/limit', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT global_credit_limit FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      global_credit_limit: result.rows[0].global_credit_limit,
    });
  } catch (err) {
    console.error('Fetch global credit limit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


  
// PUT /api/credits/limit
   
   
router.put('/limit', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { global_credit_limit } = req.body;

    if (global_credit_limit === undefined || isNaN(global_credit_limit) || global_credit_limit < 0) {
      return res.status(400).json({ success: false, message: 'Invalid global_credit_limit' });
    }

    await pool.query(
      `UPDATE users SET global_credit_limit = $1 WHERE id = $2`,
      [global_credit_limit, userId]
    );

    res.json({
      success: true,
      message: 'Global credit limit updated',
      global_credit_limit,
    });
  } catch (err) {
    console.error('Update global credit limit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


   
// POST /api/credits
  
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, description, customer_id } = req.body;

    if (amount == null) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    // check if amount exceeds global limit
    const limitRes = await pool.query(
      `SELECT global_credit_limit FROM users WHERE id = $1`,
      [userId]
    );
    const globalLimit = limitRes.rows[0]?.global_credit_limit ?? null;

    if (globalLimit !== null && amount > globalLimit) {
      return res.status(400).json({ message: `Amount exceeds global credit limit of ₹${globalLimit}` });
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


   // PATCH /api/credits/:id/settle
   
   
router.patch('/:id/settle', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const creditId = Number(req.params.id);

    if (!creditId) {
      return res.status(400).json({ message: 'Invalid transaction id' });
    }

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
