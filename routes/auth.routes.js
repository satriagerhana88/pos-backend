const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register-superadmin', authController.registerSuperadmin); // opsional (biasanya pakai seed)
router.post('/login', authController.login);

module.exports = router;
