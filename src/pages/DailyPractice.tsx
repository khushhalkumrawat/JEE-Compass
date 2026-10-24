import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleX,
  RotateCcw,
  Target,
} from "lucide-react";
import { dppQuestions } from "../data/dppQuestions";
import type { Question } from "../types/test";
import {
  fetchDPPProgress,
  saveDPPProgress,
  type DPPProgressData,
} from "../services/dppProgress";

type Subject = "All" | "Physics" | "Chemistry" | "Mathematics";

const STORAGE_KEY = "jee-compass-dpp-progress";

const emptyProgress: DPPProgressData = {
  answered: {},
  correct: [],
};

export default function DailyPractice() {
  const [subject, setSubject] = useState<Subject>("All");
  const [topic, setTopic] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState<DPPProgressData>(emptyProgress);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const progressRef = useRef<DPPProgressData>(emptyProgress);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    async function loadProgress() {
      setLoading(true);
      setError("");

      try {
        const serverProgress = await fetchDPPProgress();
        let restoredProgress = serverProgress;

        // Migrate existing browser progress only if the account has no saved answers.
        if (Object.keys(serverProgress.answered).length === 0) {
          const oldSaved = localStorage.getItem(STORAGE_KEY);

          if (oldSaved) {
            try {
              const oldProgress = JSON.parse(oldSaved) as DPPProgressData;

              if (
                oldProgress.answered &&
                typeof oldProgress.answered === "object"
              ) {
                restoredProgress = {
                  answered: oldProgress.answered,
                  correct: Array.isArray(oldProgress.correct)
                    ? oldProgress.correct
                    : [],
                };

                await saveDPPProgress(restoredProgress);
                localStorage.removeItem(STORAGE_KEY);

                if (mounted.current) {
                  setNotice("Your previous DPP progress has been saved to your account.");
                }
              } else {
                localStorage.removeItem(STORAGE_KEY);
              }
            } catch {
              // Keep server progress if old browser data is invalid.
              localStorage.removeItem(STORAGE_KEY);
            }
          }
        } else {
          // Account progress takes priority over browser-specific data.
          localStorage.removeItem(STORAGE_KEY);
        }

        if (mounted.current) {
          progressRef.current = restoredProgress;
          setProgress(restoredProgress);
        }
      } catch (err) {
        if (mounted.current) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your DPP progress. Please refresh the page.",
          );
        }
      } finally {
        if (mounted.current) setLoading(false);
      }
    }

    void loadProgress();

    return () => {
      mounted.current = false;
    };
  }, []);

  const filteredQuestions = useMemo(() => {
    return dppQuestions.filter((question) => {
      const subjectMatches = subject === "All" || question.subject === subject;
      const topicMatches = topic === "All" || question.topic === topic;
      return subjectMatches && topicMatches;
    });
  }, [subject, topic]);

  const availableTopics = useMemo(() => {
    const relevantQuestions = dppQuestions.filter(
      (question) => subject === "All" || question.subject === subject,
    );
    return [...new Set(relevantQuestions.map((question) => question.topic))];
  }, [subject]);

  const currentQuestion: Question | undefined = filteredQuestions[currentIndex];

  const answeredCount = filteredQuestions.filter(
    (question) => progress.answered[question.id] !== undefined,
  ).length;

  const correctCount = filteredQuestions.filter((question) =>
    progress.correct.includes(question.id),
  ).length;

  function changeFilters(nextSubject: Subject, nextTopic: string) {
    setSubject(nextSubject);
    setTopic(nextTopic);
    setCurrentIndex(0);
  }

  function saveSnapshot(nextProgress: DPPProgressData) {
    progressRef.current = nextProgress;
    setProgress(nextProgress);
    setSaving(true);
    setError("");
    setNotice("");

    // Queue saves in order so rapid answers cannot overwrite newer progress.
    saveQueue.current = saveQueue.current
      .catch(() => undefined)
      .then(async () => {
        await saveDPPProgress(nextProgress);
      })
      .then(() => {
        if (mounted.current) {
          setError("");
        }
      })
      .catch((err: unknown) => {
        if (mounted.current) {
          setError(
            err instanceof Error
              ? `Could not save your progress: ${err.message}`
              : "Could not save your progress. Please try again.",
          );
        }
      })
      .finally(() => {
        if (mounted.current) {
          setSaving(false);
        }
      });
  }

  function saveAnswer(question: Question, answer: string) {
    const latest = progressRef.current;

    if (latest.answered[question.id] !== undefined) return;

    const isCorrect = answer === question.correctAnswer;

    const nextProgress: DPPProgressData = {
      answered: {
        ...latest.answered,
        [question.id]: answer,
      },
      correct: isCorrect
        ? [...latest.correct.filter((id) => id !== question.id), question.id]
        : latest.correct.filter((id) => id !== question.id),
    };

    saveSnapshot(nextProgress);
  }

  async function resetProgress() {
    const confirmed = window.confirm(
      "Reset all your DPP answers and progress for your account?",
    );

    if (!confirmed) return;

    const previousProgress = progressRef.current;
    progressRef.current = emptyProgress;
    setProgress(emptyProgress);
    setCurrentIndex(0);
    setError("");
    setNotice("");
    setSaving(true);

    try {
      // Queue reset after any pending answer saves.
      saveQueue.current = saveQueue.current.catch(() => undefined).then(() =>
        saveDPPProgress(emptyProgress),
      );
      await saveQueue.current;
      localStorage.removeItem(STORAGE_KEY);

      if (mounted.current) {
        setNotice("Your DPP progress has been reset on your account.");
      }
    } catch (err) {
      if (mounted.current) {
        progressRef.current = previousProgress;
        setProgress(previousProgress);
        setError(
          err instanceof Error
            ? `Unable to reset progress: ${err.message}`
            : "Unable to reset progress. Please try again.",
        );
      }
    } finally {
      if (mounted.current) setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#0d1423] p-8 text-center">
        <Target className="mx-auto animate-pulse text-cyan-300" size={36} />
        <p className="mt-4 text-slate-300">Loading your saved DPP progress...</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300">
          Daily Practice Problems
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          Practice. Learn. Improve.
        </h1>
        <p className="mt-2 text-slate-400">
          Solve chapter-wise questions and understand every mistake.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200"
        >
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200">
          {notice}
        </div>
      )}

      {saving && (
        <p className="text-sm text-cyan-300" role="status">
          Saving your progress to your account...
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <ProgressCard label="Questions" value={filteredQuestions.length} />
        <ProgressCard label="Attempted" value={answeredCount} />
        <ProgressCard label="Correct" value={correctCount} />
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0d1423] p-5 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="dpp-subject" className="mb-2 block text-sm text-slate-400">
            Subject
          </label>
          <select
            id="dpp-subject"
            value={subject}
            onChange={(event) =>
              changeFilters(event.target.value as Subject, "All")
            }
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
          >
            <option value="All">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="dpp-topic" className="mb-2 block text-sm text-slate-400">
            Chapter / Topic
          </label>
          <select
            id="dpp-topic"
            value={topic}
            onChange={(event) => changeFilters(subject, event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
          >
            <option value="All">All Topics</option>
            {availableTopics.map((availableTopic) => (
              <option key={availableTopic} value={availableTopic}>
                {availableTopic}
              </option>
            ))}
          </select>
        </div>
      </section>

      {!currentQuestion ? (
        <section className="rounded-2xl border border-white/10 bg-[#0d1423] p-8 text-center">
          <Target className="mx-auto text-cyan-300" size={36} />
          <h2 className="mt-4 text-xl font-bold text-white">No questions found</h2>
          <p className="mt-2 text-slate-400">
            Try selecting a different subject or topic.
          </p>
        </section>
      ) : (
        <section className="rounded-2xl border border-white/10 bg-[#0d1423] p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-slate-400">
              Question {currentIndex + 1} of {filteredQuestions.length}
            </span>
            <span className="rounded-lg bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              {currentQuestion.subject} · {currentQuestion.topic}
            </span>
          </div>

          <h2 className="mt-6 text-lg font-semibold leading-8 text-white">
            {currentQuestion.question}
          </h2>

          <div className="mt-6 space-y-3">
            {currentQuestion.options?.map((option, index) => {
              const savedAnswer = progress.answered[currentQuestion.id];
              const isSelected = savedAnswer === option;
              const isCorrectOption = option === currentQuestion.correctAnswer;
              const hasAnswered = savedAnswer !== undefined;

              let optionStyle =
                "border-white/10 bg-slate-900/50 text-slate-300 hover:border-white/30";

              if (hasAnswered && isCorrectOption) {
                optionStyle =
                  "border-emerald-400/50 bg-emerald-400/10 text-emerald-200";
              } else if (hasAnswered && isSelected && !isCorrectOption) {
                optionStyle = "border-rose-400/50 bg-rose-400/10 text-rose-200";
              }

              return (
                <button
                  key={option}
                  type="button"
                  disabled={hasAnswered || saving}
                  onClick={() => saveAnswer(currentQuestion, option)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition disabled:cursor-default ${optionStyle}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-semibold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                  {hasAnswered && isCorrectOption && (
                    <CheckCircle2 className="ml-auto shrink-0 text-emerald-400" size={19} />
                  )}
                  {hasAnswered && isSelected && !isCorrectOption && (
                    <CircleX className="ml-auto shrink-0 text-rose-400" size={19} />
                  )}
                </button>
              );
            })}
          </div>

          {progress.answered[currentQuestion.id] !== undefined && (
            <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/70 p-5">
              <p
                className={`font-semibold ${
                  progress.answered[currentQuestion.id] === currentQuestion.correctAnswer
                    ? "text-emerald-300"
                    : "text-rose-300"
                }`}
              >
                {progress.answered[currentQuestion.id] === currentQuestion.correctAnswer
                  ? "Correct answer!"
                  : "Not quite. Review the explanation below."}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((index) => index - 1)}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-white disabled:opacity-40"
            >
              <ChevronLeft size={17} />
              Previous
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => void resetProgress()}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 disabled:opacity-40"
            >
              <RotateCcw size={16} />
              Reset Progress
            </button>

            <button
              type="button"
              disabled={currentIndex === filteredQuestions.length - 1}
              onClick={() => setCurrentIndex((index) => index + 1)}
              className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-40"
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function ProgressCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#0d1423] p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
    </article>
  );
}
