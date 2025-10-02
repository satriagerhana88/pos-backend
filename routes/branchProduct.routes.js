const express = require("express");
const router = express.Router();
const {
  getBranchProducts,
  getBranchProductById,
  createBranchProduct,
  updateBranchProduct,
  deleteBranchProduct
} = require("../controllers/branchProduct.controller");

const { verifyToken, isSuperAdmin } = require("../middlewares/auth.middleware");

// Semua route ini hanya untuk SUPER_ADMIN (atau bisa ditambah ADMIN_STORE)
router.get("/", verifyToken, isSuperAdmin, getBranchProducts);
router.get("/:id", verifyToken, isSuperAdmin, getBranchProductById);
router.post("/", verifyToken, isSuperAdmin, createBranchProduct);
router.put("/:id", verifyToken, isSuperAdmin, updateBranchProduct);
router.delete("/:id", verifyToken, isSuperAdmin, deleteBranchProduct);

module.exports = router;
