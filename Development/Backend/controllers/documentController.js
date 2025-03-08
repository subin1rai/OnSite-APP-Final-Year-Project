const { PrismaClient } = require("@prisma/client");
const { project } = require("../utils/prisma");
const prisma = new PrismaClient();
const cloudinary = require("cloudinary").v2;

const uploadDocument = async (req, res) => {
  try {
    const { projectId } = req.body;
    const document = await prisma.document.create({
      data: {
        projectId: parseInt(projectId, 10),
      },
    });

    if (req.files && req.files.length > 0) {
      const fileUploadPromises = req.files.map(async (file) => {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "document_files",
        });
        return prisma.documentFiles.create({
          data: {
            name: file.originalname,
            file: uploadResult.secure_url,
            documentId: document.id,
          },
        });
      });

      await Promise.all(fileUploadPromises);
    }

    return res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      documentId: document.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during upload",
      error: error.message,
    });
  }
};

const getAllDocument = async (req, res) => {
  try {
    const { projectId } = req.body;
    console.log(req.body);
    const documents = await prisma.document.findMany({
      where: {
        projectId: parseInt(projectId),
      },
      include: {
        files: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving documents",
      error: error.message,
    });
  }
};

module.exports = { uploadDocument, getAllDocument };
