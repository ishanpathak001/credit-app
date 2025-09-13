const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/credits
router.get('/', async (req, res) => {
try {
const result = await db.query('SELECT c.*, u.name as user_name, u.email as user_email FROM credits c LEFT JOIN users u ON u.id = c.user_id ORDER BY c.created_at DESC');
res.json(result.rows);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Failed to fetch credits' });
}
});

// GET /api/credits/:id
router.get('/:id', async (req, res) => {
try {
const { id } = req.params;
const result = await db.query('SELECT * FROM credits WHERE id = $1', [id]);
if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
res.json(result.rows[0]);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Failed to fetch credit' });
}
});

// POST /api/credits
router.post('/', async (req, res) => {
try {
const { user_id, amount, description, status } = req.body;
const result = await db.query(
'INSERT INTO credits (user_id, amount, description, status) VALUES ($1,$2,$3,$4) RETURNING *',
[user_id, amount, description || null, status || 'pending']
);
res.status(201).json(result.rows[0]);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Failed to create credit' });
}
});


// PUT /api/credits/:id
router.put('/:id', async (req, res) => {
try {
const { id } = req.params;
const { amount, description, status } = req.body;
const result = await db.query(
'UPDATE credits SET amount = COALESCE($1, amount), description = COALESCE($2, description), status = COALESCE($3, status) WHERE id = $4 RETURNING *',
[amount, description, status, id]
);
if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
res.json(result.rows[0]);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Failed to update credit' });
}
});


// DELETE /api/credits/:id
router.delete('/:id', async (req, res) => {
try {
const { id } = req.params;
const result = await db.query('DELETE FROM credits WHERE id = $1 RETURNING *', [id]);
if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
res.json({ deleted: true });
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Failed to delete credit' });
}
});


module.exports = router;