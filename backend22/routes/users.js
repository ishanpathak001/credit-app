const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// middleware to verify token and attach user id
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

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

    // Insert user (return the created row)
    const result = await pool.query(
      'INSERT INTO users (full_name, phone_number, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, phone_number',
      [full_name, phone_number, hashedPassword]
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
    console.log('Login request body:', req.body);
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
    //jwt token
    //  const token = jwt.sign(
    //   { id: user.id, full_name: user.full_name },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "1d" }
    // );

    // Compare password   user.rows[0].password
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      console.log('Invalid password for phone:', phone_number);
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login success for user id:', user.rows[0].id);

    res.json({ status: true, token, user: { id: user.rows[0].id, phone_number: user.rows[0].phone_number, full_name: user.rows[0].full_name } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ------------------------
// PROFILE - get current user
// ------------------------
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const userRes = await pool.query('SELECT id, full_name, phone_number,created_at FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(userRes.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ------------------------
// TOTAL CREDIT for current user
// ------------------------
router.get('/total-credit', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    // Attempt to sum from credits table; if table doesn't exist, return 0
    try {
      const totalRes = await pool.query('SELECT COALESCE(SUM(amount),0) as total FROM credits WHERE user_id = $1', [userId]);
      return res.json({ totalCredit: parseFloat(totalRes.rows[0].total) });
    } catch (err) {
      console.warn('Could not query credits table:', err.message);
      return res.json({ totalCredit: 0 });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// GET /api/most-credit-customer -> customer with highest total credit
router.get('/most-credit-customer', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    try {
      const q = `
       SELECT
      cu.id,
        cu.full_name AS customer_name,
        cu.phone_number AS customer_phone,
        COALESCE(SUM(c.amount), 0) AS total_credit
        FROM customers cu
        LEFT JOIN credits c ON cu.id = c.customer_id
        WHERE cu.user_id = $1  -- replace $1 with the user's ID
        GROUP BY cu.id, cu.full_name, cu.phone_number
        ORDER BY total_credit DESC
        LIMIT 1;
      `;

      const r = await pool.query(q, [userId]);

      if (r.rows.length === 0) {
        return res.json({ customer: null });
      }

      const row = r.rows[0];

      return res.json({
        customer: {
          id: row.id,
          name: row.customer_name,
          phone: row.customer_phone,
          totalCredit: parseFloat(row.total_credit),
        },
      });
    } catch (err) {
      console.warn('Could not query most-credit-customer:', err.message);
      return res.json({ customer: null });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
