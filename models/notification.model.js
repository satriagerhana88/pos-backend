const db = require("../config/db");

// ===== MODEL UNTUK NOTIFIKASI =====
const NotificationModel = {
  // Ambil semua notifikasi
  async getAll() {
    const result = await db.query(
      "SELECT * FROM notifications ORDER BY created_at DESC"
    );
    return result.rows;
  },

  // Ambil notifikasi yang belum dibaca
  async getUnread() {
    const result = await db.query(
      "SELECT * FROM notifications WHERE is_read = false ORDER BY created_at DESC"
    );
    return result.rows;
  },

  // Tandai notifikasi sebagai sudah dibaca
  async markAsRead(id) {
    const result = await db.query(
      "UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },

  // Buat notifikasi baru
  async create(message, type = "info") {
    const result = await db.query(
      "INSERT INTO notifications (message, type, is_read, created_at) VALUES ($1, $2, false, NOW()) RETURNING *",
      [message, type]
    );
    return result.rows[0];
  },
};

module.exports = NotificationModel;
