const express = require("express");
const router = express.Router();
const pool = require("../db");



// Add new customer

router.post("/addcustomer", async (req, res) => {
  try {

    const { full_name, phone_number, total_credit } = req.body;

    // Check if phone_number already exists
    const existingUser = await pool.query(
      'SELECT * FROM customers WHERE phone_number = $1',
      [phone_number]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists.' });
    }

    
    if (!full_name || !phone_number)
      return res.status(400).json({ message: "Name and phone number are required" });

    const result = await pool.query(
      "INSERT INTO customers (full_name, phone_number, total_credit) VALUES ($1, $2, $3) RETURNING *",
      [full_name, phone_number, total_credit || 0]
    );

    res.status(201).json({ success: true, message: "New User added successfully!!", user: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Search customers by name or phone number
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM customers
      WHERE
        full_name ILIKE $1
        OR phone_number ILIKE $1
      ORDER BY full_name ASC
      `,
      [`%${query}%`]
    );

    res.json({
      success: true,
      count: result.rows.length,
      customers: result.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
