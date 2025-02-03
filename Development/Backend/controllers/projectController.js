const prisma = require("../utils/prisma.js");

const createProject = async (req, res) => {
  try {
    const { projectName, ownerName, budgetAmount, location, startDate, endDate } = req.body;
    const user = req.user;

    // Validate that all required fields are present
    if (!projectName || !ownerName || !budgetAmount || !location || !startDate || !endDate) {
     console.log(projectName, ownerName, budgetAmount, location, startDate, endDate);
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure startDate and endDate are valid Date objects
    if (isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Check if budgetAmount is a valid number
    if (isNaN(budgetAmount)) {
      return res.status(400).json({ message: "Invalid project value" });
    }

    if(user.role !== "builder") {
      return res.status(403).json({ message: "User not valid!" });
    }

    console.log("yes builder");

    // Check if project with the same name already exists
    const project = await prisma.project.findFirst({
      where: { projectName }
    });

    if (project) {
      return res.status(400).json({ message: "Project already exists!" });
    }

    // Create project and budget in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create new project in database
      const newProject = await prisma.project.create({
        data: {
          projectName,
          ownerName: "subin",  // Static value for ownerName
          builderId: req.user.userId,
          location,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: "onGoing"
        }
      });
      console.log("Project created:", newProject);

      // Create initial budget for the project
      const newBudget = await prisma.budget.create({
        data: {
          amount: budgetAmount,
          projectId: newProject.id
        }
      });

      return { newProject, newBudget };
    });

    return res.status(201).json({
      message: "Project created successfully",
      result,
      status: 201
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};


const getProject = async (req, res) => {
  try {
    const user = req.user;
    console.log("user id ho :",user);
    console.log(req.params.projectId);
    const project = await prisma.project.findMany({
      where: {
        builderId: user.userId
      },
    });
    return res.status(200).json(project);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {
  createProject,
  getProject
};