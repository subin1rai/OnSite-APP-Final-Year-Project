const prisma = require("../utils/prisma.js");

const recordAttendance = async (req, res) => {
  try {
    const { id, date, status } = req.body;
    console.log("Received Request:", req.body);

    if (!id || !date || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const attendanceDate = new Date(date);

    // Check if an attendance record already exists
    const existingRecord = await prisma.attendance.findFirst({
      where: { projectWorkerId: id, date: attendanceDate },
    });

    if (existingRecord) {
      // ✅ If a record exists, UPDATE it instead of creating a new one
      const updatedAttendance = await prisma.attendance.update({
        where: { id: existingRecord.id }, // ✅ Update the existing record
        data: { status },
      });

      return res
        .status(200)
        .json({ message: "Attendance updated successfully", updatedAttendance });
    }

    // ✅ If no record exists, create a new one
    const newAttendance = await prisma.attendance.create({
      data: {
        projectWorkerId: id,
        date: attendanceDate,
        status,
      },
    });

    return res.status(201).json({ message: "Attendance recorded", newAttendance });
  } catch (error) {
    console.error("Error recording attendance:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  recordAttendance,
};
