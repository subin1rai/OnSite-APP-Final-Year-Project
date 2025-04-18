const express = require("express");
const router = express.Router();
const multer = require("multer");
const authController = require("../controllers/authController.js");
const authMiddleware = require("../middleware/authmiddleware.js");
const projectController = require("../controllers/projectController.js");
const budgetController = require("../controllers/budgetController.js");
const attendanceController = require("../controllers/attendaceController.js");
const chatController = require("../controllers/chatController.js");
const workerController = require("../controllers/workerController.js");
const vendorController = require("../controllers/vendorController.js");
const clientController = require("../controllers/clientController.js");
const taskController = require("../controllers/taskController.js");
const userController = require("../controllers/userController");
const notificationController = require("../controllers/notificationController");
const threeDModelController = require("../controllers/threeDModelController.js");
const {initializePayment,verifyPayment} = require("../controllers/paymentController");
const {uploadDocument,getAllDocument,deleteDocuments} = require("../controllers/documentController.js");
const {predictModel,constructionModel,} = require("../controllers/modelController.js");
const {getProjectTrialBalance} = require("../controllers/reportController.js");
const multiUpload = multer({ dest: "uploads/" });
const upload = workerController.upload;

// Authentication routes
router.get("/", authController.root);
router.post("/user/signUp", authController.signUp);
router.post("/user/login", authController.login);
router.post("/user/requestotp", authController.requestOTP);
router.post("/user/resetpassword", authController.resetPassword);
router.post("/user/verifyotp", authController.verifyOTP);
router.post("/logout", authMiddleware(), authController.logout);

// Project routes
router.get("/project", authMiddleware(), projectController.getProject);
router.post("/project/create",authMiddleware(),projectController.createProject);
router.post("/project/addWorker",authMiddleware(),projectController.addWorkerToProject);
router.post("/singleProject", projectController.projectById);
router.put("/shareProject", authMiddleware(), projectController.shareProject);
router.post("/projectDetails", projectController.projectDetails);
router.post("/updateStatus", projectController.updateStatus);
router.put("/projectDelete", projectController.deleteProject);

// Budget routes
router.get("/project/:id/budget", budgetController.getBudget);
router.post("/budget/add-transaction",authMiddleware(),budgetController.addTransaction);
router.post("/budget/transaction",authMiddleware(),budgetController.allTransaction);

// Attendance routes
router.post("/attendance", attendanceController.recordAttendance);
router.put("/attendace/updateShift", attendanceController.updateShift);

// Worker route
router.post("/worker/addWorker",authMiddleware(),upload.single("image"),workerController.addWorker);
router.get("/worker", authMiddleware(), workerController.allWorkers);
router.post("/workerDetails", authMiddleware(), workerController.workerDetails);
router.put("/removeWorker", workerController.removeWorker);

//vendor route
router.get("/vendor", authMiddleware(), vendorController.getAllVendors);
router.post("/addVendor",authMiddleware(),upload.single("image"),vendorController.addVendor);

//3D model
router.post("/upload3dmodel",authMiddleware(),upload.single("image"),threeDModelController.addModel);
router.post("/all3dModel", authMiddleware(), threeDModelController.getAllModel);

//chat
router.get("/chat/users", authMiddleware(), chatController.getChatUser);
router.post("/chat/sendRequest", authMiddleware(), chatController.sendRequest);
router.get("/chat/getRequest", authMiddleware(), chatController.getRequest);
router.post("/chat/acceptRequest",authMiddleware(),chatController.acceptRequest);
router.get("/chat/getfriends", authMiddleware(), chatController.getFriends);
router.post("/chat/sendMessage", authMiddleware(), chatController.sendMessage);
router.post("/chat/getMessage", authMiddleware(), chatController.getMessage);
router.put("/user/updateUser",authMiddleware(),upload.single("image"),userController.updateUser);
router.get("/user/getUser", authMiddleware(), userController.getuser);

//payments
router.post("/initialize-khalti", initializePayment);
router.get("/verify-khalti", verifyPayment);
router.post("/document/upload", multiUpload.array("files"), uploadDocument);
router.post("/allDocument", getAllDocument);
router.post("/document/delete", deleteDocuments);

//predictmodel
router.post("/predict", predictModel);
router.post("/construction", constructionModel);
router.get("/report", authMiddleware(), getProjectTrialBalance);
router.get("/client", authMiddleware(), clientController.clientData);
router.post("/register-builder", authMiddleware(), clientController.registerBuilder);

//task
router.post("/task/add", taskController.addTask);
router.post("/task", taskController.getTask);
router.put("/task/:id", taskController.updateTask);     
router.delete("/task/:id", taskController.deleteTask);   

router.get('/notification', authMiddleware(), notificationController.getNoficitation);
router.delete('/notification/:id', authMiddleware(), notificationController.deleteNotification);

module.exports = router;
