const db = require("../config/db");

// Create new rental
const createRental = async (req, res) => {
  const client = await db.connect(); // pakai transaction
  try {
    const {
      branch_id,
      customer_name,
      customer_address,
      customer_phone,
      customer_id_type,
      customer_id_number,
      customer_note,
      rental_date,
      return_date,
      discount_type,   // "NOMINAL" atau "PERCENT"
      discount_value,  // angka
      items,
      payments
    } = req.body;

    const created_by = req.user?.id; // dari token

    if (!branch_id || !customer_name || !rental_date || !return_date || !items || items.length === 0) {
      return res.status(400).json({ error: "branch_id, customer_name, rental_date, return_date, items required" });
    }

    await client.query("BEGIN");

    // Generate invoice_no
    const invoice_no = `INV-${Date.now()}`;

    // Insert ke rentals
    const rentalResult = await client.query(
      `INSERT INTO rentals (
        invoice_no, branch_id, rental_date, return_date, status,
        customer_name, customer_address, customer_phone,
        customer_id_type, customer_id_number, customer_note, created_by
      )
      VALUES ($1,$2,$3,$4,'ACTIVE',$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        invoice_no, branch_id, rental_date, return_date,
        customer_name, customer_address, customer_phone,
        customer_id_type, customer_id_number, customer_note, created_by
      ]
    );

    const rentalId = rentalResult.rows[0].id;

    let totalItems = 0;

    // Insert rental_items + update stok
    for (let item of items) {
      const { branch_product_id, product_id, qty_rented, price_per_item } = item;

      // cek stok
      const bp = await client.query(
        `SELECT stock_available FROM branch_products WHERE id=$1`,
        [branch_product_id]
      );
      if (bp.rows.length === 0) {
        throw new Error("Branch product not found");
      }
      if (bp.rows[0].stock_available < qty_rented) {
        throw new Error(`Not enough stock for product_id=${product_id}`);
      }

      // insert item
      const totalPrice = qty_rented * price_per_item;

      await client.query(
        `INSERT INTO rental_items (
          rental_id, branch_product_id, product_id, qty, price_per_day, total_price, status
        )
        VALUES ($1,$2,$3,$4,$5,$6,'OUT')`,
        [rentalId, branch_product_id, product_id, qty_rented, price_per_item, totalPrice]
      );

      // update stok
      await client.query(
        `UPDATE branch_products SET stock_available = stock_available - $1 WHERE id=$2`,
        [qty_rented, branch_product_id]
      );

      // inventory movement
      await client.query(
        `INSERT INTO inventory_movements (branch_product_id, qty, movement_type, rental_id)
         VALUES ($1,$2,'OUT',$3)`,
        [branch_product_id, qty_rented, rentalId]
      );

      totalItems += qty_rented * price_per_item;
    }

    // Hitung diskon
    let discountAmount = 0;
    if (discount_type && discount_value) {
      if (discount_type === "PERCENT") {
        discountAmount = (totalItems * discount_value) / 100;
      } else if (discount_type === "NOMINAL") {
        discountAmount = discount_value;
      }
    }

    const finalTotal = totalItems - discountAmount;

    // Update rentals dengan total
    await client.query(
      `UPDATE rentals SET total_amount=$1, discount_type=$2, discount_value=$3 WHERE id=$4`,
      [finalTotal, discount_type, discount_value, rentalId]
    );

    // Insert payments (jika ada)
    if (payments && payments.length > 0) {
      for (let pay of payments) {
        await client.query(
          `INSERT INTO payments (rental_id, amount, method) VALUES ($1,$2,$3)`,
          [rentalId, pay.amount, pay.method]
        );
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Rental created",
      rental_id: rentalId,
      invoice_no,
      total_items: totalItems,
      discount_amount: discountAmount,
      total_after_discount: finalTotal
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// Return rental
const returnRental = async (req, res) => {
  const { rentalId } = req.params;
  const { items } = req.body; // [{ branch_product_id, qty, is_damaged }]

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // 1. Cek rental status
    const rentalCheck = await client.query(
      "SELECT * FROM rentals WHERE id = $1 AND status = 'ACTIVE'",
      [rentalId]
    );
    if (rentalCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Rental not active or not found" });
    }

    // 2. Loop tiap item untuk update stok dan rental_items
    for (let item of items) {
      const { branch_product_id, qty, is_damaged } = item;

      // Update stock_available di branch_products
      await client.query(
        "UPDATE branch_products SET stock_available = stock_available + $1 WHERE id = $2",
        [qty, branch_product_id]
      );

      // Update rental_items (returned_quantity dan is_damaged)
      await client.query(
        `UPDATE rental_items
         SET returned_quantity = COALESCE(returned_quantity,0) + $1,
             is_damaged = $2
         WHERE rental_id = $3 AND branch_product_id = $4`,
        [qty, is_damaged, rentalId, branch_product_id]
      );

      // Optional: hitung denda jika rusak
      if (is_damaged) {
        await client.query(
          `UPDATE rentals
           SET total_denda = COALESCE(total_denda,0) + $1
           WHERE id = $2`,
          [100000, rentalId] // contoh denda per item rusak
        );
      }
    }

    // 3. Cek apakah semua item sudah dikembalikan
    const checkAllReturned = await client.query(
      `SELECT COUNT(*) AS not_returned
       FROM rental_items
       WHERE rental_id = $1 AND (returned_quantity IS NULL OR returned_quantity < qty)`,
      [rentalId]
    );

    if (parseInt(checkAllReturned.rows[0].not_returned) === 0) {
      // Semua item kembali → update rental status
      await client.query(
        "UPDATE rentals SET status = 'RETURNED' WHERE id = $1",
        [rentalId]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Rental returned successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// GET rental detail by ID
const getRentalById = async (req, res) => {
  const { id } = req.params;

  try {
    // Ambil rental utama
    const rentalResult = await db.query(
      `SELECT r.id, r.invoice_number, r.branch_id, r.customer_name, r.customer_address,
              r.customer_phone, r.customer_id_type, r.customer_id_number, r.customer_note,
              r.status, r.discount_type, r.discount_value, r.total_payment, r.total_denda,
              r.rental_date, r.return_date, r.created_at, r.updated_at,
              b.name AS branch_name
       FROM rentals r
       JOIN branches b ON r.branch_id = b.id
       WHERE r.id = $1`,
      [id]
    );

    if (rentalResult.rows.length === 0) {
      return res.status(404).json({ error: "Rental not found" });
    }

    const rental = rentalResult.rows[0];

    // Ambil item rental
    const itemsResult = await db.query(
      `SELECT ri.id AS rental_item_id, ri.branch_product_id, ri.qty, ri.returned_quantity,
              ri.is_damaged, ri.price_per_item,
              bp.branch_price, p.name AS product_name
       FROM rental_items ri
       JOIN branch_products bp ON ri.branch_product_id = bp.id
       JOIN products p ON bp.product_id = p.id
       WHERE ri.rental_id = $1`,
      [id]
    );

    rental.items = itemsResult.rows;

    res.json(rental);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createRental, returnRental, getRentalById };
