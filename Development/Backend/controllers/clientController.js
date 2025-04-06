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

const registerBuilder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { address, contact, companyName } = req.body;

    if (!address || !contact || !companyName) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const checkUserId = await prisma.user.findFirst({
      where: {
        id: parseInt(userId),
      },
    });

    if (!checkUserId) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (checkUserId.role === "builder") {
      return res.status(400).json({
        success: false,
        message: "User already registered as a Builder",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const builder = await tx.company.create({
        data: {
          address,
          contact,
          companyName,
          builderId: userId,
        },
      });

      const updateUser = await tx.user.update({
        where: {
          id: parseInt(userId),
        },
        data: {
          role: "builder",
        },
      });

      return { builder, updateUser };
    });

    return res.status(201).json({
      message: "Builder registered successfully",
      status: 201,
      data: result,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


module.exports = {
    clientData,
    registerBuilder
} 