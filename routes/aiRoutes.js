const express = require("express");
const router = express.Router();

const aiController = require("../controllers/aiController");

router.post("/predict", aiController.predictText);
router.post("/replies", aiController.smartReplies);

module.exports = router;
