// socket-io/handlers/chat.js

const User = require("../../models/usersSignup");
const Message = require("../../models/message"); // ✅ IMPORT MESSAGE MODEL

module.exports = (io, socket) => {
  socket.on("group_message", async (text) => {
    if (!text) return;

    try {
      // 🔥 fetch username
      const user = await User.findByPk(socket.userId);

      // ✅ SAVE MESSAGE TO DB
      await Message.create({
        text,
        UserId: socket.userId,
        type: "group",
      });

      const payload = {
        text,
        UserId: socket.userId,
        name: user.name, // ✅ username included
      };

      // ✅ EMIT TO ALL USERS
      io.emit("group_message", payload);
    } catch (error) {
      console.error("Error handling group_message:", error);
    }
  });
};
