const { initializeKhaltiPayment,verifyKhaltiPayment } = require("../controllers/Khalti");
const prisma = require("../utils/prisma.js");

async function initializePayment(req, res) {
    try {
        const { workerId, projectId, totalSalary, month, year, website_url } = req.body;
    
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
            year,
            status: "pending",
          },
        });
    
        // Prepare Khalti Payment Data
        const paymentData = {
            return_url: "http://localhost:3099/api/verify-khalti",
          website_url,
          amount: totalSalary * 100,
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
        console.log("jello");
        const {
          pidx,
          transaction_id,
          total_amount,
          purchase_order_id,
          status
        } = req.query;
    
        console.log("Received Khalti Response:", req.query);
    
        // Check if payment is successful
        if (status !== "Completed") {
          return res.status(400).json({ success: false, message: "Payment not completed" });
        }
    
        // Verify with Khalti
        const khaltiResponse = await verifyKhaltiPayment(pidx);
    
        if (!khaltiResponse || khaltiResponse.status !== "Completed") {
          return res.status(400).json({ success: false, message: "Khalti verification failed" });
        }
 
        const [workerId, projectId, month, year] = purchase_order_id.split("-");
    
        // Update Payment Status in Database
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
    
        return res.json({ success: true, message: "Payment verified and updated in database", updatedPayment });
      } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, message: "Server error", error });
      }
};


module.exports = { initializePayment,verifyPayment };
