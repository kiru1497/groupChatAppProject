const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getMessages,
  getPersonalMessages, // ✅ NEW
} = require("../controllers/messageController");

const auth = require("../middleware/auth");

router.post("/send", auth, sendMessage);
router.get("/all", auth, getMessages);

// ✅ NEW ROUTE (room-based messages)
router.get("/personal/:roomId", auth, getPersonalMessages);

module.exports = router;
