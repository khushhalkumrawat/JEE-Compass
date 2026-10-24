import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { sampleQuestions } from "../data/questions";
import type { TestResult as TestResultData } from "../types/test";
import { getTestResult } from "../services/testResults";
import { useParams } from "react-router-dom";

export default function TestResult() {
  const navigate = useNavigate();
  const [result, setResult] = useState<TestResultData | null>(null);

  const { attemptId: testId } = useParams();

  useEffect(() => {
    async function loadResult() {
      try {
        if (testId) {
          const data = await getTestResult(testId);
          setResult(data.result);
          return;
        }

        const saved = sessionStorage.getItem("jee-compass-test-result");

        if (saved) {
          setResult(JSON.parse(saved) as TestResultData);
        }
      } catch (error) {
        console.error("Failed to load test result:", error);
      }
    }

    loadResult();
  }, [testId]);

  if (!result) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#0d1423] p-8 text-center">
        <h1 className="text-2xl font-bold text-white">No test result found</h1>
        <p className="mt-2 text-sm text-slate-400">
          Attempt a mock test first to generate your scorecard.
        </p>
        <button
          type="button"
          onClick={() => navigate("/tests")}
          className="mt-5 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
        >
          Go to Mock Tests
        </button>
      </section>
    );
  }

  const accuracy =
    result.attempted > 0
      ? Math.round((result.correct / result.attempted) * 100)
      : 0;

  const stats = [
    {
      label: "Score",
      value: `${result.score} / ${result.maxScore}`,
      color: "text-white",
    },
    { label: "Accuracy", value: `${accuracy}%`, color: "text-cyan-300" },
    { label: "Correct", value: result.correct, color: "text-emerald-400" },
    { label: "Incorrect", value: result.incorrect, color: "text-rose-400" },
    { label: "Unanswered", value: result.unanswered, color: "text-slate-400" },
    {
      label: "Time Taken",
      value: `${Math.floor(result.timeTakenSeconds / 60)}m ${result.timeTakenSeconds % 60}s`,
      color: "text-indigo-300",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="rounded-md bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Test Completed
          </span>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Scorecard & Review
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Review your answers, verify solutions, and analyze your gaps.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/tests")}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            <RotateCcw size={16} /> Retake
          </button>

          <button
            type="button"
            onClick={() => navigate(`/results/${testId}/review`)}
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            Review Answers
          </button>

          <button
            type="button"
            onClick={() => navigate("/analysis")}
            className="flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-300"
          >
            Analysis <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-white/10 bg-[#0d1423] p-4 text-center sm:text-left"
          >
            <p className="text-xs font-medium text-slate-400">{stat.label}</p>
            <p className={`mt-2 text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </article>
        ))}
      </div>

      <article className="rounded-2xl border border-white/10 bg-[#0d1423] p-6">
        <h2 className="text-xl font-bold text-white">Detailed Solutions</h2>
        <div className="mt-5 space-y-4">
          {sampleQuestions.map((question, index) => {
            const userAttempt = result.answers.find(
              (a) => a.questionId === String(question.id),
            );
            const selected = userAttempt?.answer;
            const isAnswered = selected !== null && selected !== undefined;
            const isCorrect = isAnswered && selected === question.correctAnswer;

            return (
              <div
                key={question.id}
                className={`rounded-xl border p-5 ${
                  !isAnswered
                    ? "border-white/10 bg-slate-900/40"
                    : isCorrect
                      ? "border-emerald-500/20 bg-emerald-500/[0.03]"
                      : "border-rose-500/20 bg-rose-500/[0.03]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      Q{index + 1}.
                    </span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                      {question.subject} · {question.topic}
                    </span>
                  </div>

                  <span className="flex items-center gap-1.5 text-xs font-semibold">
                    {!isAnswered ? (
                      <span className="flex items-center gap-1 text-slate-400">
                        <MinusCircle size={14} /> Skipped
                      </span>
                    ) : isCorrect ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 size={14} /> Correct (+{question.marks})
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400">
                        <XCircle size={14} /> Incorrect (-
                        {question.negativeMarks})
                      </span>
                    )}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-200">
                  {question.question}
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-900/80 p-2.5 text-xs">
                    <span className="text-slate-400">Your Answer: </span>
                    <span
                      className={
                        isCorrect
                          ? "font-bold text-emerald-300"
                          : isAnswered
                            ? "font-bold text-rose-300"
                            : "text-slate-500"
                      }
                    >
                      {selected ? String(selected) : "None"}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-900/80 p-2.5 text-xs">
                    <span className="text-slate-400">Correct Answer: </span>
                    <span className="font-bold text-emerald-300">
                      {question.correctAnswer}
                    </span>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-white/5 bg-slate-950/60 p-3 text-xs leading-5 text-slate-300">
                  <strong className="text-slate-400">Solution: </strong>
                  {question.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}
