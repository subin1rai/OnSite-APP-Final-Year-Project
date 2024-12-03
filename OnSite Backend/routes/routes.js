const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController.js');

// Authentication routes
router.post("/signUp", authController.signUp);
router.post("/login", authController.login);
router.post("/checkTokenExpiration", authController.checkTokenExpiration);
// router.post("/logout", authController.logout);

module.exports = router;