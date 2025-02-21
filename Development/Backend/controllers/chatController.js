const prisma = require("../utils/prisma");

const getChatUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: parseInt(userId),
        },
      },
    });
    return res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const sendRequest = async (req, res) => {
    try {
      const senderId = req.user.userId;
        const { receiverId, message } = req.body;

        // Check if the receiver exists
        const receiver = await prisma.user.findUnique({
            where: { id: parseInt(receiverId)}
        });

        if (!receiver) {
            return res.status(404).json({ message: "Receiver not found" });
        }

        // Create a new request in the database
        const newRequest = await prisma.request.create({
            data: {
                fromId: parseInt(senderId),
                userId: parseInt(receiverId),
                message: message,
                status: "pending",
            },
        });

        res.status(200).json({ message: "Friend request sent", request: newRequest });
    } catch (error) {
        console.error("Error sending request:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("Fetching requests sent by:", userId);

    const requests = await prisma.request.findMany({
      where: {
        userId: parseInt(userId),
      },
      include:{
        user: true,
      }
     
    });

    return res.status(200).json({ requests });

  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
   
    const userId = req.user.userId; 
    const { requestId } = req.body; 

    console.log(req.body);
    if (!requestId || isNaN(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    // Check if the request exists
    const request = await prisma.request.findFirst({
      where: { id: Number(requestId) },
      include: { from: true, user: true },
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Ensure the request belongs to the logged-in user
    if (request.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized request" });
    }

    // Delete the request after acceptance
    await prisma.request.delete({
      where: { id: request.id },
    });

    // Add both users to each other's friends list
    const updatedUser = await prisma.user.update({
      where: { id: request.userId },
      data: {
        friends: { connect: { id: request.fromId } },
      },
    });

    const friendUser = await prisma.user.update({
      where: { id: request.fromId },
      data: {
        friends: { connect: { id: request.userId } },
      },
    });

    if (!updatedUser || !friendUser) {
      return res.status(500).json({ message: "Failed to update friends list" });
    }

    return res.status(200).json({ message: "Request accepted successfully" });

  } catch (error) {
    console.error("Error accepting request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getFriends = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findFirst({
      where: { id: parseInt(userId) },
      include: { friends: {
        select:{
          id: true,
          username: true,
          email: true
        }
      } },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ friends: user.friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Internal Server Error" });
    
  }
}


module.exports = {
  getChatUser,
  sendRequest,
  getRequest,
  acceptRequest,
  getFriends
};
