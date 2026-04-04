// socket-io/handlers/personalChat.js

const Message = require("../../models/message");
const User = require("../../models/usersSignup");

module.exports = (io, socket) => {
  socket.on("join_room", ({ roomId }) => {
    socket.join(roomId);
  });

  socket.on("send_message", async ({ roomId, text }) => {
    if (!roomId || !text) return;

    const user = await User.findByPk(socket.userId);

    // ✅ SAVE WITH roomId
    await Message.create({
      text,
      UserId: socket.userId,
      roomId,
      type: "personal",
    });

    io.to(roomId).emit("new_message", {
      roomId,
      text,
      UserId: socket.userId,
      name: user.name,
    });
  });
};
