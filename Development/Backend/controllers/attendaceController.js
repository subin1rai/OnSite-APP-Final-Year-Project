const prisma = require("../utils/prisma.js");

const recordAttendance = async (req, res) => {
  try {
    const { id, date, status, shifts } = req.body;
    if (!id || !date || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const attendanceDate = new Date(date);
    const existingRecord = await prisma.attendance.findFirst({
      where: { projectWorkerId: id, date: attendanceDate },
    });

    if (existingRecord) {
      const updatedAttendance = await prisma.attendance.update({
        where: { id: existingRecord.id },
        data: { status },
      });

      return res
        .status(200)
        .json({
          message: "Attendance updated successfully",
          updatedAttendance,
        });
    }

    const newAttendance = await prisma.attendance.create({
      data: {
        projectWorkerId: id,
        date: attendanceDate,
        status,
        shifts: parseFloat(shifts ? shifts : 1),
      },
    });

    return res
      .status(201)
      .json({ message: "Attendance recorded", newAttendance });
    } catch (error) {
      console.error("Error recording attendance:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  
  const updateShift = async(req,res)=>{
    try {
      const { id, shifts} = req.body;
      console.log(req.body);
      if (!id ||!shifts) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const updatedShift = await prisma.attendance.update({
        where: { id: parseInt(id) },
        data: { shifts: parseFloat(shifts) },
      });
      console.log(updatedShift);
      return res
        .status(201)
        .json({ message: "Attendance updated", updatedShift });

  } catch (error) {
    console.error("Error recording attendance:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  recordAttendance,
  updateShift
};
