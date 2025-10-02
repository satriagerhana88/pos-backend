const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");

// Route terbuka
router.get("/public", (req, res) => {
  res.json({ message: "Ini route publik, tanpa login" });
});

// Route untuk user login (semua role boleh)
router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Ini route protected", user: req.user });
});

// Route khusus SUPER_ADMIN
router.get("/superadmin", authenticateToken, authorizeRoles("SUPER_ADMIN"), (req, res) => {
  res.json({ message: "Halo SUPER_ADMIN", user: req.user });
});

module.exports = router;
