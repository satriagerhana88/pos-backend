// // routes/notifications.js
// const express = require("express");
// const { getNotifications, getUnreadNotifications, markAsRead } = require("../controllers/notificationController");

// const router = express.Router();

// // // GET /api/notifications
// router.get("/", getNotifications);

// module.exports = router;

const express = require("express");
const {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

// === ROUTES UNTUK NOTIFIKASI ===
router.get("/", getNotifications);
router.get("/unread", getUnreadNotifications);
router.put("/:id/read", markAsRead);

module.exports = router;

