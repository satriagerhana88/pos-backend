const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// ===== Helper: Generate Product Code =====
const generateProductCode = async () => {
  const result = await db.query(`SELECT MAX(id) as max_id FROM products`);
  const maxId = result.rows[0].max_id || 0;
  return `PRD-${String(maxId + 1).padStart(4, '0')}`;
};

// ===== Get All Products =====
const getProducts = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, c.name as category_name 
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== Get Product By ID =====
const getProductById = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== Get Products By Category =====
const getProductsByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    const result = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE c.id = $1
       ORDER BY p.id ASC`,
      [category_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "No products found in this category" });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== Search Products =====
const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) return res.status(400).json({ message: "Keyword is required" });

    const result = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE LOWER(p.name) LIKE LOWER($1)
       ORDER BY p.id ASC`,
      [`%${keyword}%`]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "No products found" });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== Create Product =====
const createProduct = async (req, res) => {
  try {
    const { name, description, rental_price, category_id, notes } = req.body;

    const product_code = await generateProductCode(); // generate otomatis

    let image_url = null;
    if (req.file) image_url = `/uploads/${req.file.filename}`;

    const result = await db.query(
      `INSERT INTO products (product_code, name, description, rental_price, image_url, category_id, notes) 
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [product_code, name, description, rental_price, image_url, category_id, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== Update Product =====
const updateProduct = async (req, res) => {
  try {
    const { name, description, rental_price, category_id, notes } = req.body;

    const oldProduct = await db.query("SELECT * FROM products WHERE id=$1", [req.params.id]);
    if (oldProduct.rows.length === 0) return res.status(404).json({ message: "Product not found" });

    let image_url = oldProduct.rows[0].image_url;

    if (req.file) {
      if (image_url) {
        const oldPath = path.join(__dirname, "..", image_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      image_url = `/uploads/${req.file.filename}`;
    }

    const result = await db.query(
      `UPDATE products 
       SET name=$1, description=$2, rental_price=$3, image_url=$4, category_id=$5, notes=$6
       WHERE id=$7 RETURNING *`,
      [name, description, rental_price, image_url, category_id, notes, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== Delete Product =====
const deleteProduct = async (req, res) => {
  try {
    const oldProduct = await db.query("SELECT * FROM products WHERE id=$1", [req.params.id]);
    if (oldProduct.rows.length === 0) return res.status(404).json({ message: "Product not found" });

    const image_url = oldProduct.rows[0].image_url;

    await db.query("DELETE FROM products WHERE id=$1", [req.params.id]);

    if (image_url) {
      const oldPath = path.join(__dirname, "..", image_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
};
