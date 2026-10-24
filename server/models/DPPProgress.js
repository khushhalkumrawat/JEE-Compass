const mongoose = require("mongoose");

const dppProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    answers: {
      type: Map,
      of: String,
      default: {},
    },
    correctQuestionIds: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true },
);

dppProgressSchema.index({ studentId: 1 }, { unique: true });

module.exports = mongoose.model("DPPProgress", dppProgressSchema);
