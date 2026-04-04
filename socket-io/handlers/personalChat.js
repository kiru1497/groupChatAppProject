const Message = require("../../models/message");
const User = require("../../models/usersSignup");

module.exports = (io, socket) => {
  // ✅ JOIN ROOM
  socket.on("join_room", ({ roomId }) => {
    socket.join(roomId);
    console.log(`User ${socket.userId} joined room ${roomId}`);
  });

  // ✅ SEND MESSAGE TO ROOM
  socket.on("send_message", async ({ roomId, text }) => {
    if (!text || !roomId) return;

    const user = await User.findByPk(socket.userId);

    // 💾 SAVE TO DB
    await Message.create({
      text,
      UserId: socket.userId,
      type: "personal",
      roomId,
    });

    const payload = {
      text,
      UserId: socket.userId,
      name: user.name,
      roomId,
    };

    // 🎯 SEND ONLY TO ROOM
    io.to(roomId).emit("new_message", payload);
  });
};
