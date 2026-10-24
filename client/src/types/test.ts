export type QuestionType = "SINGLE_CORRECT" | "NUMERICAL";

export interface Question {
  id: number;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  type: QuestionType;
  subject: "Physics" | "Chemistry" | "Mathematics";
  topic: string;
  marks: number;
  negativeMarks: number;
  explanation: string;
}

export interface TestAnswer {
  questionId: string;
  answer: string | number | null;
  markedForReview: boolean;
}

export interface TestResult {
  testId: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  score: number;
  maxScore: number;
  timeTakenSeconds: number;
  answers: TestAnswer[];
}
