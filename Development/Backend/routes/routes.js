const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController.js');
const authMiddleware = require("../middleware/authmiddleware.js");
const projectController = require("../controllers/projectController.js");
const budgetController = require("../controllers/budgetController.js");
const attendanceController = require("../controllers/attendaceController.js");
const workerController = require("../controllers/workerController.js");
const vendorController = require("../controllers/vendorController.js");
const upload = workerController.upload;  

// Authentication routes
router.get("/", authController.root);
router.post("/user/signUp", authController.signUp);
router.post("/user/login", authController.login);
router.post("/logout", authMiddleware(), authController.logout);

// Project routes
router.get("/project", authMiddleware(), projectController.getProject);
router.post("/project/create", authMiddleware(), projectController.createProject);
router.post("/project/addWorker", authMiddleware(), projectController.addWorkerToProject);
router.post("/singleProject", authMiddleware(), projectController.projectById);

// Budget routes
router.get("/project/:id/budget", budgetController.getBudget);
router.post("/budget/add-transaction", authMiddleware(), budgetController.addTransaction);

// Attendance routes
router.post("/attendance", attendanceController.recordAttendance);

// Worker route (Fixing upload middleware)
router.post("/worker/addWorker", upload.single("image"), workerController.addWorker);
router.get("/worker", workerController.allWorkers);
router.get("/vendor", vendorController.allVendors);

module.exports = router;
