const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController.js');
const authMiddleware = require("../middleware/authmiddleware.js");

// Authentication routes
router.get("/", authController.root);
router.post("/user/signUp", authController.signUp);
router.post("/user/login", authController.login);
router.post("/user/checkTokenExpiration", authController.checkTokenExpiration);
router.post("/logout",authMiddleware(), authController.logout);

module.exports = router;