const express = require("express");
const router = express.Router();
const {
  getMyBranchProducts,
  getMyBranchProductById,
  updateMyBranchProduct
} = require("../controllers/branchProductAdmin.controller");

const { verifyToken, permit } = require("../middlewares/auth.middleware");

// Hanya ADMIN_STORE bisa akses
router.use(verifyToken, permit("ADMIN_STORE"));

// Ambil semua produk cabang sendiri
router.get("/", getMyBranchProducts);
// Ambil produk by ID cabang sendiri
router.get("/:id", getMyBranchProductById);
// Update harga & stok produk cabang sendiri
router.put("/:id", updateMyBranchProduct);

module.exports = router;
