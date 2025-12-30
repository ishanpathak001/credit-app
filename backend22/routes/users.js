const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// ------------------------
// SIGNUP
// ------------------------
router.post('/signup', async (req, res) => {
  try {
    const { full_name, phone_number, password } = req.body;

   


    // Check if phone_number already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE phone_number = $1',
      [phone_number]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users ( full_name, phone_number, password_hash) VALUES ($1, $2, $3)',
      [ full_name, phone_number, hashedPassword]

    );

    res.status(201).json({ success: true, message: "User registered successfully!!", user: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ------------------------
// LOGIN
// ------------------------
router.post('/login', async (req, res) => {
  try {
    const { phone_number, password } = req.body;


    // Check if user exists
    const user = await pool.query(
      'SELECT * FROM users WHERE phone_number = $1',
      [phone_number]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Hashing the given password
    // const loginhashpwd = await bcrypt.hash(password, 10)

    // Compare password   user.rows[0].password
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({ status: true, user: { id: user.rows[0].id, phone_number: user.rows[0].phone_number, full_name: user.rows[0].full_name } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
