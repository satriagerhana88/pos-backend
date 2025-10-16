const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  try {
    // --- Search Produk ---
    const productQuery = `
      SELECT 
        p.id,
        p.product_code,
        p.name,
        p.description,
        p.rental_price,
        p.image_url,
        COALESCE(c.name, '-') AS category_name,
        COALESCE(bp.stock_total, 0) AS stock_total,
        COALESCE(bp.stock_available, 0) AS stock_available,
        COALESCE(bp.stock_damaged, 0) AS stock_damaged,
        COALESCE(bp.branch_price, 0) AS branch_price,
        COALESCE(b.name, '-') AS branch_name,
        'product' AS type
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN branch_products bp ON bp.product_id = p.id
      LEFT JOIN branches b ON b.id = bp.branch_id
      WHERE p.name ILIKE $1 OR p.product_code ILIKE $1
      ORDER BY p.name ASC
    `;

    // --- Search Rental ---
    const rentalQuery = `
      SELECT 
        r.id,
        r.invoice_no,
        r.customer_name,
        r.customer_phone,
        r.customer_address,
        r.customer_id_type,
        r.customer_id_number,
        r.customer_note,
        r.rental_date,
        r.return_date,
        r.actual_return,
        r.status,
        r.discount_type,
        r.discount_value,
        r.total_amount,
        r.final_amount,
        r.created_at,
        'rental' AS type
      FROM rentals r
      WHERE r.invoice_no ILIKE $1 OR r.customer_name ILIKE $1
      ORDER BY r.created_at DESC
    `;

    const [productResult, rentalResult] = await Promise.all([
      pool.query(productQuery, [`%${q}%`]),
      pool.query(rentalQuery, [`%${q}%`]),
    ]);

    const combined = [...productResult.rows, ...rentalResult.rows];
    res.json(combined);

  } catch (err) {
    console.error("❌ Search error detail:", err.stack);
    res.status(500).json({ message: "Search failed", error: err.message });
  }
});

module.exports = router;


