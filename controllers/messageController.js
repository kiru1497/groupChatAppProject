const Message = require("../models/message");
const User = require("../models/usersSignup");

// GROUP MESSAGE (unchanged)
const sendMessage = async (req, res) => {
  const { text } = req.body;
  const userId = req.userId;

  if (!text) {
    return res.status(400).json({ message: "Message cannot be empty" });
  }

  try {
    const message = await Message.create({
      text,
      UserId: userId,
      type: "group",
    });

    const user = await User.findByPk(userId);

    const io = req.app.get("io");

    io.emit("group_message", {
      text: message.text,
      UserId: userId,
      name: user.name,
    });

    res.status(201).json({ message: "Message saved" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET GROUP MESSAGES
const getMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { type: "group" },
      include: [{ model: User, attributes: ["id", "name"] }],
      order: [["createdAt", "ASC"]],
    });

    res.json(messages);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ NEW: GET PERSONAL MESSAGES BY ROOM
const getPersonalMessages = async (req, res) => {
  const { roomId } = req.params;

  try {
    const messages = await Message.findAll({
      where: {
        type: "personal",
        roomId,
      },
      include: [{ model: User, attributes: ["id", "name"] }],
      order: [["createdAt", "ASC"]],
    });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getPersonalMessages, // ✅ EXPORT
};
