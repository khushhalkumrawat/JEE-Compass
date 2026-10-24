import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Flag,
} from "lucide-react";
import { sampleQuestions } from "../data/questions";
import { getTestResult } from "../services/testResults";
import type { TestResult } from "../types/test";

export default function TestReview() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState<TestResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      try {
        if (!attemptId) return;

        const data = await getTestResult(attemptId);
        setResult(data.result);
      } catch (error) {
        console.error("Failed to load review:", error);
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, [attemptId]);

  if (loading) {
    return <p className="p-8 text-center text-slate-400">Loading answers...</p>;
  }

  if (!result) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0d1423] p-8 text-center">
        {" "}
        <h1 className="text-xl font-bold text-white">
          Review unavailable
        </h1>{" "}
        <p className="mt-2 text-slate-400">
          We couldn't load this test attempt.{" "}
        </p>
        <button
          onClick={() => navigate("/test-history")}
          className="mt-5 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
        >
          Back to Test History{" "}
        </button>{" "}
      </div>
    );
  }

  const question = sampleQuestions.find(
    (item) =>
      String(item.id) === String(result.answers[currentIndex]?.questionId),
  );

  const answer = result.answers[currentIndex];
  const isAnswered = answer?.answer !== null && answer?.answer !== undefined;
  const isCorrect = Boolean(
    question && isAnswered && answer.answer === question.correctAnswer,
  );

  if (!question || !answer) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0d1423] p-8 text-center">
        {" "}
        <p className="text-slate-300">
          The question for this saved answer could not be found.{" "}
        </p>
        <button
          onClick={() => navigate("/test-history")}
          className="mt-4 text-cyan-300"
        >
          Back to Test History{" "}
        </button>{" "}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {" "}
      <header className="flex flex-wrap items-center justify-between gap-4">
        {" "}
        <div>
          {" "}
          <h1 className="text-3xl font-bold text-white">Review Answers</h1>{" "}
          <p className="mt-2 text-sm text-slate-400">
            Review your responses and understand every solution.{" "}
          </p>{" "}
        </div>
        <button
          onClick={() => navigate(`/results/${attemptId}`)}
          className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
        >
          Back to Scorecard
        </button>
      </header>
      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <aside className="h-fit rounded-2xl border border-white/10 bg-[#0d1423] p-5">
          <p className="mb-4 font-semibold text-white">Questions</p>

          <div className="grid grid-cols-5 gap-2">
            {result.answers.map((item, index) => {
              const matchedQuestion = sampleQuestions.find(
                (q) => String(q.id) === String(item.questionId),
              );

              const answered =
                item.answer !== null && item.answer !== undefined;
              const correct = Boolean(
                matchedQuestion &&
                answered &&
                item.answer === matchedQuestion.correctAnswer,
              );

              return (
                <button
                  key={item.questionId}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative h-10 rounded-lg border text-sm font-semibold ${
                    currentIndex === index
                      ? "border-cyan-300 ring-2 ring-cyan-400/30"
                      : "border-white/10"
                  } ${
                    !answered
                      ? "bg-slate-800 text-slate-300"
                      : correct
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {index + 1}
                  {item.markedForReview && (
                    <Flag
                      size={11}
                      className="absolute -right-1 -top-1 text-amber-300"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 space-y-2 text-xs text-slate-400">
            <p>Green: Correct</p>
            <p>Red: Incorrect</p>
            <p>Grey: Unanswered</p>
            <p className="flex items-center gap-2">
              <Flag size={12} className="text-amber-300" />
              Marked for review
            </p>
          </div>
        </aside>

        <article className="rounded-2xl border border-white/10 bg-[#0d1423] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-400">
              Question {currentIndex + 1} of {result.answers.length}
            </p>

            {answer.markedForReview && (
              <span className="flex items-center gap-1.5 rounded-lg bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
                <Flag size={13} /> Marked for review
              </span>
            )}
          </div>

          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-cyan-300">
            {question.subject} · {question.topic}
          </p>

          <h2 className="mt-3 text-lg font-semibold leading-8 text-white">
            {question.question}
          </h2>

          <div className="mt-6 space-y-3">
            {question.options?.map((option) => {
              const selected = answer.answer === option;
              const correct = question.correctAnswer === option;

              return (
                <div
                  key={option}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${
                    correct
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                      : selected
                        ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                        : "border-white/10 bg-slate-900/40 text-slate-300"
                  }`}
                >
                  <span>{option}</span>
                  <span className="flex items-center gap-2 text-xs font-semibold">
                    {selected && !correct && (
                      <>
                        <XCircle size={15} /> Your answer
                      </>
                    )}
                    {correct && (
                      <>
                        <CheckCircle2 size={15} />
                        {selected ? "Your answer · Correct" : "Correct answer"}
                      </>
                    )}
                  </span>
                </div>
              );
            })}

            {!question.options && (
              <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 text-slate-300">
                Your answer: {isAnswered ? String(answer.answer) : "Unanswered"}
                <p className="mt-2 text-emerald-300">
                  Correct answer: {String(question.correctAnswer)}
                </p>
              </div>
            )}
          </div>

          <div
            className={`mt-5 flex items-center gap-2 rounded-xl p-4 text-sm font-semibold ${
              !isAnswered
                ? "bg-slate-800 text-slate-300"
                : isCorrect
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-rose-500/10 text-rose-300"
            }`}
          >
            {!isAnswered ? (
              "Unanswered"
            ) : isCorrect ? (
              <>
                <CheckCircle2 size={17} /> Correct answer · +{question.marks}{" "}
                marks
              </>
            ) : (
              <>
                <XCircle size={17} /> Incorrect answer · -
                {question.negativeMarks} marks
              </>
            )}
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/60 p-5">
            <h3 className="font-semibold text-white">Solution & Explanation</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {question.explanation}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((index) => index - 1)}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-white disabled:opacity-40"
            >
              <ArrowLeft size={16} /> Previous
            </button>

            <button
              disabled={currentIndex === result.answers.length - 1}
              onClick={() => setCurrentIndex((index) => index + 1)}
              className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-40"
            >
              Next <ArrowRight size={16} />
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
