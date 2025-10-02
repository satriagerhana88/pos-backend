const express = require("express");
const router = express.Router();
const { createAdminStore, getAdminStores } = require("../controllers/adminStore.controller");
const { verifyToken, isSuperAdmin } = require("../middlewares/auth.middleware");

// 📌 Buat admin store (hanya SUPER_ADMIN)
router.post("/", verifyToken, isSuperAdmin, createAdminStore);

// 📌 Ambil semua admin store
router.get("/", verifyToken, isSuperAdmin, getAdminStores);

module.exports = router;
