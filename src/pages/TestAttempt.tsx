import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock3, Flag, ChevronLeft, ChevronRight } from "lucide-react";
import { sampleQuestions } from "../data/questions";
import QuestionPalette from "../components/test/QuestionPalette";
import type { TestAnswer, TestResult } from "../types/test";

const TEST_DURATION_SECONDS = 30 * 60;

export default function TestAttempt() {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | number | null)[]>(
    sampleQuestions.map(() => null),
  );
  const [review, setReview] = useState<boolean[]>(
    sampleQuestions.map(() => false),
  );
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) return;

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [submitted]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      submitTest();
    }
  }, [timeLeft, submitted]);

  const currentQuestion = sampleQuestions[currentIndex];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  function toggleReview() {
    setReview((previous) =>
      previous.map((value, index) => (index === currentIndex ? !value : value)),
    );
  }

  function saveAnswer(answer: string | number) {
    setAnswers((previous) =>
      previous.map((value, index) => (index === currentIndex ? answer : value)),
    );
  }

  function submitTest() {
    if (submitted) return;

    setSubmitted(true);

    let correct = 0;
    let incorrect = 0;
    let score = 0;

    const finalAnswers: TestAnswer[] = sampleQuestions.map(
      (question, index) => {
        const answer = answers[index];

        if (answer !== null) {
          if (answer === question.correctAnswer) {
            correct += 1;
            score += question.marks;
          } else {
            incorrect += 1;
            score -= question.negativeMarks;
          }
        }

        return {
          questionId: question.id,
          answer,
          markedForReview: review[index],
        };
      },
    );

    const result: TestResult = {
      testId: "jee-compass-demo-test",
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
    navigate(`/results/${result.testId}`)
  }

  if (!currentQuestion) {
    return <p className="text-white">No questions available.</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0d1423] p-5">
        <div>
          <p className="text-sm text-slate-400">JEE Compass</p>
          <h1 className="text-xl font-bold text-white">JEE Practice Test</h1>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-3">
          <Clock3 size={18} className="text-cyan-400" />
          <span className="font-mono text-lg font-bold text-white">
            {formatTime(timeLeft)}
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <section className="rounded-2xl border border-white/10 bg-[#0d1423] p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <span className="text-sm text-slate-400">
              Question {currentIndex + 1} of {sampleQuestions.length}
            </span>

            <span className="rounded-lg bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              {currentQuestion.subject} · {currentQuestion.topic}
            </span>
          </div>

          <h2 className="text-lg font-semibold leading-8 text-white">
            {currentQuestion.question}
          </h2>

          <div className="mt-7 space-y-3">
            {currentQuestion.options?.map((option, index) => {
              const selected = answers[currentIndex] === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => saveAnswer(option)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-cyan-400 bg-cyan-400/10 text-white"
                      : "border-white/10 bg-slate-900/50 text-slate-300 hover:border-white/30"
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-semibold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((index) => index - 1)}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-white disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <button
              type="button"
              onClick={toggleReview}
              className="flex items-center gap-2 rounded-xl border border-amber-400/30 px-4 py-3 text-sm text-amber-300"
            >
              <Flag size={16} />
              {review[currentIndex] ? "Unmark review" : "Mark for review"}
            </button>

            {currentIndex < sampleQuestions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((index) => index + 1)}
                className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={submitTest}
                className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white"
              >
                Submit Test
              </button>
            )}
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-white/10 bg-[#0d1423] p-5">
          <QuestionPalette
            total={sampleQuestions.length}
            current={currentIndex}
            answers={answers}
            review={review}
            onSelect={setCurrentIndex}
          />

          <div className="mt-6 space-y-2 border-t border-white/10 pt-5 text-sm text-slate-400">
            <p>
              Answered: {answers.filter((answer) => answer !== null).length}
            </p>
            <p>
              Unanswered: {answers.filter((answer) => answer === null).length}
            </p>
            <p>For review: {review.filter(Boolean).length}</p>
          </div>

          <button
            type="button"
            onClick={submitTest}
            className="mt-6 w-full rounded-xl bg-emerald-500 px-4 py-3 font-bold text-white"
          >
            Submit Test
          </button>
        </aside>
      </div>
    </div>
  );
}
