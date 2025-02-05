const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController.js');
const authMiddleware = require("../middleware/authmiddleware.js");
const projectController = require("../controllers/projectController.js");
const budgetController = require("../controllers/budgetController.js");
const attendanceController  = require("../controllers/attendaceController.js");

// Authentication routes
router.get("/", authController.root);
router.post("/user/signUp", authController.signUp);
router.post("/user/login", authController.login);
router.post("/logout",authMiddleware(), authController.logout);

// Project routes
router.get("/project",authMiddleware(), projectController.getProject);
router.post("/project/create",authMiddleware(), projectController.createProject);
router.post("/project/addWorker",authMiddleware(), projectController.addWorkerToProject);
router.post("/singleProject",authMiddleware(), projectController.projectById);

//budget routes
router.get("/project/:id/budget", budgetController.getBudget);
router.get("/budget", authMiddleware(),(req,res)=>{
    res.send("This is the budget route");
});

//attendance 
router.post("/attendance", attendanceController.recordAttendance);


module.exports = router;