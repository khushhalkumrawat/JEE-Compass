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

router.use(authenticateToken);

function isNonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function validateMistakeTypes(mistakeTypes) {
  if (mistakeTypes === undefined) return true;

  if (
    typeof mistakeTypes !== "object" ||
    mistakeTypes === null ||
    Array.isArray(mistakeTypes)
  ) {
    return false;
  }

  return Object.entries(mistakeTypes).every(
    ([questionId, type]) =>
      questionId.trim().length > 0 &&
      typeof type === "string" &&
      ALLOWED_MISTAKE_TYPES.has(type),
  );
}

function validateTestResult(body) {
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
  } = body;

  if (typeof testId !== "string" || !testId.trim() || testId.length > 150) {
    return "A valid testId is required.";
  }

  const counts = [totalQuestions, attempted, correct, incorrect, unanswered];

  if (!counts.every(isNonNegativeInteger)) {
    return "Question counts must be non-negative integers.";
  }

  if (
    totalQuestions < 1 ||
    totalQuestions > 500 ||
    attempted > totalQuestions ||
    correct > attempted ||
    incorrect > attempted ||
    correct + incorrect !== attempted ||
    attempted + unanswered !== totalQuestions
  ) {
    return "Question counts are inconsistent or outside allowed limits.";
  }

  if (
    typeof score !== "number" ||
    !Number.isFinite(score) ||
    typeof maxScore !== "number" ||
    !Number.isFinite(maxScore) ||
    maxScore <= 0 ||
    maxScore > 100000 ||
    score < -maxScore ||
    score > maxScore
  ) {
    return "Invalid score or maximum score.";
  }

  if (!isNonNegativeInteger(timeTakenSeconds) || timeTakenSeconds > 86400) {
    return "Invalid test duration.";
  }

  if (!Array.isArray(answers) || answers.length !== totalQuestions) {
    return "Answers must contain one entry per question.";
  }

  const seenQuestionIds = new Set();

  for (const answer of answers) {
    if (
      !answer ||
      typeof answer !== "object" ||
      typeof answer.questionId !== "string" ||
      !answer.questionId.trim() ||
      answer.questionId.length > 150
    ) {
      return "Invalid answer data.";
    }

    if (seenQuestionIds.has(answer.questionId)) {
      return "Duplicate question IDs are not allowed.";
    }

    seenQuestionIds.add(answer.questionId);

    if (
      answer.markedForReview !== undefined &&
      typeof answer.markedForReview !== "boolean"
    ) {
      return "Invalid review marker.";
    }
  }

  if (!validateMistakeTypes(mistakeTypes)) {
    return "Invalid mistake classifications.";
  }

  const answerIds = new Set(answers.map((answer) => answer.questionId));

  if (
    mistakeTypes &&
    Object.keys(mistakeTypes).some((questionId) => !answerIds.has(questionId))
  ) {
    return "Mistake classifications must reference questions in this test.";
  }

  return null;
}

// Save a test result for the authenticated student.
router.post("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable",
      });
    }

    const validationError = validateTestResult(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
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
      message: "Failed to fetch results",
    });
  }
});

// Update mistake classifications for the authenticated student's test.
router.patch("/:testId/mistakes", async (req, res) => {
  try {
    const { mistakeTypes } = req.body;

    if (!validateMistakeTypes(mistakeTypes)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mistake classifications.",
      });
    }

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

    const answerIds = new Set(
      result.answers.map((answer) => answer.questionId),
    );

    if (
      Object.keys(mistakeTypes).some((questionId) => !answerIds.has(questionId))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Mistake classifications must reference questions in this test.",
      });
    }

    result.mistakeTypes = mistakeTypes;
    await result.save();

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
