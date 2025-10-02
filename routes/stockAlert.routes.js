const express = require("express");
const router = express.Router();
const { getLowStock } = require("../controllers/stockAlert.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// endpoint: cek stok hampir habis
router.get("/low-stock", verifyToken, getLowStock);

module.exports = router;
