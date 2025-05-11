const prisma = require("../utils/prisma");
const cloudinary = require("cloudinary").v2;

const uploadDocument = async (req, res) => {
  try {
    const { projectId } = req.body;

    let createdFiles = [];
    if (req.files && req.files.length > 0) {
      const fileUploadPromises = req.files.map(async (file) => {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "document_files",
          resource_type: "auto"
        });
        
        return prisma.documentFiles.create({
          data: {
            name: file.originalname,
            file: uploadResult.secure_url,
            projectId: parseInt(projectId, 10),
            isVisible: true
          },
        });
      });
      createdFiles = await Promise.all(fileUploadPromises);
    }

    return res.status(200).json({
      success: true,
      message: "Document(s) uploaded successfully",
      data: createdFiles,
    });
  } catch (error) {
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
    if(!projectId) {
      return res.status(400).json({ success: false, message: "Project ID is required" });
    }
    const documents = await prisma.documentFiles.findMany({
      where: {
        projectId: parseInt(projectId),
        isVisible: true
      }
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



const deleteDocuments = async (req, res) => {
  try {
    const { fileIds } = req.body;
    if (!fileIds || fileIds.length === 0) {
      return res.status(400).json({ success: false, message: "No files selected for deletion." });
    }

    await prisma.documentFiles.updateMany({
      where: {
        id: { in: fileIds },
      },
      data:{
        isVisible:false
      }
    });

    return res.status(200).json({ success: true, message: "Files deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error deleting files", error: error.message });
  }
};

module.exports = { uploadDocument, getAllDocument ,deleteDocuments};
