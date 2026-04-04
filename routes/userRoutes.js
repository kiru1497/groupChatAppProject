const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

router.post("/signup", userController.signup);
router.post("/login", userController.login);

router.get("/search", auth, userController.searchUsers);

// ✅ NEW (validate username)
router.get("/find-by-name", auth, userController.findUserByName);

module.exports = router;
