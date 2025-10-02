const db = require("../config/db");

// Cek stok habis / hampir habis
const getLowStock = async (req, res) => {
  try {
    // threshold bisa disesuaikan, misal stock_available <= 5
    const threshold = parseInt(req.query.threshold) || 5;

    const result = await db.query(
      `SELECT bp.id as branch_product_id, bp.branch_id, bp.product_id, bp.stock_total, bp.stock_available, bp.stock_damaged,
              p.name as product_name, b.name as branch_name
       FROM branch_products bp
       JOIN products p ON bp.product_id = p.id
       JOIN branches b ON bp.branch_id = b.id
       WHERE bp.stock_available <= $1
       ORDER BY bp.stock_available ASC`,
      [threshold]
    );

    res.json({
      message: "Low stock products",
      data: result.rows,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getLowStock };
