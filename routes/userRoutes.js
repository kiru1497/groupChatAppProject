const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const userController = require("../controllers/userController");

// routes
router.post("/signup", userController.signup);
router.post("/login", userController.login);

// 🔥 NEW ROUTE
router.get("/search", auth, userController.searchUsers);

module.exports = router;
