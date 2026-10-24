const express = require("express");
const mongoose = require("mongoose");
const TestResult = require("../models/TestResult");

const router = express.Router();

// Save test result
router.post("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable",
      });
    }

    const result = await TestResult.create(req.body);

    res.status(201).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Save result error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to save test result",
    });
  }
});

// Get all results
router.get("/", async (req, res) => {
  try {
    const results = await TestResult.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch results",
    });
  }
});

// Get one result
router.get("/:testId", async (req, res) => {
  try {
    const result = await TestResult.findOne({
      testId: req.params.testId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch result",
    });
  }
});

module.exports = router;