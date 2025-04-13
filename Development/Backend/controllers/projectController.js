const prisma = require("../utils/prisma.js");
const { notificationService } = require("./notificationController.js");

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

    if (
      !projectName ||
      !ownerName ||
      !budgetAmount ||
      !location ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

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
          ownerName,
          builderId: req.user.userId,
          location,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: "onGoing",
          isVisible: true,
        },
      });

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
        isVisible: true,
      },
      include: {
        projectWorkers: {
          include: {
            worker: true,
          },
        },
      },
    });
    if(!project) return res.status(404).json({message:"Project not found"});

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const projectById = async (req, res) => {
  try {
    const projectId = req.query?.id;
    if (!projectId) {
      return res.status(400).json({ message: "Project id is required" });
    }

    const projectData = await prisma.project.findFirst({
      where: { id: parseInt(projectId), isVisible: true },
      include: {
        budgets: true,
        projectWorkers: {
          include: {
            worker: true,
            attendance: true,
          },
        },
      },
    });

    if (!projectData) {
      return res.status(404).json({ message: "Project not found" });
    }

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
        budget: projectData.budgets.map((bb) => ({
          amount: bb.amount,
        })),
        worker: projectData.projectWorkers.map((pw) => ({
          id: pw.worker.id,
          projectWorkerId: pw.id,
          name: pw.worker.name,
          isVisible:pw.worker.isVisible,
          contact: pw.worker.contact,
          profile: pw.worker.profile,
          designation: pw.worker.designation,
          attendance: pw.attendance,
        })),
      },
    };
    return res.status(200).json(transformedProject);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addWorkerToProject = async (req, res) => {
  try {
    const { workerId, projectId } = req.body;

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

const shareProject = async (req, res) => {
  try {
    const username = req.user.username;

    const { projectId, shareId } = req.body;

    if (!projectId || !shareId) {
      return res.status(400).json({
        message: "Project ID and Share ID are required.",
      });
    }

    // Validate shared user
    const user = await prisma.user.findUnique({
      where: { shareid: parseInt(shareId) },
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid shareId." });
    }

    // Validate project
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId), isVisible: true },
    });

    if (!project) {
      return res
        .status(404)
        .json({ message: "Invalid project. Project not found." });
    }

    if (project.clientId) {
      return res
        .status(400)
        .json({ message: "This project already has a client assigned." });
    }

    const message = `Project ${project.projectName} has been shared with by ${username}.`;

    const [updatedProject, notification] = await prisma.$transaction([
      prisma.project.update({
        where: { id: parseInt(projectId) },
        data: { clientId: user.id },
      }),

      prisma.notification.create({
        data: {
          userId: user.id,
          message,
        },
      }),
    ]);

    // Send push notification outside transaction
    notificationService(user.id, "OnSite", message);

    return res.status(200).json({
      updatedProject,
      message: "User successfully added to the project.",
    });
  } catch (error) {
    console.error("Error adding user to project:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const projectDetails = async (req, res) => {
  try {
    const { projectId } = req.body;
    console.log(projectId);
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }
    const project = await prisma.project.findFirst({
      where: { id: parseInt(projectId), isVisible: true },
      include: {
        client: true,
      },
    });
    return res.status(200).json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { projectId, status } = req.body;
    if (!projectId || !status) {
      return res
        .status(400)
        .json({ message: "Project ID and status are required" });
    }
    const project = await prisma.project.findFirst({
      where: { id: parseInt(projectId) },
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const updatedProject = await prisma.project.update({
      where: { id: parseInt(projectId) },
      data: { status },
    });
    return res.status(200).json(updatedProject);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId)
      return res.status(400).json({ error: "Project Id not found" });
    const projectData = await prisma.project.findFirst({
      where: {
        id: projectId,
        isVisible: true
      },
    });

    if (!projectData)
      return res.status(400).json({ error: "Project data not found" });

    const result = await prisma.project.update({
      where: {
        id: projectData.id,
      },
      data:{
        isVisible:false
      }
    });

    return res.status(200).json({ message: "Project deleted successfully !" });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createProject,
  getProject,
  addWorkerToProject,
  projectById,
  shareProject,
  projectDetails,
  updateStatus,
  deleteProject,
};
