const db = require("../config/db");

// Create Stock Opname
const createStockOpname = async (req, res) => {
  const { branch_id, note, items } = req.body; 
  // items: [{ branch_product_id, stock_fisik }]

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // 1. Insert stock_opnames
    const opnameResult = await client.query(
      `INSERT INTO stock_opnames (branch_id, note)
       VALUES ($1, $2) RETURNING *`,
      [branch_id, note]
    );
    const opnameId = opnameResult.rows[0].id;

    // 2. Loop items: insert stock_opname_items & update branch_products
    for (let item of items) {
      const { branch_product_id, stock_fisik } = item;

      // Ambil stock_total saat ini
      const branchProduct = await client.query(
        "SELECT stock_total, stock_available FROM branch_products WHERE id=$1",
        [branch_product_id]
      );

      if (branchProduct.rows.length === 0) {
        throw new Error(`Branch product ${branch_product_id} not found`);
      }

      const stock_total = branchProduct.rows[0].stock_total;
      const stock_available = branchProduct.rows[0].stock_available;

      const selisih = stock_fisik - stock_total;

      // Insert ke stock_opname_items
      await client.query(
        `INSERT INTO stock_opname_items 
         (stock_opname_id, branch_product_id, stock_fisik, stock_db, selisih)
         VALUES ($1,$2,$3,$4,$5)`,
        [opnameId, branch_product_id, stock_fisik, stock_total, selisih]
      );

      // Update branch_products stock_total & stock_available
      await client.query(
        `UPDATE branch_products 
         SET stock_total = $1, stock_available = $1 
         WHERE id = $2`,
        [stock_fisik, branch_product_id]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Stock opname created successfully", stock_opname: opnameResult.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// Get all stock opname (optional)
const getStockOpnames = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT so.*, b.name AS branch_name 
       FROM stock_opnames so
       JOIN branches b ON so.branch_id = b.id
       ORDER BY so.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get stock opname detail by ID
const getStockOpnameById = async (req, res) => {
  const { id } = req.params;
  try {
    const opnameResult = await db.query(
      `SELECT so.*, b.name AS branch_name 
       FROM stock_opnames so
       JOIN branches b ON so.branch_id = b.id
       WHERE so.id = $1`,
      [id]
    );

    if (opnameResult.rows.length === 0) {
      return res.status(404).json({ error: "Stock opname not found" });
    }

    const itemsResult = await db.query(
      `SELECT soi.*, bp.product_id, p.name AS product_name
       FROM stock_opname_items soi
       JOIN branch_products bp ON soi.branch_product_id = bp.id
       JOIN products p ON bp.product_id = p.id
       WHERE soi.stock_opname_id = $1`,
      [id]
    );

    const stock_opname = opnameResult.rows[0];
    stock_opname.items = itemsResult.rows;

    res.json(stock_opname);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Soft delete stock opname
const deleteStockOpname = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(
      "UPDATE stock_opnames SET is_active=false WHERE id=$1",
      [id]
    );
    res.json({ message: "Stock opname soft deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createStockOpname,
  getStockOpnames,
  getStockOpnameById,
  deleteStockOpname
};
