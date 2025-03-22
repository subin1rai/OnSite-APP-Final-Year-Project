const prisma = require("../utils/prisma.js");

const createProject = async (req, res) => {
  try {
    const {
      projectName,
      ownerName,
      budgetAmount,
      location,
      startDate,
      endDate,
    } = req.body;
    const user = req.user;

    // Validate that all required fields are present
    if (
      !projectName ||
      !ownerName ||
      !budgetAmount ||
      !location ||
      !startDate ||
      !endDate
    ) {
      console.log(
        projectName,
        ownerName,
        budgetAmount,
        location,
        startDate,
        endDate
      );
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure startDate and endDate are valid Date objects
    if (
      isNaN(new Date(startDate).getTime()) ||
      isNaN(new Date(endDate).getTime())
    ) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Check if budgetAmount is a valid number
    if (isNaN(budgetAmount)) {
      return res.status(400).json({ message: "Invalid project value" });
    }

    if (user.role !== "builder") {
      return res.status(403).json({ message: "User not valid!" });
    }

    console.log("yes builder");

    // Check if project with the same name already exists
    const project = await prisma.project.findFirst({
      where: { projectName },
    });

    if (project) {
      return res.status(400).json({ message: "Project already exists!" });
    }

    const result = await prisma.$transaction(async (prisma) => {
      const newProject = await prisma.project.create({
        data: {
          projectName,
          ownerName: "subin", 
          builderId: req.user.userId,
          location,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: "onGoing",
        },
      });
      console.log("Project created:", newProject);

      // Create initial budget for the project
      const newBudget = await prisma.budget.create({
        data: {
          amount: budgetAmount,
          projectId: newProject.id,
        },
      });

      return { newProject, newBudget };
    });

    return res.status(201).json({
      message: "Project created successfully",
      result,
      status: 201,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getProject = async (req, res) => {
  try {
    const user = req.user;
    const project = await prisma.project.findMany({
      where: {
        builderId: user.userId,
      },
      include: {
        projectWorkers: {
          include: {
            worker: true,
          },
        },
      },
    });
    return res.status(200).json(project);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const projectById = async (req, res) => {
  try {
    const projectId = req.query?.id;
    
    if (!projectId) {
      return res.status(400).json({ message: "Project id is required" });
    }

    console.log("Project ID:", projectId);

    const projectData = await prisma.project.findFirst({
      where: { id: parseInt(projectId) },
      include: {
        budgets: true,
        projectWorkers: {
          include: {
            worker: true,
            attendance: true
          },
        },
      },
    });

    if (!projectData) {
      return res.status(404).json({ message: "Project not found" });
    }
    console.log(projectData)

    // Transform the data structure
    const transformedProject = {
      project: {
        id: projectData.id,
        projectName: projectData.projectName,
        ownerName: projectData.ownerName,
        location: projectData.location,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        status: projectData.status,
        builderId: projectData.builderId,
        createdAt: projectData.createdAt,
        updatedAt: projectData.updatedAt,
        budget:  projectData.budgets.map(bb=>({
          amount: bb.amount
        })),
        worker: projectData.projectWorkers.map(pw => ({
          id: pw.worker.id,
          projectWorkerId: pw.id,
          name: pw.worker.name,
          contact: pw.worker.contact,
          profile: pw.worker.profile,
          designation: pw.worker.designation,
          attendance: pw.attendance
        }))
      }
    };
console.log("project data",transformedProject);
    return res.status(200).json(transformedProject);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addWorkerToProject = async (req, res) => {
  try {
    const { workerId, projectId } = req.body;
    console.log(workerId, projectId);

    // Create a new join record in the ProjectWorker table
    const projectWorker = await prisma.projectWorker.create({
      data: {
        project: { connect: { id: parseInt(projectId) } },
        worker: { connect: { id: parseInt(workerId) } },
        
      },
    });
    return res.status(200).json(projectWorker);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server error" });
  }
};

module.exports = {
  createProject,
  getProject,
  addWorkerToProject,
  projectById,
};
