const { response } = require("express");
const prisma = require("../utils/prisma.js");

const recordAttendance = async (req, res) => {
  try {
    const { id, date, status } = req.body;
    console.log(req.body);
    if (!id || !date ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const attendanceDate = new Date(date);

    const existingRecord = await prisma.attendance.findFirst({
      where: { projectWorkerId:id, date: attendanceDate },
    });

    if (existingRecord) {
        const updateAttendance = await prisma.attendance.create({
            data: {
              projectWorkerId:id,
              date: attendanceDate,
              status,
            },
          });

          return res.status(201).json({message: "Attendance updated successfully", updateAttendance});
    }

    const attendance = await prisma.attendance.create({
      data: {
        projectWorkerId:id,
        date: attendanceDate,
        status,
      },
    });

    return res.status(201).json(attendance);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
    recordAttendance
};
