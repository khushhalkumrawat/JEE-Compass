require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);

app.use(express.json({ limit: "20kb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "JEE Compass backend is running!",
  });
});

// AI Doubt Solver
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/api/doubts/ask", async (req, res) => {
  try {
    const { question, subject, topic, history } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ success: false, message: "Please enter your doubt." });
    }

    const selectedSubject = ["Physics", "Chemistry", "Mathematics"].includes(subject)
      ? subject
      : "General JEE";
    const selectedTopic = typeof topic === "string" ? topic.slice(0, 150) : "";

    const previousMessages = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              ["user", "assistant"].includes(item.role) &&
              typeof item.content === "string"
          )
          .slice(-6)
      : [];

    const contents = previousMessages.map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content }],
    }));

    contents.push({
      role: "user",
      parts: [{ text: question.trim() }],
    });

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: `You are JEE Compass Tutor, an expert tutor for JEE Main & Advanced.
Subject: ${selectedSubject}
Topic: ${selectedTopic || "Not specified"}

Instructions:
- Provide intuitive, step-by-step explanations.
- Show clear formulas, unit definitions, and derivations where applicable.
- For numerical questions, clearly state: Given Data, Formula Applied, Step-by-Step Calculation, and Final Answer with Units.`,
        temperature: 0.3,
        maxOutputTokens: 1200,
      },
    });

    const answer = response.text?.trim();

    if (!answer) {
      return res.status(502).json({
        success: false,
        message: "No answer received from tutor.",
      });
    }

    return res.json({ success: true, answer });
  } catch (error) {
    console.error("Doubt solver error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process doubt.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`JEE Compass backend running at http://localhost:${PORT}`);
});