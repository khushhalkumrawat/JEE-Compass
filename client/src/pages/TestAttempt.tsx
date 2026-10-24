import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock3,
  Flag,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Send,
  UserRound,
  AlertTriangle,
} from "lucide-react";
import { sampleQuestions } from "../data/questions";
import QuestionPalette from "../components/test/QuestionPalette";
import type { TestAnswer, TestResult } from "../types/test";
import { saveTestResult } from "../services/testResults";

const TEST_DURATION_SECONDS = 3 * 60 * 60;
const SUBJECTS = ["Physics", "Chemistry", "Mathematics"] as const;

export default function TestAttempt() {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | number | null)[]>(
    sampleQuestions.map(() => null),
  );
  const [review, setReview] = useState<boolean[]>(
    sampleQuestions.map(() => false),
  );
  const [visited, setVisited] = useState<boolean[]>(
    sampleQuestions.map((_, index) => index === 0),
  );
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [submitted, setSubmitted] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [activeSubject, setActiveSubject] = useState<string>(
    sampleQuestions[0]?.subject ?? "Physics",
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const submittedRef = useRef(false);

  const currentQuestion = sampleQuestions[currentIndex];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  const answeredCount = answers.filter(
    (answer) => answer !== null && answer !== "",
  ).length;

  const unansweredCount = sampleQuestions.length - answeredCount;
  const reviewedCount = review.filter(Boolean).length;

  const subjectQuestions = sampleQuestions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => question.subject === activeSubject);

  const subjectQuestionIndices = subjectQuestions.map(({ index }) => index);

  const moveToQuestion = (index: number) => {
    if (index < 0 || index >= sampleQuestions.length) return;

    setCurrentIndex(index);
    setActiveSubject(sampleQuestions[index].subject);

    setVisited((previous) =>
      previous.map((value, i) => (i === index ? true : value)),
    );
  };

  const saveAnswer = (answer: string | number) => {
    setAnswers((previous) =>
      previous.map((value, index) => (index === currentIndex ? answer : value)),
    );
  };

  const clearResponse = () => {
    setAnswers((previous) =>
      previous.map((value, index) => (index === currentIndex ? null : value)),
    );
  };

  const markReviewAndNext = () => {
    setReview((previous) =>
      previous.map((value, index) => (index === currentIndex ? true : value)),
    );

    if (currentIndex < sampleQuestions.length - 1) {
      moveToQuestion(currentIndex + 1);
    }
  };

  const saveAndNext = () => {
    if (currentIndex < sampleQuestions.length - 1) {
      moveToQuestion(currentIndex + 1);
    }
  };

  const submitTest = useCallback(async () => {
    if (submittedRef.current) return;

    submittedRef.current = true;
    setSubmitted(true);
    setShowSubmitDialog(false);
    setSaving(true);
    setSaveError("");

    let correct = 0;
    let incorrect = 0;
    let score = 0;

    const finalAnswers: TestAnswer[] = sampleQuestions.map(
      (question, index) => {
        const answer = answers[index];
        const hasAnswer = answer !== null && answer !== "";

        if (hasAnswer) {
          if (String(answer).trim() === String(question.correctAnswer).trim()) {
            correct += 1;
            score += question.marks;
          } else {
            incorrect += 1;
            score -= question.negativeMarks;
          }
        }

        return {
          questionId: question.id,
          answer: hasAnswer ? answer : null,
          markedForReview: review[index],
        };
      },
    );

    const result: TestResult = {
      testId: crypto.randomUUID(),
      totalQuestions: sampleQuestions.length,
      attempted: correct + incorrect,
      correct,
      incorrect,
      unanswered: sampleQuestions.length - correct - incorrect,
      score,
      maxScore: sampleQuestions.reduce(
        (total, question) => total + question.marks,
        0,
      ),
      timeTakenSeconds: TEST_DURATION_SECONDS - timeLeft,
      answers: finalAnswers,
    };

    sessionStorage.setItem("jee-compass-test-result", JSON.stringify(result));

    try {
      await saveTestResult(result);
      navigate(`/results/${result.testId}`);
    } catch (error) {
      console.error("Test result save failed:", error);

      setSaveError(
        "Your result could not be saved to the server. Check your connection and try again.",
      );

      submittedRef.current = false;
      setSubmitted(false);
    } finally {
      setSaving(false);
    }
  }, [answers, navigate, review, timeLeft]);

  useEffect(() => {
    if (submitted) return;

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [submitted]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      void submitTest();
    }
  }, [timeLeft, submitted, submitTest]);

  if (!currentQuestion) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-slate-900">
        No questions available.
      </div>
    );
  }

  const totalMarks = sampleQuestions.reduce(
    (sum, question) => sum + question.marks,
    0,
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      {/* Header */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-black text-white">
            JC
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              JEE Compass
            </p>

            <h1 className="truncate text-base font-bold sm:text-lg">
              Joint Entrance Examination
            </h1>

            <p className="text-xs text-slate-500">
              Computer Based Test Â· Mock Examination
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
            <UserRound size={18} className="text-blue-600" />

            <div>
              <p className="text-xs text-slate-500">Candidate</p>
              <p className="text-sm font-semibold">JEE Aspirant</p>
            </div>
          </div>

          <div
            className={`rounded-lg border px-3 py-2 ${
              timeLeft <= 300
                ? "border-red-300 bg-red-50"
                : "border-blue-200 bg-blue-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock3
                size={16}
                className={timeLeft <= 300 ? "text-red-600" : "text-blue-600"}
              />

              <span className="text-xs text-slate-600">Time Left</span>
            </div>

            <p
              className={`font-mono text-lg font-bold ${
                timeLeft <= 300 ? "text-red-600" : "text-blue-700"
              }`}
            >
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>
      </header>

      {/* Examination information */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2 sm:px-6">
        <div>
          <p className="text-xs text-slate-500">Examination</p>
          <p className="text-sm font-semibold">JEE Main Â· Practice Paper</p>
        </div>

        <div className="text-xs text-slate-600 sm:text-sm">
          Questions:{" "}
          <span className="font-bold text-slate-900">
            {sampleQuestions.length}
          </span>
          <span className="mx-2 text-slate-300">|</span>
          Maximum Marks:{" "}
          <span className="font-bold text-slate-900">{totalMarks}</span>
        </div>
      </div>

      {/* Subject tabs */}
      <nav className="grid shrink-0 grid-cols-3 gap-2 bg-slate-100 px-3 py-2 sm:px-4">
        {SUBJECTS.map((subject) => {
          const count = sampleQuestions.filter(
            (question) => question.subject === subject,
          ).length;

          return (
            <button
              key={subject}
              type="button"
              onClick={() => {
                setActiveSubject(subject);

                const firstIndex = sampleQuestions.findIndex(
                  (question) => question.subject === subject,
                );

                if (firstIndex !== -1) {
                  moveToQuestion(firstIndex);
                }
              }}
              className={`rounded-lg border px-2 py-2 text-sm font-bold transition sm:px-3 ${
                activeSubject === subject
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
              }`}
            >
              {subject}
              <span className="ml-1 text-xs opacity-75">({count})</span>
            </button>
          );
        })}
      </nav>

      {/* Main area: remaining viewport height */}
      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden px-3 pb-3 lg:grid-cols-[minmax(0,1fr)_290px] lg:px-4">
        {/* Question panel */}
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          {/* Question header */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-6">
            <div>
              <p className="text-xs font-medium text-blue-600">
                {currentQuestion.subject}
              </p>

              <h2 className="mt-1 font-bold text-slate-900">
                Question No. {currentIndex + 1}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-md bg-emerald-50 px-2 py-1.5 font-semibold text-emerald-700">
                +{currentQuestion.marks} correct
              </span>

              <span className="rounded-md bg-red-50 px-2 py-1.5 font-semibold text-red-700">
                âˆ’{currentQuestion.negativeMarks} incorrect
              </span>

              <span className="rounded-md bg-slate-100 px-2 py-1.5 text-slate-700">
                {currentQuestion.type === "NUMERICAL"
                  ? "Numerical"
                  : "Single Correct"}
              </span>
            </div>
          </div>

          {/* Only this question-content area scrolls */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-blue-700">
                {currentQuestion.topic}
              </span>

              <span className="text-xs text-slate-500">
                Question {currentIndex + 1} of {sampleQuestions.length}
              </span>
            </div>

            <h3 className="whitespace-pre-wrap text-base leading-7 text-slate-900 sm:text-lg sm:leading-8">
              {currentQuestion.question}
            </h3>

            {currentQuestion.type === "NUMERICAL" ? (
              <div className="mt-6 max-w-sm">
                <label
                  htmlFor={`numerical-${currentQuestion.id}`}
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Enter your numerical answer
                </label>

                <input
                  id={`numerical-${currentQuestion.id}`}
                  type="number"
                  value={answers[currentIndex] ?? ""}
                  onChange={(event) => saveAnswer(event.target.value)}
                  placeholder="Enter answer"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {currentQuestion.options?.map((option, index) => {
                  const selected = answers[currentIndex] === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => saveAnswer(option)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition sm:p-4 ${
                        selected
                          ? "border-blue-500 bg-blue-50 text-slate-900 ring-1 ring-blue-200"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                          selected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-white text-slate-700"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>

                      <span className="min-w-0 break-words">{option}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation footer: never shrinks out of view */}
          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-3 py-3 sm:px-4">
            <button
              type="button"
              disabled={currentIndex === 0 || submitted || saving}
              onClick={() => moveToQuestion(currentIndex - 1)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={clearResponse}
                disabled={submitted || saving}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <RotateCcw size={15} />
                Clear
              </button>

              <button
                type="button"
                onClick={markReviewAndNext}
                disabled={submitted || saving}
                className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-100 disabled:opacity-50"
              >
                <Flag size={15} />
                <span>Review &amp; Next</span>
              </button>

              <button
                type="button"
                onClick={saveAndNext}
                disabled={
                  currentIndex === sampleQuestions.length - 1 ||
                  submitted ||
                  saving
                }
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save &amp; Next
                <ChevronRight size={16} />
              </button>
            </div>
          </footer>
        </section>

        {/* Right-side palette: independent scroll */}
        <aside className="flex min-h-0 min-w-0 flex-col overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-4 shrink-0 border-b border-slate-200 pb-3">
            <h2 className="font-bold text-slate-900">Question Palette</h2>

            <p className="mt-1 text-xs text-slate-500">
              {activeSubject} Â· {subjectQuestions.length} questions
            </p>
          </div>

          <div className="min-h-0">
            <QuestionPalette
              total={subjectQuestionIndices.length}
              current={subjectQuestionIndices.indexOf(currentIndex)}
              answers={subjectQuestionIndices.map((index) => answers[index])}
              review={subjectQuestionIndices.map((index) => review[index])}
              visited={subjectQuestionIndices.map((index) => visited[index])}
              onSelect={(paletteIndex) => {
                const questionIndex = subjectQuestionIndices[paletteIndex];

                if (questionIndex !== undefined) {
                  moveToQuestion(questionIndex);
                }
              }}
            />

            <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-3">
              <h3 className="mb-3 text-sm font-bold text-slate-900">
                Marking Scheme
              </h3>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Correct answer</span>
                  <strong className="text-emerald-700">+4 marks</strong>
                </div>

                <div className="flex justify-between">
                  <span>Incorrect answer</span>
                  <strong className="text-red-700">−1 mark</strong>
                </div>

                <div className="flex justify-between">
                  <span>Unanswered</span>
                  <strong>0 marks</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid shrink-0 grid-cols-2 gap-2">
            <div className="rounded-lg bg-emerald-50 p-3">
              <p className="text-xs text-emerald-700">Answered</p>
              <p className="mt-1 text-xl font-bold text-emerald-800">
                {answeredCount}
              </p>
            </div>

            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-xs text-red-700">Unanswered</p>
              <p className="mt-1 text-xl font-bold text-red-800">
                {unansweredCount}
              </p>
            </div>

            <div className="col-span-2 rounded-lg bg-purple-50 p-3">
              <p className="text-xs text-purple-700">Marked for review</p>
              <p className="mt-1 text-xl font-bold text-purple-800">
                {reviewedCount}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSubmitDialog(true)}
            disabled={submitted || saving}
            className="mt-4 flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={17} />
            {saving ? "Saving Result..." : "Submit Test"}
          </button>

          {saveError && (
            <div className="mt-3 shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p>{saveError}</p>

              <button
                type="button"
                onClick={() => void submitTest()}
                className="mt-2 font-bold underline"
              >
                Retry saving
              </button>
            </div>
          )}
        </aside>
      </main>

      {/* Submission confirmation */}
      {showSubmitDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-dialog-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
              <AlertTriangle className="text-amber-600" />
            </div>

            <h2
              id="submit-dialog-title"
              className="text-xl font-bold text-slate-900"
            >
              Submit your examination?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Are you sure you want to submit? You will not be able to change
              your answers after submission.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-xs text-emerald-700">Answered</p>
                <p className="mt-1 text-xl font-bold text-emerald-800">
                  {answeredCount}
                </p>
              </div>

              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-xs text-red-700">Unanswered</p>
                <p className="mt-1 text-xl font-bold text-red-800">
                  {unansweredCount}
                </p>
              </div>

              <div className="rounded-lg bg-purple-50 p-3">
                <p className="text-xs text-purple-700">Review</p>
                <p className="mt-1 text-xl font-bold text-purple-800">
                  {reviewedCount}
                </p>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="mt-4 text-sm font-medium text-amber-700">
                You have {unansweredCount} unanswered question(s).
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitDialog(false)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={() => void submitTest()}
                disabled={saving}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Submitting..." : "Confirm Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
