require("dotenv").config({
  path: require("path").join(__dirname, ".env"),
});

const rateLimit = require("express-rate-limit");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const testResultsRouter = require("./routes/testResults");
const { router: authRouter, authenticateToken } = require("./routes/auth");
const questionsRouter = require("./routes/questions");
const dppProgressRouter = require("./routes/dppProgress");

const app = express();
const PORT = process.env.PORT || 5000;

// Configure proxy handling for deployment behind one trusted proxy.
// Verify your hosting provider's proxy setup before deploying.
app.set("trust proxy", 1);

// General limit: all REST API endpoints.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

// Stricter limit for login and registration.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

// Stricter limit for the Groq AI Doubt Solver.
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many AI requests. Please wait before asking another doubt.",
  },
});

// MongoDB connection
let mongoConnectionPromise = null;

async function connectMongoDB() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing from server/.env");
    return;
  }

  try {
    mongoConnectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    await mongoConnectionPromise;

    console.log("MongoDB Atlas connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    mongoConnectionPromise = null;
  }
}

app.use(
  cors({
    origin: ["http://localhost:5173"],
  }),
);

app.use(express.json({ limit: "20kb" }));

// Apply rate limiting to every /api endpoint.
app.use("/api", apiLimiter);

app.use("/api/test-results", testResultsRouter);

app.use("/api/dpp-progress", dppProgressRouter);

app.use("/api/auth", authLimiter, authRouter);

app.use("/api/questions", questionsRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "JEE Compass backend is running!",
  });
});

// MongoDB database health check
app.get("/api/db-health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    success: connected,
    database: connected ? "connected" : "disconnected",
  });
});

// AI Doubt Solver — Groq API
app.post("/api/doubts/ask", aiLimiter, authenticateToken, async (req, res) => {
  try {
    const { question, subject, topic, history } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your doubt.",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is missing.");

      return res.status(500).json({
        success: false,
        message:
          "AI tutor is not configured. Please contact the administrator.",
      });
    }

    const selectedSubject = ["Physics", "Chemistry", "Mathematics"].includes(
      subject,
    )
      ? subject
      : "General JEE";

    const selectedTopic = typeof topic === "string" ? topic.slice(0, 150) : "";

    const previousMessages = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              ["user", "assistant"].includes(item.role) &&
              typeof item.content === "string",
          )
          .slice(-6)
      : [];

    const systemPrompt = `
You are JEE Compass Tutor, an expert tutor for JEE Main and JEE Advanced.

Subject: ${selectedSubject}
Topic: ${selectedTopic || "Not specified"}

MATHEMATICAL FORMATTING RULES:

1. Write all mathematical expressions using valid LaTeX.
2. Use $...$ for inline equations.
3. Use $$...$$ on separate lines for displayed equations.
4. Never put equations inside Markdown code fences.
5. Use LaTeX for powers, fractions, roots, subscripts, and Greek symbols.
   Examples: x^2, \\frac{a}{b}, \\sqrt{x}, a_n, \\alpha.
6. Never omit mathematical operators or merge separate expressions.
7. Use proper Markdown headings, numbered lists, and bullet points.
8. Put each equation on its own line when solving systems of equations.
9. Display the final answer using a separate displayed equation.
10. Check that every equation is complete and mathematically correct.

CORRECT FORMATTING EXAMPLE:

To solve the equation:

$$
x^2 - 5x + 6 = 0
$$

Factor the quadratic:

$$
(x - 2)(x - 3) = 0
$$

Using the zero-product property:

$$
x - 2 = 0 \\quad \\text{or} \\quad x - 3 = 0
$$

Therefore, the final answer is:

$$
\\boxed{x = 2 \\text{ or } x = 3}
$$

TEACHING INSTRUCTIONS:

- Explain concepts in simple, student-friendly language.
- Give intuitive, step-by-step explanations.
- Show relevant formulas, define symbols, and explain derivations when useful.
- For numerical questions, use these sections when appropriate:
  Given Data, Formula Applied, Step-by-Step Calculation, and Final Answer with Units.
- For multiple-choice questions, explain why the correct option is right.
- If a question is ambiguous, ask for clarification.
- Never invent formulas or claim an uncertain answer is verified.
- Keep the response organized, readable, and focused on helping the student learn.
`;

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...previousMessages.map((item) => ({
        role: item.role,
        content: item.content.slice(0, 4000),
      })),
      {
        role: "user",
        content: question.trim().slice(0, 6000),
      },
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    let response;

    try {
      response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
            messages,
            temperature: 0.2,
            max_completion_tokens: 1800,
          }),
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timeout);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(
        "Groq API error:",
        response.status,
        data.error?.message || "Unknown provider error",
      );

      if (response.status === 429) {
        return res.status(429).json({
          success: false,
          message:
            "The AI tutor has reached its current usage limit. Please try again later.",
        });
      }

      if ([401, 403].includes(response.status)) {
        return res.status(502).json({
          success: false,
          message:
            "The AI tutor is temporarily unavailable. Please try again later.",
        });
      }

      return res.status(502).json({
        success: false,
        message: "The AI tutor is temporarily unavailable. Please try again.",
      });
    }

    const answer = data.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return res.status(502).json({
        success: false,
        message: "The AI tutor returned an empty answer. Please try again.",
      });
    }

    return res.json({
      success: true,
      answer,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      return res.status(504).json({
        success: false,
        message: "The AI tutor took too long to respond. Please try again.",
      });
    }

    console.error("Doubt solver error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process your doubt right now. Please try again.",
    });
  }
});

// Global error handler: never expose internal errors to clients.
app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error.message);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    success: false,
    message: "An unexpected error occurred. Please try again later.",
  });
});

// Start the server and attempt MongoDB connection
app.listen(PORT, () => {
  console.log(`JEE Compass backend running at http://localhost:${PORT}`);

  connectMongoDB();
});
