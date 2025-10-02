const db = require("../config/db");

// ambil semua produk (join kategori biar lebih informatif)
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

// ambil produk by ID
const getProductById = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ambil produk berdasarkan kategori_id
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

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No products found in this category" });
    }

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// tambah produk baru
const createProduct = async (req, res) => {
  try {
    const { product_code, name, description, rental_price, category_id, notes } = req.body;

    // kalau ada file, simpan path-nya
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

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

// update produk
const fs = require("fs");
const path = require("path");
const updateProduct = async (req, res) => {
  try {
    const { product_code, name, description, rental_price, category_id, notes } = req.body;

    // cek dulu product lama
    const oldProduct = await db.query("SELECT * FROM products WHERE id=$1", [req.params.id]);
    if (oldProduct.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    let image_url = oldProduct.rows[0].image_url;

    // kalau ada file baru
    if (req.file) {
      // hapus file lama (kalau ada dan bukan null)
      if (image_url) {
        const oldPath = path.join(__dirname, "..", image_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath); // hapus file lama
        }
      }
      // set image baru
      image_url = `/uploads/${req.file.filename}`;
    }

    const result = await db.query(
      `UPDATE products 
       SET product_code=$1, name=$2, description=$3, rental_price=$4, image_url=$5, category_id=$6, notes=$7
       WHERE id=$8 RETURNING *`,
      [product_code, name, description, rental_price, image_url, category_id, notes, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// hapus produk
const deleteProduct = async (req, res) => {
  try {
    // cek produk lama
    const oldProduct = await db.query("SELECT * FROM products WHERE id=$1", [req.params.id]);
    if (oldProduct.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const image_url = oldProduct.rows[0].image_url;

    // hapus dari database
    await db.query("DELETE FROM products WHERE id=$1", [req.params.id]);

    // hapus file gambar kalau ada
    if (image_url) {
      const oldPath = path.join(__dirname, "..", image_url);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// cari produk berdasarkan nama (case-insensitive)
const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ message: "Keyword is required" });
    }

    const result = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE LOWER(p.name) LIKE LOWER($1)
       ORDER BY p.id ASC`,
      [`%${keyword}%`]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.json(result.rows);
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
