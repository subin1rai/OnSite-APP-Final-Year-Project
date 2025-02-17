const prisma = require("../utils/prisma");

const addModel = async (req, res) => {
  try {
const { projectId, modelName, modelUrl } = req.body;
    const userId = req.user.userId;
    if (!userId || !projectId || !modelName || !modelUrl) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingModel = await prisma.threeDModel.findFirst({
      where: {
        modelName: modelName,
      },
    });

    if (existingModel) {
      return res
        .status(400)
        .json({ message: "Model with the same name already exists" });
    }

    const createModel = await prisma.threeDModel.create({
        data:{
            modelName: modelName,
            modelUrl: modelUrl,
            projectId: parseInt(projectId),
            userId: parseInt(userId)
        }
    })
    return res.status(201).json({ message: "Model created successfully", model: createModel });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const getAllModel = async (req, res) => {
    try {
        const {projectId} = req.body;
        const models = await prisma.threeDModel.findMany({
            where: {
                projectId: parseInt(projectId)
            }
        })
        return res.status(200).json({ message: "All models", models });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = { addModel, getAllModel };