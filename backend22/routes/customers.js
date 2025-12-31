const express = require("express");
const router = express.Router();
const pool = require("../db"); // your pg Pool connection

// ✅ GET all customers for logged-in user
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

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
router.post("/", async (req, res) => {
   
  try {
    const userId = req.user.id;
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

module.exports = router;
