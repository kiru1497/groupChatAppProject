const { Server } = require("socket.io");
const socketMiddleware = require("./middleware");

// handlers
const chatHandler = require("./handlers/chat"); // ✅ group chat
const personalChatHandler = require("./handlers/personalChat"); // ✅ personal chat

const userSocketMap = {};

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => socketMiddleware(socket, next, userSocketMap));

  io.on("connection", (socket) => {
    console.log(`🟢 Connected: userId=${socket.userId}`);

    const userId = socket.userId;

    // 🔥 join personal room automatically
    if (userId) {
      socket.join(`user_${userId}`);
    }

    // ✅ attach handlers
    chatHandler(io, socket, userSocketMap); // group chat
    personalChatHandler(io, socket, userSocketMap); // personal chat

    socket.on("disconnect", () => {
      console.log(`🔴 Disconnected: ${socket.id}`);

      if (socket.userId) {
        delete userSocketMap[socket.userId];
      }
    });
  });

  return io;
}

module.exports = initSocket;
