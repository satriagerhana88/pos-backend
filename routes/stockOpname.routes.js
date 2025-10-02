const express = require("express");
const router = express.Router();
const { 
  createStockOpname, 
  getStockOpnames, 
  getStockOpnameById, 
  deleteStockOpname 
} = require("../controllers/stockOpname.controller");

const { verifyToken, permit } = require("../middlewares/auth.middleware");

// Hanya ADMIN_STORE dan SUPER_ADMIN
router.post("/", verifyToken, permit("ADMIN_STORE","SUPER_ADMIN"), createStockOpname);
router.get("/", verifyToken, permit("ADMIN_STORE","SUPER_ADMIN"), getStockOpnames);
router.get("/:id", verifyToken, permit("ADMIN_STORE","SUPER_ADMIN"), getStockOpnameById);
router.delete("/:id", verifyToken, permit("ADMIN_STORE","SUPER_ADMIN"), deleteStockOpname);

module.exports = router;
