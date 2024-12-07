const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController.js');
const authMiddleware = require("../middleware/authmiddleware.js");
const projectController = require("../controllers/projectController.js");
const budgetController = require("../controllers/budgetController.js");
// Authentication routes
router.get("/", authController.root);
router.post("/user/signUp", authController.signUp);
router.post("/user/login", authController.login);
router.post("/logout",authMiddleware(), authController.logout);

// Project routes
router.post("/project/create",authMiddleware(), projectController.createProject);

//budget routes
router.get("/project/:id/budget", budgetController.getBudget);
module.exports = router;