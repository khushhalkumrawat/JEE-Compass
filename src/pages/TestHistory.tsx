import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTestHistory } from "../services/testResults";

interface TestResult {
  testId: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  score: number;
  maxScore: number;
  timeTakenSeconds: number;
  createdAt: string;
}

export default function TestHistory() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTestHistory()
      .then((data) => {
        setResults(data.results ?? []);
      })
      .catch(() => {
        setError("Unable to load test history. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const totalTests = results.length;

  const averageScore =
    totalTests > 0
      ? results.reduce(
          (sum, result) =>
            sum +
            (result.maxScore > 0 ? (result.score / result.maxScore) * 100 : 0),
          0,
        ) / totalTests
      : 0;

  const totalCorrect = results.reduce((sum, result) => sum + result.correct, 0);

  const totalAttempted = results.reduce(
    (sum, result) => sum + result.attempted,
    0,
  );

  const accuracy =
    totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading your test history...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Test History
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Track your mock tests, review your scores, and measure your progress.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Tests Attempted</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalTests}</p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Average Score</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {averageScore.toFixed(1)}%
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Overall Accuracy</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {accuracy.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Previous Attempts
        </h2>

        {results.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500">
              You haven't attempted any tests yet.
            </p>
            <Link
              to="/tests"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
            >
              Explore Mock Tests
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => {
              const percentage =
                result.maxScore > 0
                  ? (result.score / result.maxScore) * 100
                  : 0;

              return (
                <div
                  key={result.testId}
                  className="flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-900">Mock Test</p>

                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(result.createdAt).toLocaleString()}
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      {result.attempted}/{result.totalQuestions} attempted
                      {" · "}
                      {result.correct} correct
                      {" · "}
                      {result.incorrect} incorrect
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {result.score}/{result.maxScore}
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          percentage >= 75
                            ? "text-green-600"
                            : percentage >= 40
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {percentage.toFixed(1)}%
                      </p>
                    </div>

                    <Link
                      to={`/results/${result.testId}`}
                      className="rounded-lg bg-green-500 px-4 py-2 font-medium text-blue-700 hover:bg-green-300"
                    >
                      View Result
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
