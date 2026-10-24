const mongoose = require("mongoose");

const testResultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    testId: {
      type: String,
      required: true,
      trim: true,
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
    mistakeTypes: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

testResultSchema.index(
  { studentId: 1, testId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      studentId: { $exists: true },
    },
  }
);

module.exports = mongoose.model("TestResult", testResultSchema);
