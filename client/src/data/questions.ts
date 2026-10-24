import { dppQuestions } from "./dppQuestions";
import type { Question } from "../types/test";

const subjects: Question["subject"][] = ["Physics", "Chemistry", "Mathematics"];

// Five genuine numerical questions for each subject.
const numericalQuestions: Question[] = [
  // PHYSICS
  {
    id: 9001,
    subject: "Physics",
    topic: "Kinematics",
    question:
      "A body starts from rest and accelerates at 2 m/s² for 5 seconds. Find its final velocity in m/s.",
    options: undefined,
    correctAnswer: 10,
    type: "NUMERICAL",
    marks: 4,
    negativeMarks: 1,
    explanation: "v = u + at = 0 + 2 × 5 = 10 m/s.",
  },
  {
    id: 9002,
    subject: "Physics",
    topic: "Laws of Motion",
    question:
      "A 4 kg body accelerates at 3 m/s². Find the net force in newtons.",
    options: undefined,
    correctAnswer: 12,
    type: "NUMERICAL",
    marks: 4,
    negativeMarks: 1,
    explanation: "F = ma = 4 × 3 = 12 N.",
  },
  {
    id: 9003,
    subject: "Physics",
    topic: "Work and Energy",
    question:
      "A force of 10 N moves an object 5 m in the force direction. Find the work done in joules.",
    options: undefined,
    correctAnswer: 50,
    type: "NUMERICAL",
    marks: 4,
    negativeMarks: 1,
    explanation: "W = Fs = 10 × 5 = 50 J.",
  },
  {
    id: 9004,
    subject: "Physics",
    topic: "Current Electricity",
    question:
      "A 6 Ω resistor carries a current of 2 A. Find the voltage across it in volts.",
    options: undefined,
    correctAnswer: 12,
    type: "NUMERICAL",
    marks: 4,
    negativeMarks: 1,
    explanation: "V = IR = 2 × 6 = 12 V.",
  },
  {
    id: 9005,
    subject: "Physics",
    topic: "Waves",
    question:
      "A wave has frequency 8 Hz and wavelength 3 m. Find its speed in m/s.",
    options: undefined,
    correctAnswer: 24,
    type: "NUMERICAL",
    marks: 4,
    negativeMarks: 1,
    explanation: "v = fλ = 8 × 3 = 24 m/s.",
  },

  // CHEMISTRY
  {
    id: 9006,
    subject: "Chemistry",
    topic: "Mole Concept",
    question:
      "How many moles are present in 36 g of water? Molar mass of water = 18 g/mol.",
    options: undefined,
    correctAnswer: 2,
    type: "NUMERICAL",
    marks: 4,
    negativeMarks: 1,
    explanation: "Moles = mass / molar mass = 36 / 18 = 2.",
  },
  {
    id: 9007,
    subject: "Chemistry",
    topic: "Atomic Structure",
    question:
      "How many electrons are present in a neutral atom with atomic number 11?",
    options: undefined,
    correctAnswer: 11,
    type: "NUMERICAL",
    marks: 4,
    negativeMarks: 1,
    explanation: "A neutral atom has electrons equal to its atomic number.",
  },
  {
    id: 9008,
    subject: "Chemistry",
    topic: "Solutions",
    question:
      "A solution contains 2 moles of solute in 4 litres of solution. Find its molarity in mol/L.",
    options: undefined,
    correctAnswer: 0.5,
    type: "NUMERICAL",
    marks: 4,
    negativeMarks: 1,
    explanation: "Molarity = moles / volume = 2 / 4 = 0.5 mol/L.",
  },
  {
    id: 9009,
    subject: "Chemistry",
    topic: "Gases",
    question: "How many atoms are present in one molecule of ozone, O₃?",
    options: undefined,
    correctAnswer: 3,
    type: "NUMERICAL",
    marks: 4,
    negativeMarks: 1,
    explanation: "One O₃ molecule contains three oxygen atoms.",
  },
  {
    id: 9010,
    subject: "Chemistry",
    topic: "Acids and Bases",
    question: "At 25°C, what is the pH of a neutral aqueous solution?",
    options: undefined,
    correctAnswer: 7,
    type: "NUMERICAL",
    marks: 4,
    negativeMarks: 1,
    explanation: "A neutral aqueous solution has pH 7 at 25°C.",
  },

  // MATHEMATICS
  {
    id: 9011,
    subject: "Mathematics",
    topic: "Quadratic Equations",
    question: "Find the sum of the roots of x² − 9x + 14 = 0.",
    options: undefined,
    correctAnswer: 9,
    type: "NUMERICAL",
    marks: 4,
    negativeMarks: 1,
    explanation: "Sum of roots = −b/a = 9.",
  },
  {
    id: 9012,
    subject: "Mathematics",
    topic: "Differentiation",
    question: "If f(x) = x³, find f′(2).",
    options: undefined,
    correctAnswer: 12,
    type: "NUMERICAL",
    marks: 4,
    negativeMarks: 1,
    explanation: "f′(x) = 3x², so f′(2) = 12.",
  },
  {
    id: 9013,
    subject: "Mathematics",
    topic: "Integration",
    question: "Evaluate the definite integral of 2x from x = 0 to x = 3.",
    options: undefined,
    correctAnswer: 9,
    type: "NUMERICAL",
    marks: 4,
    negativeMarks: 1,
    explanation: "Integral = [x²] from 0 to 3 = 9.",
  },
  {
    id: 9014,
    subject: "Mathematics",
    topic: "Coordinate Geometry",
    question: "Find the distance between the points (0, 0) and (6, 8).",
    options: undefined,
    correctAnswer: 10,
    type: "NUMERICAL",
    marks: 4,
    negativeMarks: 1,
    explanation: "Distance = √(6² + 8²) = 10.",
  },
  {
    id: 9015,
    subject: "Mathematics",
    topic: "Probability",
    question:
      "A fair die is rolled once. How many equally likely outcomes are possible?",
    options: undefined,
    correctAnswer: 6,
    type: "NUMERICAL",
    marks: 4,
    negativeMarks: 1,
    explanation: "A standard die has six possible outcomes.",
  },
];

export const sampleQuestions: Question[] = subjects.flatMap((subject) => {
  const subjectMCQs = dppQuestions
    .filter(
      (question) =>
        question.subject === subject && question.type === "SINGLE_CORRECT",
    )
    .slice(0, 20);

  const subjectNumericalQuestions = numericalQuestions.filter(
    (question) => question.subject === subject,
  );

  return [...subjectMCQs, ...subjectNumericalQuestions].map(
    (question, index) => ({
      ...question,
      id:
        (subject === "Physics" ? 1000 : subject === "Chemistry" ? 2000 : 3000) +
        index +
        1,
    }),
  );
});
