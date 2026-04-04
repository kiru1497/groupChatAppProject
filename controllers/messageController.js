const Message = require("../models/message");
const User = require("../models/usersSignup");

// GROUP
const sendMessage = async (req, res) => {
  const { text } = req.body;
  const userId = req.userId;

  if (!text) return res.status(400).json({ message: "Empty" });

  try {
    const message = await Message.create({
      text,
      UserId: userId,
      type: "group",
    });

    const user = await User.findByPk(userId);

    const io = req.app.get("io");

    io.emit("group_message", {
      text,
      UserId: userId,
      name: user.name,
    });

    res.status(201).json(message);
  } catch {
    res.status(500).json({ message: "Error" });
  }
};

// GROUP FETCH
const getMessages = async (req, res) => {
  const messages = await Message.findAll({
    where: { type: "group" },
    include: [{ model: User, attributes: ["id", "name"] }],
    order: [["createdAt", "ASC"]],
  });

  res.json(messages);
};

// ✅ PERSONAL FETCH
const getPersonalMessages = async (req, res) => {
  const { roomId } = req.params;

  const messages = await Message.findAll({
    where: { type: "personal", roomId },
    include: [{ model: User, attributes: ["id", "name"] }],
    order: [["createdAt", "ASC"]],
  });

  res.json(messages);
};

module.exports = {
  sendMessage,
  getMessages,
  getPersonalMessages,
};
