const cron = require("node-cron");
const db = require("../config/db");
const { createNotification } = require("../services/notification.service");

// === JOB UNTUK MEMERIKSA STOK HABIS DAN OTOMATIS BUAT NOTIFIKASI ===
cron.schedule("0 * * * *", async () => {
  console.log("⏰ Mengecek stok cabang...");

  try {
    const result = await db.query(`
      SELECT bp.id, p.name AS product_name, b.name AS branch_name, bp.stock_available
      FROM branch_products bp
      JOIN products p ON bp.product_id = p.id
      JOIN branches b ON bp.branch_id = b.id
      WHERE bp.stock_available <= 2
    `);

    for (const row of result.rows) {
      const msg = `Stok hampir habis untuk ${row.product_name} di cabang ${row.branch_name} (tersisa ${row.stock_available})`;
      await createNotification(msg, "warning");
    }

    console.log("✅ Pemeriksaan stok selesai.");
  } catch (err) {
    console.error("❌ Gagal memeriksa stok:", err.message);
  }
});
