const { initializeKhaltiPayment,verifyKhaltiPayment } = require("../controllers/Khalti");
const prisma = require("../utils/prisma.js");

async function initializePayment(req, res) {
    try {
        const { workerId, projectId, totalSalary, month, year, website_url } = req.body;
      console.log(req.body);
        // Validate worker and project existence
        const worker = await prisma.worker.findUnique({ where: { id: workerId } });
        const project = await prisma.project.findUnique({ where: { id: projectId } });
    
        if (!worker || !project) {
          return res.status(404).json({ success: false, message: "Worker or project not found" });
        }
    
        // Create payment record in DB with pending status
        const payment = await prisma.payment.create({
          data: {
            workerId,
            projectId,
            totalSalary,
            month,
                year : parseInt(year),
            status: "pending",
          },
        });
    
        // Prepare Khalti Payment Data
        const paymentData = {
          return_url: `${process.env.BACKEND_URI}/api/verify-khalti`,
          website_url,
          amount: totalSalary,
          purchase_order_id: `${workerId}-${projectId}-${month}-${year}`,
          purchase_order_name: `Salary Payment - ${month} ${year}`,
        };
    
        // Call Khalti API to initiate payment
        const khaltiResponse = await initializeKhaltiPayment(paymentData);
        res.json({
          success: true,
          paymentId: payment.id,
          payment: khaltiResponse,
        });
      } catch (error) {
        console.error("Error in initialize-payment:", error);
        res.status(500).json({ success: false, message: "Payment initialization failed", error: error.message });
      }
  }
  
  const verifyPayment = async (req, res) => {
    try {
      console.log("Received Khalti Response:", req.query);
  
      const {
        pidx,
        transaction_id,
        total_amount,
        purchase_order_id,
        status
      } = req.query;
      console.log(req.query);
      if (status !== "Completed") {
        return res.status(400).json({ success: false, message: "Payment not completed" });
      }
  
      const khaltiResponse = await verifyKhaltiPayment(pidx);
      if (!khaltiResponse || khaltiResponse.status !== "Completed") {
        return res.status(400).json({ success: false, message: "Khalti verification failed" });
      }
  
      const [workerId, projectId, month, year] = purchase_order_id.split("-");
  
      const updatedPayment = await prisma.payment.updateMany({
        where: {
          workerId: parseInt(workerId),
          projectId: parseInt(projectId),
          month,
          year: parseInt(year),
          status: "pending",
        },
        data: {
          transactionId: transaction_id,
          pidx,
          status: "completed",
          paidAt: new Date(),
        },
      });
  
      if (updatedPayment.count === 0) {
        return res.status(404).json({ success: false, message: "No matching payment found" });
      }
  
      //Fetch all attendance records for the worker in the given month
      const startDate = new Date(year, month - 1, 1); 
      const endDate = new Date(year, month, 0, 23, 59, 59); 
  
      console.log(`Fetching attendance records for WorkerID: ${workerId}, ProjectID: ${projectId} between ${startDate} and ${endDate}`);
  
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          projectWorker: {
            workerId: parseInt(workerId),
            projectId: parseInt(projectId),
          },
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
      });
  
      console.log("Fetched Attendance Records:", attendanceRecords);
  
      if (attendanceRecords.length === 0) {
        return res.status(404).json({ success: false, message: "No attendance records found for this worker in the given month." });
      }
  
      //Update all attendance records to mark them as paid
      const updatedAttendance = await prisma.attendance.updateMany({
        where: {
          id: { in: attendanceRecords.map(att => att.id) },
        },
        data: {
          paymentStatus: "paid",
        },
      });
  
      const project = await prisma.project.findFirst({
        where: { id: parseInt(projectId) },
        include: {
          budgets: true,
        },
      });
      console.log(`Updated Attendance Count: ${project}`);

      //create a payment record in the transaction
      const transaction = await prisma.transaction.create({
        data: {
          // workerId: parseInt(workerId),
          budgetId: parseInt(project.budgets[0].id),
          type: "expense",
          category: "salary",
          note: `Salary Payment for ${month} ${year}`,
          amount: parseFloat(total_amount),
        },
      });

      const worker = await prisma.worker.findFirst({
        where: { id: parseInt(workerId) },
      });
      
      const message = `Payment of ${month} of ${worker.name} has been paid.`;

      const notification = await tx.notification.create({
        data: {
          userId: req.user.userId,
          message,
        },
      });
      notificationService(req.user.userId, "OnSite", message);
      
      return res.json({
        success: true,
        message: "Payment verified, updated in database, and attendance marked as paid",
        updatedPayment,
        updatedAttendance,
        transaction
      });
  
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ success: false, message: "Server error", error });
    }
  };
  
  



module.exports = { initializePayment,verifyPayment };
