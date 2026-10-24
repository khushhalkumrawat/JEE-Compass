const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      enum: ["Physics", "Chemistry", "Mathematics"],
      required: true,
      index: true,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      default: "MEDIUM",
      required: true,
    },

    type: {
      type: String,
      enum: ["SINGLE_CORRECT", "NUMERICAL"],
      required: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 15000,
    },

    options: {
      type: [String],
      default: [],
      validate: {
        validator: function (options) {
          if (this.type === "NUMERICAL") {
            return options.length === 0;
          }

          return (
            options.length >= 2 &&
            options.length <= 6 &&
            options.every((option) => option.trim().length > 0)
          );
        },
        message: "MCQs need 2-6 options; numerical questions must not have options.",
      },
    },

    correctAnswer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    explanation: {
      type: String,
      default: "",
      maxlength: 15000,
    },

    imageUrl: {
      type: String,
      default: "",
      maxlength: 2000,
    },

    explanationImageUrl: {
      type: String,
      default: "",
      maxlength: 2000,
    },

    marks: {
      type: Number,
      default: 4,
      min: 0,
      max: 100,
    },

    negativeMarks: {
      type: Number,
      default: 1,
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({
  subject: 1,
  topic: 1,
  difficulty: 1,
  status: 1,
});

module.exports = mongoose.model("Question", questionSchema);
