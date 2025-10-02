const db = require("../config/db");

// Tambah stock / update stock branch product
const addStock = async (req, res) => {
  try {
    const branchId = req.user.branch_id;
    const { branch_product_id, qty, note } = req.body;

    // cek apakah branch product memang milik cabang ini
    const bpCheck = await db.query(
      `SELECT * FROM branch_products WHERE id=$1 AND branch_id=$2`,
      [branch_product_id, branchId]
    );

    if (bpCheck.rows.length === 0) {
      return res.status(404).json({ error: "Branch product not found" });
    }

    // update stock
    const newStockTotal = bpCheck.rows[0].stock_total + qty;
    const newStockAvailable = bpCheck.rows[0].stock_available + qty;

    await db.query(
      `UPDATE branch_products 
       SET stock_total=$1, stock_available=$2 
       WHERE id=$3`,
      [newStockTotal, newStockAvailable, branch_product_id]
    );

    // simpan ke inventory_movements
    await db.query(
      `INSERT INTO inventory_movements
       (branch_product_id, product_id, branch_id, qty, movement_type, created_by, note)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        branch_product_id,
        bpCheck.rows[0].product_id,
        branchId,
        qty,
        "STOCK_IN",
        req.user.id,
        note || null
      ]
    );

    res.json({ message: "Stock updated successfully", branch_product_id, qty_added: qty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Stock opname (cek fisik, hitung selisih)
const stockOpname = async (req, res) => {
  try {
    const branchId = req.user.branch_id;
    const { items, note } = req.body; 
    // items = [{ branch_product_id, counted_qty }]

    // buat opname master
    const opnameRes = await db.query(
      `INSERT INTO stock_opnames (branch_id, performed_by, note) VALUES ($1,$2,$3) RETURNING id`,
      [branchId, req.user.id, note || null]
    );

    const opnameId = opnameRes.rows[0].id;

    for (const item of items) {
      const bp = await db.query(
        `SELECT * FROM branch_products WHERE id=$1 AND branch_id=$2`,
        [item.branch_product_id, branchId]
      );
      if (!bp.rows.length) continue;

      const expected = bp.rows[0].stock_total;
      const counted = item.counted_qty;
      const variance = counted - expected;
      let action = null;

      // jika ada selisih, update stock
      if (variance !== 0) {
        const newStockAvailable = bp.rows[0].stock_available + variance;
        await db.query(
          `UPDATE branch_products SET stock_total=$1, stock_available=$2 WHERE id=$3`,
          [counted, newStockAvailable, item.branch_product_id]
        );

        action = variance > 0 ? "ADJUST_IN" : "ADJUST_OUT";

        // simpan ke inventory_movements
        await db.query(
          `INSERT INTO inventory_movements
           (branch_product_id, product_id, branch_id, qty, movement_type, created_by, note)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            item.branch_product_id,
            bp.rows[0].product_id,
            branchId,
            Math.abs(variance),
            action,
            req.user.id,
            `Stock opname${note ? ": " + note : ""}`
          ]
        );
      }

      // simpan ke stock_opname_items
      await db.query(
        `INSERT INTO stock_opname_items (opname_id, branch_product_id, expected_qty, counted_qty, action)
         VALUES ($1,$2,$3,$4,$5)`,
        [opnameId, item.branch_product_id, expected, counted, action]
      );
    }

    res.json({ message: "Stock opname completed", opname_id: opnameId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addStock, stockOpname };
