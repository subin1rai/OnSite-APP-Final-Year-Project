const prisma = require("../utils/prisma.js");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const { PaymentStatus } = require("@prisma/client");

// Multer Configuration (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const addWorker = async (req, res) => {
  try {
    const { name, contact, designation, salary } = req.body;
    const user = req.user.userId;
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload to Cloudinary
    cloudinary.uploader
      .upload_stream({ folder: "uploads" }, async (error, result) => {
        if (error) {
          return res.status(500).json({ error: "Upload to Cloudinary failed" });
        }

        const savedWorker = await prisma.worker.create({
          data: {
            name: name,
            contact: contact,
            profile: result.secure_url,
            designation: designation,
            salary: salary,
            builderId: user,
            isVisible: true,
          },
        });

        res.json({
          message: "Upload successful",
          savedWorker,
        });
      })
      .end(req.file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const allWorkers = async (req, res) => {
  try {
    const user = req.user.userId;
    const workers = await prisma.worker.findMany({
      where: {
        isVisible: true,
        builderId: user
      },
    });

    return res
      .status(200)
      .json({ message: "All workers", status: 200, workers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const workerDetails = async (req, res) => {
  try {
    const { workerId, projectId } = req.body;
    if (!workerId || !projectId) {
      return res
        .status(400)
        .json({ error: "Worker ID and Project ID are required" });
    }

    const workerData = await prisma.worker.findFirst(
      {where:{
        id:workerId,
        isVisible:true
      }}
    )
    console.log(workerData);
    if(!workerData) return res.status(402).json({error:"Worker not found"});

    const worker = await prisma.worker.findUnique({
      where: { id: workerId, isVisible:true},
      include: {
        projectWorkers: {
          where: { projectId: projectId },
          include: {
            attendance: {
              select: {
                date: true,
                status: true,
                shifts: true,
                paymentStatus: true,
              },
            },
          },
        },
      },
    });

    if (!worker || worker.projectWorkers.length === 0) {
      return res
        .status(404)
        .json({ error: "No attendance found for this worker in this project" });
    }

    // Group attendance by month
    const attendanceByMonth = {};
    const salaryByMonth = {};
    const summaryByMonth = {};

    worker.projectWorkers[0].attendance.forEach((record) => {
      const date = new Date(record.date);
      const year = date.getFullYear();
      const monthName = date.toLocaleString("default", { month: "long" });
      const monthKey = `${year}-${monthName}`;

      if (!attendanceByMonth[monthKey]) {
        attendanceByMonth[monthKey] = [];
        salaryByMonth[monthKey] = 0;
        summaryByMonth[monthKey] = { totalPresent: 0, totalAbsent: 0 };
      }

      // ✅ Ensure `paymentStatus` is included in the response
      attendanceByMonth[monthKey].push({
        date: record.date,
        status: record.status,
        shifts: record.shifts || 0,
        paymentStatus: record.paymentStatus || "pending"
      });

      // Calculate salary (1000 per shift assumption)
      if (record.status === "present") {
        summaryByMonth[monthKey].totalPresent++;
        salaryByMonth[monthKey] += (record.shifts || 0) * 1000;
      } else {
        summaryByMonth[monthKey].totalAbsent++;
      }
    });

    return res.status(200).json({
      workerId: worker.id,
      name: worker.name,
      designation: worker.designation,
      attendanceByMonth,
      salaryByMonth,
      summaryByMonth,
    });
  } catch (error) {
    console.error("Error fetching worker details:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const removeWorker = async (req, res) => {
  try {
    const { workerId } = req.body;
    console.log(workerId);
    if (!workerId)
      return res.status(400).json({ error: "Worker Id is requiered" });
    const workerData = await prisma.worker.findFirst({
      where: {
        id: workerId,
        isVisible: true,
      },
    });
    if (!workerData) return res.status(400).json({ error: "Worker not found" });
    const result = await prisma.worker.update({
      where: {
        id: workerData.id,
      },
      data: {
        isVisible: false,
      },
    });
    return res.status(200).json({
      message: "Worker Delelted Successfully!",
    });
  } catch (error) {
    console.error("Error fetching worker details:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { upload, addWorker, allWorkers, workerDetails, removeWorker };
