const express = require("express");
const router = express.Router();
const { createRental } = require("../controllers/rental.controller");
const { verifyToken, permit } = require("../middlewares/auth.middleware");

// Hanya ADMIN_STORE yang boleh buat rental
router.post("/", verifyToken, permit("ADMIN_STORE"), createRental);

module.exports = router;
