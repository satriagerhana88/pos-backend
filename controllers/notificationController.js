// controllers/notificationController.js
import pool from "../config/db.js";

// ✅ Ambil semua notifikasi berdasarkan user atau cabang
export const getNotifications = async (req, res) => {
  try {
    const { branch_id, user_id } = req.query;

    const query = `
      SELECT 
        n.id,
        n.branch_id,
        b.name AS branch_name,
        n.user_id,
        u.name AS user_name,
        n.title,
        n.message,
        n.type,
        n.is_read,
        n.created_at
      FROM notifications n
      LEFT JOIN branches b ON n.branch_id = b.id
      LEFT JOIN users u ON n.user_id = u.id
      WHERE 
        ($1::INT IS NULL OR n.branch_id = $1)
        AND ($2::INT IS NULL OR n.user_id = $2)
      ORDER BY n.created_at DESC
      LIMIT 50;
    `;

    const { rows } = await pool.query(query, [branch_id || null, user_id || null]);
    res.json(rows);
  } catch (error) {
    console.error("🔥 Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};
