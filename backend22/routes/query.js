import { pool } from "../db.js";

export const getCustomers = async (q) => {
  // No search → return all customers
  if (!q || q.trim() === "") {
    return pool.query(`
      SELECT id, full_name, phone_number
      FROM customers
      ORDER BY full_name
      LIMIT 50
    `);
  }

  // Phone number search (only digits)
  if (/^\d+$/.test(q)) {
    return pool.query(
      `
      SELECT id, full_name, phone_number
      FROM customers
      WHERE phone_number ILIKE $1
      ORDER BY full_name
      LIMIT 50
      `,
      [`%${q}%`]
    );
  }

  // Name search
  return pool.query(
    `
    SELECT id, full_name, phone_number
    FROM customers
    WHERE full_name ILIKE $1
    ORDER BY full_name
    LIMIT 50
    `,
    [`%${q}%`]
  );
};
