const socketIo = require('socket.io');
let io = null;
const userSocketMap = {};

const initializeSocket = (server) => {
  io = socketIo(server);

  io.on("connection", socket => {
    console.log("New client connected:", socket.id);
    
    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
      userSocketMap[userId] = socket.id;
      console.log(`User ${userId} mapped to socket ${socket.id}`);
    }

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      // Remove user from socket map
      const userId = Object.keys(userSocketMap).find(
        key => userSocketMap[key] === socket.id
      );
      if (userId) {
        delete userSocketMap[userId];
        console.log(`Removed user ${userId} from socket map`);
      }
    });

    // Handle message sending
    socket.on("sendMessage", ({ senderId, receiverId, message }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", {
          senderId,
          message,
        });
      }
    });
  });

  return io;
};

module.exports = {
  io,
  userSocketMap,
  initializeSocket
};