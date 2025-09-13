const { Pool } = require('pg');
const url = process.env.DATABASE_URL;


if (!url) {
console.error('DATABASE_URL not set in environment');
process.exit(1);
}


const pool = new Pool({ connectionString: url });


module.exports = {
query: (text, params) => pool.query(text, params),
pool
};