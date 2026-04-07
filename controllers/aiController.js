const { generatePrintSuggestions } = require("../services/aiSuggestionService");

/**
 * Controller: Generate AI-like print suggestions
 * Receives user message and returns structured print settings
 */
const generatePrintAssist = async (req, res) => {
  try {
    const { message } = req.body;

    // Basic validation
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const suggestions = generatePrintSuggestions(message.trim());

    return res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("AI Print Assist Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate print suggestions",
    });
  }
};

module.exports = {
  generatePrintAssist,
};