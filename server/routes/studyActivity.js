const express = require("express");
const mongoose = require("mongoose");
const StudyActivity = require("../models/StudyActivity");
const { authenticateToken } = require("./auth");

const router = express.Router();

router.use(authenticateToken);

function getDateKey(date = new Date()) {
  // Use UTC consistently so date calculations remain predictable.
  return date.toISOString().slice(0, 10);
}

function calculateStreak(activeDates) {
  const dates = new Set(activeDates);
  const today = getDateKey();
  const yesterday = getDateKey(
    new Date(Date.now() - 24 * 60 * 60 * 1000),
  );

  let currentDate = dates.has(today) ? today : yesterday;
  let streak = 0;

  while (dates.has(currentDate)) {
    streak++;

    const previous = new Date(`${currentDate}T00:00:00.000Z`);
    previous.setUTCDate(previous.getUTCDate() - 1);
    currentDate = getDateKey(previous);
  }

  return streak;
}

// Record today's study activity.
router.post("/record", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable.",
      });
    }

    const today = getDateKey();

    const activity = await StudyActivity.findOneAndUpdate(
      { studentId: req.studentId },
      {
        $addToSet: { activeDates: today },
        $setOnInsert: { studentId: req.studentId },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    return res.json({
      success: true,
      streak: calculateStreak(activity.activeDates),
      activeDates: activity.activeDates,
    });
  } catch (error) {
    console.error("Record study activity error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to record study activity.",
    });
  }
});

// Retrieve the student's streak.
router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable.",
      });
    }

    const activity = await StudyActivity.findOne({
      studentId: req.studentId,
    }).lean();

    const activeDates = activity?.activeDates || [];

    return res.json({
      success: true,
      streak: calculateStreak(activeDates),
      activeDates,
    });
  } catch (error) {
    console.error("Fetch study activity error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load study streak.",
    });
  }
});

module.exports = router;