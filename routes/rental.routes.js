const express = require("express");
const router = express.Router();
const { createRental, returnRental, getRentalById } = require("../controllers/rental.controller");
const { verifyToken, permit } = require("../middlewares/auth.middleware");

// ADMIN_STORE dan KASIR_STORE boleh buat rental
router.post("/", verifyToken, permit("ADMIN_STORE", "KASIR_STORE"), createRental);

// ADMIN_STORE dan KASIR_STORE boleh return rental
router.post("/:rentalId/return", verifyToken, permit("ADMIN_STORE", "KASIR_STORE"), returnRental);

// ADMIN_STORE, KASIR_STORE, atau SUPER_ADMIN bisa lihat detail rental
router.get("/:id", verifyToken, permit("ADMIN_STORE", "KASIR_STORE", "SUPER_ADMIN"), getRentalById);

module.exports = router;
