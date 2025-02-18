const prisma = require("../utils/prisma");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");

// Multer Configuration (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const addModel = async (req, res) => {
  try {
    const { projectId, modelName, modelUrl } = req.body;
    const userId = req.user.userId;

    if (!userId || !projectId || !modelName || !modelUrl || !req.file) {
      return res.status(400).json({ message: "All fields are required, including a file upload" });
    }

    // Checking model already exists
    const existingModel = await prisma.threeDModel.findFirst({
      where: { modelName: modelName },
    });

    if (existingModel) {
      return res.status(400).json({ message: "Model with the same name already exists" });
    }

    // Upload preview image to Cloudinary
    cloudinary.uploader.upload_stream({ folder: "uploads" }, async (error, result) => {
      if (error) {
        return res.status(500).json({ error: "Upload to Cloudinary failed" });
      }

      // Save model in the database
      const createModel = await prisma.threeDModel.create({
        data: {
          modelName: modelName,
          modelUrl: modelUrl,
          projectId: parseInt(projectId),
          userId: parseInt(userId),
          image: result.secure_url,
        },
      });

      return res.status(201).json({ message: "Model created successfully", model: createModel });
    }).end(req.file.buffer);

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const getAllModel = async (req, res) => {
  try {
    const { projectId } = req.body;
    console.log(projectId);
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    const models = await prisma.threeDModel.findMany({
      where: { projectId: parseInt(projectId) },
    });

    return res.status(200).json({ message: "All models retrieved successfully", models });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { addModel, getAllModel, upload };
