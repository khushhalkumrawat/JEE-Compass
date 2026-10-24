const express = require("express");
const mongoose = require("mongoose");
const DPPProgress = require("../models/DPPProgress");
const { authenticateToken } = require("./auth");

const router = express.Router();

router.use(authenticateToken);

// Retrieve the logged-in student's DPP progress.
router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable. Please try again.",
      });
    }

    const progress = await DPPProgress.findOne({
      studentId: req.studentId,
    }).lean();

    return res.json({
      success: true,
      progress: progress
        ? {
            answered:
              progress.answers instanceof Map
                ? Object.fromEntries(progress.answers)
                : progress.answers?.toObject
                  ? progress.answers.toObject()
                  : progress.answers || {},
            correct: progress.correctQuestionIds || [],
          }
        : { answered: {}, correct: [] },
    });
  } catch (error) {
    console.error("Fetch DPP progress error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to load DPP progress.",
    });
  }
});

// Save the logged-in student's DPP progress.
router.put("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable. Please try again.",
      });
    }

    const { answered, correct } = req.body;

    if (
      !answered ||
      typeof answered !== "object" ||
      Array.isArray(answered) ||
      Object.keys(answered).length > 1000 ||
      !Array.isArray(correct) ||
      correct.length > 1000 ||
      Object.entries(answered).some(
        ([id, answer]) =>
          !/^\d+$/.test(id) ||
          typeof answer !== "string" ||
          answer.length > 500,
      ) ||
      correct.some((id) => !Number.isSafeInteger(id) || id < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid DPP progress data.",
      });
    }

    const correctIds = [...new Set(correct)];

    // Only store correct IDs that have an answer saved.
    const validCorrectIds = correctIds.filter(
      (id) => answered[String(id)] !== undefined,
    );

    const progress = await DPPProgress.findOneAndUpdate(
      { studentId: req.studentId },
      {
        $set: {
          answers: answered,
          correctQuestionIds: validCorrectIds,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return res.json({
      success: true,
      progress: {
        answered:
          progress.answers instanceof Map
            ? Object.fromEntries(progress.answers)
            : progress.answers?.toObject
              ? progress.answers.toObject()
              : progress.answers || {},
        correct: progress.correctQuestionIds,
      },
    });
  } catch (error) {
    console.error("Save DPP progress error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to save DPP progress.",
    });
  }
});

module.exports = router;
