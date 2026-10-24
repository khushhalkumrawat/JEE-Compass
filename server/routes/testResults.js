const express = require("express");
const mongoose = require("mongoose");
const TestResult = require("../models/TestResult");
const { authenticateToken } = require("./auth");

const router = express.Router();

const ALLOWED_MISTAKE_TYPES = new Set([
  "Conceptual Error",
  "Calculation Error",
  "Careless Error",
  "Guessed Answer",
]);

// All test-result endpoints require authentication.
router.use(authenticateToken);

// Save a test result for the authenticated student.
router.post("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable",
      });
    }

    const {
      testId,
      totalQuestions,
      attempted,
      correct,
      incorrect,
      unanswered,
      score,
      maxScore,
      timeTakenSeconds,
      answers,
      mistakeTypes,
    } = req.body;

    if (typeof testId !== "string" || !testId.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid testId is required.",
      });
    }

    if (
      mistakeTypes !== undefined &&
      (typeof mistakeTypes !== "object" ||
        mistakeTypes === null ||
        Array.isArray(mistakeTypes) ||
        Object.entries(mistakeTypes).some(
          ([questionId, type]) =>
            !questionId.trim() ||
            typeof type !== "string" ||
            !ALLOWED_MISTAKE_TYPES.has(type)
        ))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid mistake classifications.",
      });
    }

    const result = await TestResult.create({
      studentId: req.studentId,
      testId: testId.trim(),
      totalQuestions,
      attempted,
      correct,
      incorrect,
      unanswered,
      score,
      maxScore,
      timeTakenSeconds,
      answers,
      mistakeTypes: mistakeTypes || {},
    });

    return res.status(201).json({
      success: true,
      result,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A result for this test already exists in your account.",
      });
    }

    console.error("Save result error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to save test result",
    });
  }
});

// Get only the authenticated student's history.
router.get("/", async (req, res) => {
  try {
    const results = await TestResult.find({
      studentId: req.studentId,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({ success: true, results });
  } catch (error) {
    console.error("Fetch history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch results",
    });
  }
});

// Get one result belonging to the authenticated student.
router.get("/:testId", async (req, res) => {
  try {
    const result = await TestResult.findOne({
      studentId: req.studentId,
      testId: req.params.testId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    return res.json({ success: true, result });
  } catch (error) {
    console.error("Fetch result error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch result",
    });
  }
});

// Save or update mistake classifications for one of the student's tests.
router.patch("/:testId/mistakes", async (req, res) => {
  try {
    const { mistakeTypes } = req.body;

    if (
      typeof mistakeTypes !== "object" ||
      mistakeTypes === null ||
      Array.isArray(mistakeTypes) ||
      Object.entries(mistakeTypes).some(
        ([questionId, type]) =>
          !questionId.trim() ||
          typeof type !== "string" ||
          !ALLOWED_MISTAKE_TYPES.has(type)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid mistake classifications.",
      });
    }

    const result = await TestResult.findOneAndUpdate(
      {
        studentId: req.studentId,
        testId: req.params.testId,
      },
      {
        $set: { mistakeTypes },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    return res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Update mistakes error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to save mistake classifications",
    });
  }
});

module.exports = router;
