const NotificationModel = require("../models/notification.model");

// ===== SERVICE UNTUK LOGIKA TAMBAHAN =====

// Buat notifikasi baru (misal dari event stok habis)
const createNotification = async (message, type = "info") => {
  try {
    const notif = await NotificationModel.create(message, type);
    console.log("✅ Notifikasi dibuat:", notif.message);
    return notif;
  } catch (err) {
    console.error("❌ Gagal membuat notifikasi:", err.message);
  }
};

module.exports = {
  createNotification,
};
