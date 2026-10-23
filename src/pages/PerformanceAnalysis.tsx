import { useMemo } from "react";
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
import type { TestResult } from "../types/test";

export default function PerformanceAnalysis() {
  const navigate = useNavigate();

  const analysis = useMemo(() => {
    const saved = sessionStorage.getItem("jee-compass-test-result");

    if (!saved) return null;

    try {
      return analyzeTestResult(JSON.parse(saved) as TestResult);
    } catch {
      return null;
    }
  }, []);

  if (!analysis) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#0d1423] p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
          <Target size={24} />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-white">
          Performance Analysis
        </h1>

        <p className="mt-2 text-slate-400">
          Complete a mock test to see your performance analysis.
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

  const averageAccuracy =
    analysis.subjects.length > 0
      ? Math.round(
          analysis.subjects.reduce((sum, item) => sum + item.accuracy, 0) /
            analysis.subjects.length,
        )
      : 0;

  const incorrectQuestions = analysis.questionReviews.filter(
    (item) => item.userAnswer !== null && !item.isCorrect,
  );

  const revisionTopics =
    analysis.weakTopics.length > 0
      ? analysis.weakTopics
      : analysis.topics.filter((topic) => topic.attempted > 0).slice(0, 3);

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
          Understand your mistakes and decide what to revise next.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Average Subject Accuracy"
          value={`${averageAccuracy}%`}
          icon={<Target size={21} />}
        />
        <StatCard
          title="Topics Identified"
          value={String(analysis.topics.length)}
          icon={<BookOpen size={21} />}
        />
        <StatCard
          title="Incorrect Answers"
          value={String(incorrectQuestions.length)}
          icon={<XCircle size={21} />}
        />
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0d1423] p-6">
        <h2 className="text-xl font-bold text-white">
          Subject-wise Performance
        </h2>

        <div className="mt-5 space-y-5">
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
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0d1423] p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-amber-400" size={22} />
          <h2 className="text-xl font-bold text-white">Topics to Improve</h2>
        </div>

        {revisionTopics.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            Answer some questions to receive personalized revision suggestions.
          </p>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {revisionTopics.map((topic) => (
              <article
                key={topic.topic}
                className="rounded-xl border border-white/10 bg-slate-900/50 p-4"
              >
                <p className="text-xs font-semibold uppercase text-amber-300">
                  {topic.subject}
                </p>
                <h3 className="mt-2 font-semibold text-white">{topic.topic}</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Accuracy: {topic.accuracy}% · {topic.incorrect} incorrect
                </p>
                <p className="mt-3 text-sm text-slate-300">
                  Recommendation: Revise the concepts and solve more practice
                  questions.
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0d1423] p-6">
        <div className="flex items-center gap-3">
          <XCircle className="text-rose-400" size={22} />
          <h2 className="text-xl font-bold text-white">Review Your Mistakes</h2>
        </div>

        {incorrectQuestions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            No incorrect attempted answers found in your latest test.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {incorrectQuestions.map((item) => (
              <article
                key={item.question.id}
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
                  Your answer: {item.userAnswer}
                </p>
                <p className="mt-1 text-sm text-emerald-300">
                  Correct answer: {item.question.correctAnswer}
                </p>

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

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-cyan-300">
            <TrendingUp size={20} />
            <h2 className="font-bold">Ready for your next improvement?</h2>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Practice more questions and track your progress.
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
