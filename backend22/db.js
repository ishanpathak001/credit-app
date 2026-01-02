const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10),
});


pool.connect()
  .then(client => {
    console.log("✅ Connected to PostgreSQL");

    // Release test client
    client.release();

    
  })
  .catch(err => {
    console.error("❌ Error connecting to PostgreSQL:", err);
    process.exit(1); 
  });

module.exports = pool;
