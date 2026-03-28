const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController"); // ✅ include this
const auth = require("../middleware/auth");

router.post("/send", auth, sendMessage);
router.get("/all", auth, getMessages);

module.exports = router;
