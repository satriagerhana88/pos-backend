// seed/seed_superadmin.js
require('dotenv').config();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    // const email = 'admin@pos.local';
    // const password = 'admin123'; // ubah setelah berhasil
    // const name = 'SUPER ADMIN';

    const { rows } = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (rows.length) {
      console.log('Superadmin sudah ada:', email);
      process.exit(0);
    }

    const hash = await bcrypt.hash(password, 10);
    const res = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, email`,
      [name, email, hash, 'SUPER_ADMIN']
    );
    console.log('Superadmin dibuat:', res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
