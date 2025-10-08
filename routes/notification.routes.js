// routes/notifications.js
const express = require("express");
const { getNotifications } = require("../controllers/notificationController");

const router = express.Router();

// GET /api/notifications
router.get("/", getNotifications);

module.exports = router;
