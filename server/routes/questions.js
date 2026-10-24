const express = require("express");
const mongoose = require("mongoose");
const Question = require("../models/Question");
const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/requireAdmin");

const router = express.Router();

const VALID_SUBJECTS = [
  "Physics",
  "Chemistry",
  "Mathematics",
];

const VALID_TYPES = [
  "SINGLE_CORRECT",
  "NUMERICAL",
];

const VALID_DIFFICULTIES = [
  "EASY",
  "MEDIUM",
  "HARD",
];

const VALID_STATUSES = [
  "DRAFT",
  "PUBLISHED",
];

function validateQuestionInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "A question object is required.";
  }

  const {
    subject,
    topic,
    difficulty,
    type,
    question,
    options,
    correctAnswer,
    explanation,
    imageUrl,
    explanationImageUrl,
    marks,
    negativeMarks,
    status,
  } = body;

  if (!VALID_SUBJECTS.includes(subject)) {
    return "Select a valid subject.";
  }

  if (
    typeof topic !== "string" ||
    !topic.trim() ||
    topic.trim().length > 150
  ) {
    return "Topic is required and must not exceed 150 characters.";
  }

  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    return "Select a valid difficulty.";
  }

  if (!VALID_TYPES.includes(type)) {
    return "Select a valid question type.";
  }

  if (
    typeof question !== "string" ||
    !question.trim() ||
    question.trim().length > 15000
  ) {
    return "Question text is required and must not exceed 15000 characters.";
  }

  if (type === "SINGLE_CORRECT") {
    if (
      !Array.isArray(options) ||
      options.length < 2 ||
      options.length > 6 ||
      !options.every(
        (option) =>
          typeof option === "string" &&
          option.trim().length > 0 &&
          option.length <= 2000
      )
    ) {
      return "MCQs must have 2-6 non-empty options.";
    }

    if (
      typeof correctAnswer !== "string" ||
      !options.some(
        (option) => option.trim() === correctAnswer.trim()
      )
    ) {
      return "The correct answer must match one of the options.";
    }
  }

  if (type === "NUMERICAL") {
    if (options !== undefined && (!Array.isArray(options) || options.length !== 0)) {
      return "Numerical questions must not have MCQ options.";
    }

    if (
      !["string", "number"].includes(typeof correctAnswer) ||
      String(correctAnswer).trim() === "" ||
      String(correctAnswer).length > 500
    ) {
      return "A valid numerical answer is required.";
    }
  }

  if (
    explanation !== undefined &&
    (typeof explanation !== "string" || explanation.length > 15000)
  ) {
    return "Explanation must be text with at most 15000 characters.";
  }

  for (const field of ["imageUrl", "explanationImageUrl"]) {
    if (
      body[field] !== undefined &&
      (typeof body[field] !== "string" ||
        body[field].length > 2000)
    ) {
      return `${field} must be a valid text URL.`;
    }
  }

  if (
    marks !== undefined &&
    (!Number.isFinite(marks) || marks < 0 || marks > 100)
  ) {
    return "Marks must be between 0 and 100.";
  }

  if (
    negativeMarks !== undefined &&
    (!Number.isFinite(negativeMarks) ||
      negativeMarks < 0 ||
      negativeMarks > 100)
  ) {
    return "Negative marks must be between 0 and 100.";
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return "Status must be DRAFT or PUBLISHED.";
  }

  return null;
}

function buildQuestionData(body) {
  return {
    subject: body.subject,
    topic: body.topic.trim(),
    difficulty: body.difficulty,
    type: body.type,
    question: body.question.trim(),
    options:
      body.type === "SINGLE_CORRECT"
        ? body.options.map((option) => option.trim())
        : [],
    correctAnswer: String(body.correctAnswer).trim(),
    explanation: body.explanation || "",
    imageUrl: body.imageUrl || "",
    explanationImageUrl: body.explanationImageUrl || "",
    marks: body.marks ?? 4,
    negativeMarks: body.negativeMarks ?? 1,
    status: body.status || "DRAFT",
  };
}

// Student endpoint: only published questions are visible.
// Answers and explanations are intentionally excluded.
router.get("/published", authenticateToken, async (req, res) => {
  try {
    const filter = { status: "PUBLISHED" };

    if (req.query.subject) {
      if (!VALID_SUBJECTS.includes(req.query.subject)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subject filter.",
        });
      }

      filter.subject = req.query.subject;
    }

    if (req.query.topic) {
      filter.topic = String(req.query.topic).slice(0, 150);
    }

    const questions = await Question.find(filter)
      .select(
        "subject topic difficulty type question options imageUrl marks negativeMarks"
      )
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return res.json({
      success: true,
      questions: questions.map((item) => ({
        id: item._id.toString(),
        subject: item.subject,
        topic: item.topic,
        difficulty: item.difficulty,
        type: item.type,
        question: item.question,
        options: item.options,
        imageUrl: item.imageUrl,
        marks: item.marks,
        negativeMarks: item.negativeMarks,
      })),
    });
  } catch (error) {
    console.error("Fetch published questions error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch questions.",
    });
  }
});

// All routes below this point require administrator access.
router.use(authenticateToken);
router.use(requireAdmin);

// List questions for the admin panel.
router.get("/", async (req, res) => {
  try {
    const filter = {};

    if (req.query.subject) {
      if (!VALID_SUBJECTS.includes(req.query.subject)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subject filter.",
        });
      }

      filter.subject = req.query.subject;
    }

    if (req.query.status) {
      if (!VALID_STATUSES.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status filter.",
        });
      }

      filter.status = req.query.status;
    }

    if (req.query.difficulty) {
      if (!VALID_DIFFICULTIES.includes(req.query.difficulty)) {
        return res.status(400).json({
          success: false,
          message: "Invalid difficulty filter.",
        });
      }

      filter.difficulty = req.query.difficulty;
    }

    const questions = await Question.find(filter)
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return res.json({
      success: true,
      total: questions.length,
      questions: questions.map((item) => ({
        ...item,
        id: item._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Admin question list error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch the question bank.",
    });
  }
});

// Create a question.
router.post("/", async (req, res) => {
  try {
    const validationError = validateQuestionInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const question = await Question.create({
      ...buildQuestionData(req.body),
      createdBy: req.studentId,
    });

    return res.status(201).json({
      success: true,
      message: "Question created successfully.",
      question: {
        ...question.toObject(),
        id: question._id.toString(),
      },
    });
  } catch (error) {
    console.error("Create question error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create the question.",
    });
  }
});

// Edit an existing question.
router.patch("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID.",
      });
    }

    const validationError = validateQuestionInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      buildQuestionData(req.body),
      {
        new: true,
        runValidators: true,
      }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    return res.json({
      success: true,
      message: "Question updated successfully.",
      question: {
        ...question.toObject(),
        id: question._id.toString(),
      },
    });
  } catch (error) {
    console.error("Update question error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update the question.",
    });
  }
});

// Delete a question.
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID.",
      });
    }

    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    return res.json({
      success: true,
      message: "Question deleted successfully.",
    });
  } catch (error) {
    console.error("Delete question error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete the question.",
    });
  }
});

module.exports = router;
