const db = require("../config/db");

// Ambil semua produk di cabang sendiri
const getMyBranchProducts = async (req, res) => {
  try {
    const branchId = req.user.branch_id;
    const result = await db.query(`
      SELECT bp.*, p.name AS product_name
      FROM branch_products bp
      JOIN products p ON bp.product_id = p.id
      WHERE bp.branch_id = $1 AND bp.is_active = true
      ORDER BY bp.id ASC
    `, [branchId]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ambil produk by ID, pastikan milik cabang sendiri
const getMyBranchProductById = async (req, res) => {
  try {
    const branchId = req.user.branch_id;
    const result = await db.query(`
      SELECT bp.*, p.name AS product_name
      FROM branch_products bp
      JOIN products p ON bp.product_id = p.id
      WHERE bp.id = $1 AND bp.branch_id = $2 AND bp.is_active = true
    `, [req.params.id, branchId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found in your branch" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update harga dan stok produk di cabang sendiri
const updateMyBranchProduct = async (req, res) => {
  try {
    const branchId = req.user.branch_id;
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
      WHERE id = $3 AND branch_id = $4 AND is_active = true
      RETURNING *
    `, [branch_price, stock_total, req.params.id, branchId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found or inactive" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getMyBranchProducts,
  getMyBranchProductById,
  updateMyBranchProduct
};
