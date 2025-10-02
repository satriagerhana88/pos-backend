const db = require("../config/db");

// Ambil semua branch product aktif
const getBranchProducts = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT bp.*, p.name AS product_name, b.name AS branch_name
      FROM branch_products bp
      JOIN products p ON bp.product_id = p.id
      JOIN branches b ON bp.branch_id = b.id
      WHERE bp.is_active = true
      ORDER BY bp.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ambil branch product by ID
const getBranchProductById = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT bp.*, p.name AS product_name, b.name AS branch_name
      FROM branch_products bp
      JOIN products p ON bp.product_id = p.id
      JOIN branches b ON bp.branch_id = b.id
      WHERE bp.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Branch product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tambah branch product
const createBranchProduct = async (req, res) => {
  try {
    const { branch_id, product_id, branch_price, stock_total } = req.body;

    const result = await db.query(`
      INSERT INTO branch_products (branch_id, product_id, branch_price, stock_total, stock_available)
      VALUES ($1,$2,$3,$4,$4) RETURNING *
    `, [branch_id, product_id, branch_price, stock_total]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update branch product
const updateBranchProduct = async (req, res) => {
  try {
    const { branch_price, stock_total } = req.body;

    // cek apakah produk sedang disewa
    const rentalCheck = await db.query(`
      SELECT ri.id
      FROM rental_items ri
      JOIN rentals r ON ri.rental_id = r.id
      WHERE ri.branch_product_id = $1 AND r.status = 'ON_RENT'
    `, [req.params.id]);

    if (rentalCheck.rows.length > 0) {
      return res.status(400).json({ error: "Cannot update product while rented" });
    }

    const result = await db.query(`
      UPDATE branch_products
      SET branch_price = $1, stock_total = $2, stock_available = $2
      WHERE id = $3 AND is_active = true
      RETURNING *
    `, [branch_price, stock_total, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Branch product not found or inactive" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Soft delete branch product
const deleteBranchProduct = async (req, res) => {
  try {
    // cek apakah produk sedang disewa
    const rentalCheck = await db.query(`
      SELECT ri.id
      FROM rental_items ri
      JOIN rentals r ON ri.rental_id = r.id
      WHERE ri.branch_product_id = $1 AND r.status = 'ON_RENT'
    `, [req.params.id]);

    if (rentalCheck.rows.length > 0) {
      // soft delete
      await db.query(`
        UPDATE branch_products
        SET is_active = false
        WHERE id = $1
      `, [req.params.id]);
      return res.json({ message: "Product is currently rented. Soft deleted." });
    }

    // hapus permanen
    await db.query("DELETE FROM branch_products WHERE id=$1", [req.params.id]);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getBranchProducts,
  getBranchProductById,
  createBranchProduct,
  updateBranchProduct,
  deleteBranchProduct,
};
