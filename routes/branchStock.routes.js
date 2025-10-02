const express = require("express");
const router = express.Router();
const { addStock, stockOpname } = require("../controllers/branchStock.controller");
const { verifyToken, permit } = require("../middlewares/auth.middleware");

// Hanya ADMIN_STORE bisa akses
router.use(verifyToken, permit("ADMIN_STORE"));

// Tambah stock / update stock
router.post("/add-stock", addStock);

// Stock opname
router.post("/opname", stockOpname);

module.exports = router;
