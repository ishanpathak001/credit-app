require('dotenv').config();
const express = require('express');
const cors = require('cors');
const credits = require('./routes/credits');


const app = express();
app.use(cors());
app.use(express.json());


app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/credits', credits);


const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend listening on port ${port}`));