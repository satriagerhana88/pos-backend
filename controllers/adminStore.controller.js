const pool = require("../config/db");
const bcrypt = require("bcryptjs");

const createAdminStore = async (req, res) => {
  try {
    const { name, email, password, branch_id } = req.body;

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, branch_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, branch_id`,
      [name, email, hashedPassword, "ADMIN_STORE", branch_id]
    );

    res.json({
      message: "Admin store created successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create admin store" });
  }
};

// 📌 Ambil semua Admin Store
const getAdminStores = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.branch_id, b.name AS branch_name
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.role = 'ADMIN_STORE'
       ORDER BY u.id ASC`
    );

    res.json({
      message: "List of Admin Stores",
      data: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch admin stores" });
  }
};

module.exports = { createAdminStore, getAdminStores };