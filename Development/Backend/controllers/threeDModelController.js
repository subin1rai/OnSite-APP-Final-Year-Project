const prisma = require("../utils/prisma");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
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

    const uploadOptions = { 
      folder: "uploads",
      resource_type: "auto" 
    };

    // Create a promise to handle the upload
    const cloudinaryUpload = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      
      // Write the buffer to the stream with proper encoding
      uploadStream.write(req.file.buffer);
      uploadStream.end();
    });

    // Wait for the upload to complete
    const uploadResult = await cloudinaryUpload;

    // Save model in the database
    const createModel = await prisma.threeDModel.create({
      data: {
        modelName: modelName,
        modelUrl: modelUrl,
        projectId: parseInt(projectId),
        userId: parseInt(userId),
        image: uploadResult.secure_url,
      },
    });

    return res.status(201).json({ message: "Model created successfully", model: createModel });

  } catch (error) {
    console.error("Error in addModel:", error);
    return res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const getAllModel = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    const models = await prisma.threeDModel.findMany({
      where: { projectId: parseInt(projectId) },
    });

    return res.status(200).json({ message: "All models retrieved successfully", models });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { addModel, getAllModel, upload };
