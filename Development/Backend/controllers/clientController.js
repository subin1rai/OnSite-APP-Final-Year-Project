const prisma = require("../utils/prisma");

const clientData = async (req, res) => {
  try {
    const clientId  = req.user.userId;
    const checkClientId = await prisma.user.findFirst({
      where: {
        id: parseInt(clientId),
      },
    });

    if (!checkClientId) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }
    const   projects = await prisma.project.findMany({
      where: {
        clientId: parseInt(clientId),
      },
      include: {
        budgets: {
            include: {
        Transaction: true,
        
            },
        },}
    });

    return res.status(200).json({
      projects
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

module.exports = {
    clientData
} 