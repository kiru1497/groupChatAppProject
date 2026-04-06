const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-pro",
});

// 🔹 Predictive typing
const getPrediction = async (text) => {
  const prompt = `
Continue this sentence in 3 short options:

"${text}"

Return ONLY 3 short suggestions.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response.text();

  return response.split("\n").filter(Boolean);
};

// 🔹 Smart replies
const getSmartReplies = async (message) => {
  const prompt = `
Give 3 short reply options for this message:

"${message}"

Keep them concise and natural.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response.text();

  return response.split("\n").filter(Boolean);
};

module.exports = {
  getPrediction,
  getSmartReplies,
};
