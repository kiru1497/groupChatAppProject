const { getPrediction, getSmartReplies } = require("../services/geminiService");

// Predictive typing
exports.predictText = async (req, res) => {
  try {
    const { text } = req.body;

    const suggestions = await getPrediction(text);

    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "AI error" });
  }
};

// Smart replies
exports.smartReplies = async (req, res) => {
  try {
    const { message } = req.body;

    const replies = await getSmartReplies(message);

    res.json(replies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "AI error" });
  }
};
