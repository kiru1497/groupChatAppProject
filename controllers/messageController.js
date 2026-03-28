const Message = require("../models/message");
const User = require("../models/usersSignup");

// create message
const sendMessage = async (req, res) => {
  const { text } = req.body;

  // assume userId comes from token later
  const userId = req.userId; // temporary

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!text) {
    return res.status(400).json({ message: "Message cannot be empty" });
  }

  try {
    const message = await Message.create({
      text,
      UserId: userId,
    });

    res.status(201).json({
      message: "Message saved",
      data: message,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
      ],
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
};
