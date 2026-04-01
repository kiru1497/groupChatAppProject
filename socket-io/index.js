const { Server } = require("socket.io");
const socketMiddleware = require("./middleware");
const chatHandler = require("./handlers/chat");

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

    // attach handlers
    chatHandler(io, socket, userSocketMap);

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
