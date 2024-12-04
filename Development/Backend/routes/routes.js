const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController.js');
const authMiddleware = require("../middleware/authmiddleware.js");

// Authentication routes
router.post("/signUp", authController.signUp);
router.post("/login", authController.login);
router.post("/checkTokenExpiration", authController.checkTokenExpiration);
router.post("/logout",authMiddleware(), authController.logout);

module.exports = router;