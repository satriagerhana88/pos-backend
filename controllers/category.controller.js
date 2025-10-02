const db = require("../config/db");

// ambil semua kategori
const getCategories = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM categories ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ambil kategori by ID
const getCategoryById = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM categories WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// tambah kategori baru
const createCategory = async (req, res) => {
  try {
    const { code, name } = req.body;
    const result = await db.query(
      "INSERT INTO categories (code, name) VALUES ($1, $2) RETURNING *",
      [code, name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update kategori
const updateCategory = async (req, res) => {
  try {
    const { code, name } = req.body;
    const result = await db.query(
      "UPDATE categories SET code = $1, name = $2 WHERE id = $3 RETURNING *",
      [code, name, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// hapus kategori
const deleteCategory = async (req, res) => {
  try {
    const result = await db.query("DELETE FROM categories WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
