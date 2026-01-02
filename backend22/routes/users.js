const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


   // auth middleware
   
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}


   // signup
   
router.post('/signup', async (req, res) => {
  try {
    const { full_name, phone_number, password } = req.body;

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE phone_number = $1',
      [phone_number]
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Phone number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, phone_number, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, phone_number, global_credit_limit`,
      [full_name, phone_number, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result.rows[0],
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).send('Server Error');
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { phone_number, password } = req.body;

    const userRes = await pool.query(
      `SELECT id, full_name, phone_number, password_hash, global_credit_limit
       FROM users
       WHERE phone_number = $1`,
      [phone_number]
    );

    if (userRes.rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const user = userRes.rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        phone_number: user.phone_number,
        global_credit_limit: user.global_credit_limit,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server Error');
  }
});

// current user info for profile

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userRes = await pool.query(
      `SELECT
         id,
         full_name,
         phone_number,
         global_credit_limit,
         created_at
       FROM users
       WHERE id = $1`,
      [req.userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(userRes.rows[0]);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).send('Server Error');
  }
});

//total credit for all customers
router.get('/total-credit', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM credits
       WHERE user_id = $1`,
      [req.userId]
    );

    res.json({ totalCredit: parseFloat(result.rows[0].total) });
  } catch (err) {
    console.error('Total credit error:', err);
    res.status(500).send('Server Error');
  }
});

// most credit customer(all time)

router.get('/most-credit-customer', authenticateToken, async (req, res) => {
  try {
    const q = `
      SELECT
        cu.id,
        cu.full_name AS customer_name,
        cu.phone_number AS customer_phone,
        COALESCE(SUM(c.amount), 0) AS total_credit
      FROM customers cu
      LEFT JOIN credits c ON cu.id = c.customer_id
      WHERE cu.user_id = $1
      GROUP BY cu.id
      ORDER BY total_credit DESC
      LIMIT 1
    `;

    const r = await pool.query(q, [req.userId]);

    if (r.rows.length === 0) {
      return res.json({ customer: null });
    }

    const row = r.rows[0];

    res.json({
      customer: {
        id: row.id,
        name: row.customer_name,
        phone: row.customer_phone,
        totalCredit: parseFloat(row.total_credit),
      },
    });
  } catch (err) {
    console.error('Most credit customer error:', err);
    res.status(500).send('Server Error');
  }
});

// GET global credit limit

router.get('/global-limit', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT global_credit_limit FROM users WHERE id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      global_credit_limit: result.rows[0].global_credit_limit,
    });
  } catch (err) {
    console.error('Get global limit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// update global credit limit

router.put('/global-limit', authenticateToken, async (req, res) => {
  try {
    const { global_credit_limit } = req.body;

    if (
      global_credit_limit === undefined ||
      isNaN(global_credit_limit) ||
      global_credit_limit < 0
    ) {
      return res
        .status(400)
        .json({ message: 'Invalid global_credit_limit' });
    }

    await pool.query(
      `UPDATE users SET global_credit_limit = $1 WHERE id = $2`,
      [global_credit_limit, req.userId]
    );

    res.json({
      success: true,
      message: 'Global credit limit updated',
      global_credit_limit,
    });
  } catch (err) {
    console.error('Update global limit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
