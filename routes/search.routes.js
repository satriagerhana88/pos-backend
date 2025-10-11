const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  try {

    const searchQuery = `
      SELECT 
        p.id, 
        p.name, 
        c.name AS category_name, 
        bp.stock_available AS stock, 
        bp.branch_price AS price, 
        b.name AS branch_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN branch_products bp ON bp.product_id = p.id
      LEFT JOIN branches b ON b.id = bp.branch_id
      WHERE p.name ILIKE $1
      ORDER BY p.name ASC
    `;

    const result = await pool.query(searchQuery, [`%${q}%`]);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Search error detail:", err);
    res.status(500).json({
      message: "Search failed",
      error: err.message,
      stack: err.stack, // tambahkan ini untuk lihat baris error
    });
  }
});

module.exports = router;


// const express = require("express");
// const router = express.Router();
// const pool = require("../config/db");

// router.get("/", async (req, res) => {
//   const { q } = req.query;
//   if (!q) return res.json([]);

//   try {
//     // --- Search di Produk ---
//     const productQuery = `
//       SELECT 
//         p.id, 
//         p.name, 
//         COALESCE(c.name, '-') AS category_name, 
//         COALESCE(bp.stock_available, 0) AS stock, 
//         COALESCE(bp.branch_price, 0) AS price, 
//         COALESCE(b.name, '-') AS branch_name,
//         'product' AS type
//       FROM products p
//       LEFT JOIN categories c ON c.id = p.category_id
//       LEFT JOIN branch_products bp ON bp.product_id = p.id
//       LEFT JOIN branches b ON b.id = bp.branch_id
//       WHERE p.name ILIKE $1
//       ORDER BY p.name ASC
//     `;

//     // --- Search di Rentals (invoice / customer) ---
//     const rentalQuery = `
//       SELECT 
//         r.id, 
//         r.invoice_id AS name, 
//         c.name AS customer_name,
//         r.start_date, 
//         r.end_date, 
//         r.total_amount AS price,
//         'rental' AS type
//       FROM rentals r
//       LEFT JOIN customers c ON c.id = r.customer_id
//       WHERE r.invoice_id ILIKE $1 OR c.name ILIKE $1
//       ORDER BY r.created_at DESC
//     `;

//     const [productResult, rentalResult] = await Promise.all([
//       pool.query(productQuery, [`%${q}%`]),
//       pool.query(rentalQuery, [`%${q}%`]),
//     ]);

//     const combined = [...productResult.rows, ...rentalResult.rows];
//     res.json(combined);

//   } catch (err) {
//     console.error("❌ Search error detail:", err);
//     res.status(500).json({ message: "Search failed", error: err.message });
//   }
// });

// module.exports = router;



