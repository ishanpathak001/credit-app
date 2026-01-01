const express = require("express");
const router = express.Router();
const pool = require("../db"); // your pg Pool connection
const { authenticateToken } = require('../middleware/auth');

// ✅ GET all customers for logged-in user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware

    const result = await pool.query(
      `SELECT id, full_name, phone_number
       FROM customers
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ ADD a new customer
router.post("/", authenticateToken, async (req, res) => {
   
  try {
    const userId = req.userId;
    const { full_name, phone_number } = req.body;

    if (!full_name) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    if (!phone_number) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    const result = await pool.query(
      `INSERT INTO customers (user_id, full_name, phone_number)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, full_name, phone_number]
    );

    res.status(201).json({ success: true, message: "User registered successfully!!", user: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// GET a single customer by id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const customerId = parseInt(req.params.id, 10);
    const result = await pool.query(
      'SELECT id, full_name, phone_number, created_at FROM customers WHERE id = $1 AND user_id = $2',
      [customerId, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get customer error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET transactions for a customer
router.get('/:id/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const customerId = parseInt(req.params.id, 10);
    // Assume credits table has a customer_id column
    const q = `SELECT id, amount, description, created_at FROM credits WHERE user_id = $1 AND customer_id = $2 ORDER BY created_at DESC`;
    const r = await pool.query(q, [userId, customerId]);
    const transactions = r.rows.map(row => ({ id: row.id, amount: parseFloat(row.amount), date: row.created_at, description: row.description }));
    res.json({ transactions });
  } catch (err) {
    console.error('Customer transactions error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
