import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { analyzeTestResult } from "../utils/analysis";
import { getTestHistory } from "../services/testResults";
import type { TestResult } from "../types/test";
import { updateMistakeTypes } from "../services/testResults";

interface SavedTest extends TestResult {
  createdAt: string;
  mistakeTypes?: Record<string, string>;
}

export default function PerformanceAnalysis() {
  const navigate = useNavigate();

  const [results, setResults] = useState<SavedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mistakeTypes, setMistakeTypes] = useState<Record<string, string>>({});
  const [savingMistakes, setSavingMistakes] = useState(false);
  const [mistakeSaveError, setMistakeSaveError] = useState("");

  // function :
  const handleMistakeChange = async (questionId: number, value: string) => {
    if (!latest) return;

    const updatedMistakes = { ...mistakeTypes };

    if (value) {
      updatedMistakes[String(questionId)] = value;
    } else {
      delete updatedMistakes[String(questionId)];
    }

    setMistakeTypes(updatedMistakes);
    setSavingMistakes(true);
    setMistakeSaveError("");

    try {
      await updateMistakeTypes(latest.testId, updatedMistakes);
    } catch (error) {
      setMistakeSaveError(
        error instanceof Error
          ? error.message
          : "Unable to save mistake classification.",
      );
    } finally {
      setSavingMistakes(false);
    }
  };

  useEffect(() => {
    getTestHistory()
      .then((data) => {
        const savedResults: SavedTest[] = data.results ?? [];
        setResults(savedResults);

        const sortedResults = [...savedResults].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

        const latestTest = sortedResults[sortedResults.length - 1];

        setMistakeTypes(latestTest?.mistakeTypes ?? {});
      })
      .catch(() => {
        setError("Unable to load performance data. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const { analysis, latest, latestAnalysis, averageScore, scoreTrend } =
    useMemo(() => {
      const sortedResults = [...results].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      const scoreTrend = sortedResults.map((result, index) => ({
        testNumber: index + 1,
        date: result.createdAt,
        score: result.score,
        maxScore: result.maxScore,
        percentage:
          result.maxScore > 0 ? (result.score / result.maxScore) * 100 : 0,
      }));

      const averageScore =
        sortedResults.length > 0
          ? sortedResults.reduce(
              (sum, result) =>
                sum +
                (result.maxScore > 0
                  ? (result.score / result.maxScore) * 100
                  : 0),
              0,
            ) / sortedResults.length
          : 0;

      // Convert MongoDB question IDs from strings to numbers.
      // The existing analysis utility expects numeric IDs.
      const allAnswers = sortedResults.flatMap((result) =>
        result.answers.map((answer) => ({
          questionId: Number(answer.questionId),
          answer: answer.answer,
          markedForReview: answer.markedForReview,
        })),
      );

      const aggregateResult: TestResult = {
        testId: "historical-analysis",
        totalQuestions: allAnswers.length,
        attempted: allAnswers.filter((answer) => answer.answer !== null).length,
        correct: 0,
        incorrect: 0,
        unanswered: 0,
        score: 0,
        maxScore: 0,
        timeTakenSeconds: 0,
        answers: allAnswers,
      };

      const analysis =
        allAnswers.length > 0 ? analyzeTestResult(aggregateResult) : null;

      const latest = sortedResults[sortedResults.length - 1];

      const latestAnalysis = latest
        ? analyzeTestResult({
            ...latest,
            answers: latest.answers.map((answer) => ({
              ...answer,
              questionId: Number(answer.questionId),
            })),
          })
        : null;

      return {
        analysis,
        latest,
        latestAnalysis,
        averageScore,
        scoreTrend,
      };
    }, [results]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading your performance analytics...
      </div>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#0d1423] p-8">
        <h1 className="text-2xl font-bold text-white">Performance Analysis</h1>
        <p className="mt-3 text-rose-300">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-5 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
        >
          Try Again
        </button>
      </section>
    );
  }

  if (!analysis || results.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#0d1423] p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
          <Target size={24} />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-white">
          Performance Analysis
        </h1>

        <p className="mt-2 text-slate-400">
          Complete a mock test to see your performance analytics.
        </p>

        <button
          type="button"
          onClick={() => navigate("/tests")}
          className="mt-6 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
        >
          Start a Mock Test
        </button>
      </section>
    );
  }

  const totalCorrect = analysis.subjects.reduce(
    (sum, subject) => sum + subject.correct,
    0,
  );

  const totalAttempted = analysis.subjects.reduce(
    (sum, subject) => sum + subject.attempted,
    0,
  );

  const overallAccuracy =
    totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  const incorrectQuestions =
    latestAnalysis?.questionReviews.filter(
      (item) => item.userAnswer !== null && !item.isCorrect,
    ) ?? [];

  const mistakeCategories = [
    "Conceptual Error",
    "Calculation Error",
    "Careless Error",
    "Guessed Answer",
  ];

  const revisionTopics =
    analysis.weakTopics.length > 0
      ? analysis.weakTopics.slice(0, 6)
      : analysis.topics.filter((topic) => topic.attempted > 0).slice(0, 3);

  const bestSubject = [...analysis.subjects]
    .filter((subject) => subject.attempted > 0)
    .sort((a, b) => b.accuracy - a.accuracy)[0];

  const weakestSubject = [...analysis.subjects]
    .filter((subject) => subject.attempted > 0)
    .sort((a, b) => a.accuracy - b.accuracy)[0];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300">
          Your Learning Insights
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Performance Analysis
        </h1>

        <p className="mt-2 text-slate-400">
          Track your progress across all saved mock tests and identify the
          topics that need more attention.
        </p>
      </header>

      {/* Overall statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tests Completed"
          value={String(results.length)}
          icon={<BookOpen size={21} />}
        />

        <StatCard
          title="Average Score"
          value={`${averageScore.toFixed(1)}%`}
          icon={<TrendingUp size={21} />}
        />

        <StatCard
          title="Overall Accuracy"
          value={`${overallAccuracy}%`}
          icon={<Target size={21} />}
        />

        <StatCard
          title="Incorrect in Latest Test"
          value={String(incorrectQuestions.length)}
          icon={<XCircle size={21} />}
        />
      </div>

      {/* Score trends */}
      <section className="rounded-2xl border border-white/10 bg-[#0d1423] p-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-cyan-300" size={22} />

          <div>
            <h2 className="text-xl font-bold text-white">Score Progress</h2>
            <p className="mt-1 text-sm text-slate-400">
              Compare your percentage scores across previous attempts.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {scoreTrend.map((test) => {
            const barWidth = Math.max(0, Math.min(100, test.percentage));

            return (
              <div key={`${test.date}-${test.testNumber}`}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">
                      Test {test.testNumber}
                    </p>

                    <p className="text-xs text-slate-500">
                      {new Date(test.date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-white">
                      {test.score}/{test.maxScore}
                    </p>

                    <p className="text-sm text-cyan-300">
                      {test.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      test.percentage >= 75
                        ? "bg-emerald-400"
                        : test.percentage >= 40
                          ? "bg-cyan-400"
                          : "bg-rose-400"
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Subject-wise performance */}
      <section className="rounded-2xl border border-white/10 bg-[#0d1423] p-6">
        <h2 className="text-xl font-bold text-white">
          Subject-wise Performance
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Accuracy is calculated using answers from all saved attempts.
        </p>

        <div className="mt-5 space-y-6">
          {analysis.subjects.map((subject) => (
            <div key={subject.subject}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="font-medium text-white">
                  {subject.subject}
                </span>

                <span className="text-sm text-slate-400">
                  {subject.correct}/{subject.attempted} correct ·{" "}
                  {subject.accuracy}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{ width: `${subject.accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {bestSubject && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
              <p className="text-sm text-slate-400">Strongest Subject</p>
              <p className="mt-2 font-bold text-emerald-300">
                {bestSubject.subject} · {bestSubject.accuracy}%
              </p>
            </div>

            {weakestSubject && (
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
                <p className="text-sm text-slate-400">Needs More Practice</p>
                <p className="mt-2 font-bold text-amber-300">
                  {weakestSubject.subject} · {weakestSubject.accuracy}%
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Topic-wise performance */}
      <section className="rounded-2xl border border-white/10 bg-[#0d1423] p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-amber-400" size={22} />

          <h2 className="text-xl font-bold text-white">Topics to Improve</h2>
        </div>

        {revisionTopics.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            Attempt more questions to receive topic-specific revision
            suggestions.
          </p>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {revisionTopics.map((topic) => (
              <article
                key={`${topic.subject}-${topic.topic}`}
                className="rounded-xl border border-white/10 bg-slate-900/50 p-4"
              >
                <p className="text-xs font-semibold uppercase text-amber-300">
                  {topic.subject}
                </p>

                <h3 className="mt-2 font-semibold text-white">{topic.topic}</h3>

                <p className="mt-2 text-sm text-slate-400">
                  Accuracy: {topic.accuracy}% · {topic.incorrect} incorrect ·{" "}
                  {topic.attempted} attempted
                </p>

                <p className="mt-3 text-sm text-slate-300">
                  Recommendation: Revise the concepts and solve more practice
                  questions from this topic.
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Latest test mistakes */}
      <section className="rounded-2xl border border-white/10 bg-[#0d1423] p-6">
        <div className="flex items-center gap-3">
          <XCircle className="text-rose-400" size={22} />

          <h2 className="text-xl font-bold text-white">
            Review Your Latest Mistakes
          </h2>
        </div>

        {incorrectQuestions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            No incorrect attempted answers were found in your latest test.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {incorrectQuestions.map((item, index) => (
              <article
                key={`${item.question.id}-${index}`}
                className="rounded-xl border border-white/10 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-cyan-300">
                    {item.question.subject} · {item.question.topic}
                  </span>

                  <span className="text-xs text-rose-300">Incorrect</span>
                </div>

                <h3 className="mt-3 font-semibold leading-7 text-white">
                  {item.question.question}
                </h3>

                <p className="mt-3 text-sm text-slate-400">
                  Your answer: {String(item.userAnswer)}
                </p>

                <p className="mt-1 text-sm text-emerald-300">
                  Correct answer: {String(item.question.correctAnswer)}
                </p>

                <div className="mt-4">
                  <label
                    htmlFor={`mistake-${item.question.id}`}
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Why did you get this question wrong?
                  </label>

                  <select
                    id={`mistake-${item.question.id}`}
                    value={mistakeTypes[item.question.id] ?? ""}
                    onChange={(event) =>
                      void handleMistakeChange(
                        item.question.id,
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    <option value="">Select the reason</option>

                    {mistakeCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <select
                    id={`mistake-${item.question.id}`}
                    value={mistakeTypes[item.question.id] ?? ""}
                    onChange={(event) =>
                      void handleMistakeChange(
                        item.question.id,
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    {/* Keep your existing dropdown options here */}{" "}
                  </select>

                  {savingMistakes && (
                    <p className="mt-2 text-xs text-cyan-300">
                      Saving classification...
                    </p>
                  )}

                  {mistakeSaveError && (
                    <p className="mt-2 text-xs text-red-400">
                      {mistakeSaveError}
                    </p>
                  )}
                </div>

                {mistakeTypes[item.question.id] && (
                  <div className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3">
                    <p className="text-sm font-semibold text-cyan-300">
                      Your revision action
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      {mistakeTypes[item.question.id] === "Conceptual Error"
                        ? "Revise the underlying concept and solve 5 similar questions."
                        : mistakeTypes[item.question.id] === "Calculation Error"
                          ? "Practise the required calculations and verify each step."
                          : mistakeTypes[item.question.id] === "Careless Error"
                            ? "Practise reading questions carefully and checking your final answer."
                            : "Revisit the topic and attempt similar questions without guessing."}
                    </p>
                  </div>
                )}

                <div className="mt-4 rounded-xl bg-slate-900 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Explanation
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {item.question.explanation}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Next action */}
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-cyan-300">
            <CheckCircle2 size={20} />

            <h2 className="font-bold">Ready to improve your performance?</h2>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Use these insights to prepare for your next mock test.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/tests")}
          className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
        >
          Take Another Test <ArrowRight size={17} />
        </button>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#0d1423] p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-400">{title}</p>
        <span className="text-cyan-300">{icon}</span>
      </div>

      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
    </article>
  );
}
