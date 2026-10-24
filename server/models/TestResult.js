const mongoose = require("mongoose");

const testResultSchema = new mongoose.Schema(
  {
    testId: {
      type: String,
      required: true,
      unique: true,
    },
    totalQuestions: Number,
    attempted: Number,
    correct: Number,
    incorrect: Number,
    unanswered: Number,
    score: Number,
    maxScore: Number,
    timeTakenSeconds: Number,
    answers: [
      {
        questionId: String,
        answer: mongoose.Schema.Types.Mixed,
        markedForReview: Boolean,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestResult", testResultSchema);