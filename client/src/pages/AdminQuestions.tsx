import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  BookOpen,
  CheckCircle2,
  CirclePlus,
  Pencil,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import {
  createQuestion,
  deleteQuestion,
  fetchAdminQuestions,
  updateQuestion,
  type AdminQuestion,
  type QuestionInput,
} from "../services/adminQuestions";

const emptyForm: QuestionInput = {
  subject: "Physics",
  topic: "",
  difficulty: "MEDIUM",
  type: "SINGLE_CORRECT",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  explanation: "",
  imageUrl: "",
  explanationImageUrl: "",
  marks: 4,
  negativeMarks: 1,
  status: "DRAFT",
};

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-indigo-400";

const labelClass = "mb-2 block text-sm font-medium text-slate-300";

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<QuestionInput>({ ...emptyForm });

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await fetchAdminQuestions({
        subject: subjectFilter,
        status: statusFilter,
      });

      setQuestions(result.questions);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load questions."
      );
    } finally {
      setLoading(false);
    }
  }, [subjectFilter, statusFilter]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  function openNewQuestion() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      options: [...emptyForm.options],
    });
    setError("");
    setNotice("");
    setEditorOpen(true);
  }

  function openEditQuestion(question: AdminQuestion) {
    setEditingId(question.id);
    setForm({
      subject: question.subject,
      topic: question.topic,
      difficulty: question.difficulty,
      type: question.type,
      question: question.question,
      options:
        question.type === "SINGLE_CORRECT"
          ? [...question.options]
          : [],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "",
      imageUrl: question.imageUrl || "",
      explanationImageUrl: question.explanationImageUrl || "",
      marks: question.marks,
      negativeMarks: question.negativeMarks,
      status: question.status,
    });
    setError("");
    setNotice("");
    setEditorOpen(true);
  }

  function updateOption(index: number, value: string) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? value : option
      ),
    }));
  }

  function updateField<K extends keyof QuestionInput>(
    key: K,
    value: QuestionInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload: QuestionInput = {
        ...form,
        topic: form.topic.trim(),
        question: form.question.trim(),
        options:
          form.type === "SINGLE_CORRECT"
            ? form.options.map((option) => option.trim())
            : [],
        correctAnswer: form.correctAnswer.trim(),
      };

      if (payload.type === "SINGLE_CORRECT") {
        const options = payload.options;

        if (
          options.length < 2 ||
          options.some((option) => !option) ||
          new Set(options).size !== options.length
        ) {
          throw new Error(
            "Enter 2-6 non-empty, distinct options."
          );
        }

        if (!options.includes(payload.correctAnswer)) {
          throw new Error(
            "Select the correct answer from the options."
          );
        }
      }

      if (!payload.question || !payload.topic || !payload.correctAnswer) {
        throw new Error(
          "Please fill in the topic, question, and correct answer."
        );
      }

      if (editingId) {
        await updateQuestion(editingId, payload);
        setNotice("Question updated successfully.");
      } else {
        await createQuestion(payload);
        setNotice("Question created successfully.");
      }

      setEditorOpen(false);
      await loadQuestions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save the question."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(question: AdminQuestion) {
    const confirmed = window.confirm(
      "Delete this question permanently? This action cannot be undone."
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await deleteQuestion(question.id);
      setNotice("Question deleted successfully.");
      await loadQuestions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete the question."
      );
    }
  }

  const filteredQuestions = questions.filter((question) => {
    const query = search.trim().toLowerCase();

    return (
      !query ||
      question.question.toLowerCase().includes(query) ||
      question.topic.toLowerCase().includes(query)
    );
  });

  const publishedCount = questions.filter(
    (question) => question.status === "PUBLISHED"
  ).length;

  const draftCount = questions.length - publishedCount;

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-indigo-300">
            <ShieldCheck size={17} />
            Administrator workspace
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            Question Bank
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Create, organize, and publish questions for JEE Compass.
          </p>
        </div>

        <button
          onClick={openNewQuestion}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          <CirclePlus size={18} />
          Add question
        </button>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
        >
          {notice}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total questions"
          value={questions.length}
          icon={<BookOpen size={20} />}
        />
        <StatCard
          title="Published"
          value={publishedCount}
          icon={<CheckCircle2 size={20} />}
        />
        <StatCard
          title="Drafts"
          value={draftCount}
          icon={<Pencil size={20} />}
        />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-[#101827] p-4 sm:p-6">
        <div className="grid gap-3 md:grid-cols-[1fr_190px_170px_auto]">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search questions or topics..."
              aria-label="Search questions"
              className={`${inputClass} pl-10`}
            />
          </div>

          <select
            aria-label="Filter by subject"
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.target.value)}
            className={inputClass}
          >
            <option value="">All subjects</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
          </select>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={inputClass}
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>

          <button
            onClick={() => void loadQuestions()}
            title="Refresh questions"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-4 font-medium">Question</th>
                <th className="px-3 py-4 font-medium">Subject</th>
                <th className="px-3 py-4 font-medium">Difficulty</th>
                <th className="px-3 py-4 font-medium">Status</th>
                <th className="px-3 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-12 text-center text-sm text-slate-400"
                  >
                    Loading question bank...
                  </td>
                </tr>
              ) : filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-14 text-center">
                    <BookOpen
                      size={28}
                      className="mx-auto mb-3 text-slate-600"
                    />
                    <p className="font-medium text-slate-300">
                      No questions found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Add your first question to get started.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((question) => (
                  <tr
                    key={question.id}
                    className="border-b border-slate-800/80 last:border-0 hover:bg-slate-900/50"
                  >
                    <td className="max-w-[340px] px-3 py-4">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {question.question}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {question.topic} · {question.type.replace("_", " ")}
                      </p>
                    </td>

                    <td className="px-3 py-4 text-sm text-slate-300">
                      {question.subject}
                    </td>

                    <td className="px-3 py-4">
                      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                        {question.difficulty}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          question.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {question.status}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditQuestion(question)}
                          aria-label="Edit question"
                          className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:bg-slate-800"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          onClick={() => void handleDelete(question)}
                          aria-label="Delete question"
                          className="rounded-lg border border-rose-500/20 p-2 text-rose-300 hover:bg-rose-500/10"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading && (
            <p className="mt-4 text-xs text-slate-500">
              Showing {filteredQuestions.length} question
              {filteredQuestions.length === 1 ? "" : "s"}.
            </p>
          )}
        </div>
      </section>

      {editorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:p-6">
          <div className="mx-auto my-4 max-w-4xl rounded-2xl border border-slate-700 bg-[#101827] shadow-2xl sm:my-8">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-800 bg-[#101827] px-5 py-4 sm:px-7">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {editingId ? "Edit question" : "Create question"}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Question details and answer key
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                aria-label="Close editor"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Subject">
                  <select
                    value={form.subject}
                    onChange={(event) =>
                      updateField(
                        "subject",
                        event.target.value as QuestionInput["subject"]
                      )
                    }
                    className={inputClass}
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </Field>

                <Field label="Topic">
                  <input
                    required
                    maxLength={150}
                    value={form.topic}
                    onChange={(event) =>
                      updateField("topic", event.target.value)
                    }
                    placeholder="e.g. Kinematics"
                    className={inputClass}
                  />
                </Field>

                <Field label="Difficulty">
                  <select
                    value={form.difficulty}
                    onChange={(event) =>
                      updateField(
                        "difficulty",
                        event.target.value as QuestionInput["difficulty"]
                      )
                    }
                    className={inputClass}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </Field>
              </div>

              <Field label="Question type">
                <select
                  value={form.type}
                  onChange={(event) => {
                    const type = event.target.value as QuestionInput["type"];

                    setForm((current) => ({
                      ...current,
                      type,
                      options:
                        type === "SINGLE_CORRECT"
                          ? current.options.length
                            ? current.options
                            : ["", "", "", ""]
                          : [],
                      correctAnswer: "",
                    }));
                  }}
                  className={inputClass}
                >
                  <option value="SINGLE_CORRECT">
                    Single correct MCQ
                  </option>
                  <option value="NUMERICAL">Numerical answer</option>
                </select>
              </Field>

              <Field label="Question statement">
                <textarea
                  required
                  maxLength={15000}
                  rows={5}
                  value={form.question}
                  onChange={(event) =>
                    updateField("question", event.target.value)
                  }
                  placeholder="Enter the complete question. You can use plain text and LaTeX notation."
                  className={inputClass}
                />
              </Field>

              {form.type === "SINGLE_CORRECT" && (
                <Field label="Answer options">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {form.options.map((option, index) => (
                      <input
                        key={index}
                        required
                        maxLength={2000}
                        value={option}
                        onChange={(event) =>
                          updateOption(index, event.target.value)
                        }
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        className={inputClass}
                      />
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.options.length < 6 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateField("options", [...form.options, ""])
                        }
                        className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
                      >
                        + Add option
                      </button>
                    )}

                    {form.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            options: current.options.slice(0, -1),
                          }))
                        }
                        className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
                      >
                        Remove last option
                      </button>
                    )}
                  </div>
                </Field>
              )}

              <Field label="Correct answer">
                {form.type === "SINGLE_CORRECT" ? (
                  <select
                    required
                    value={form.correctAnswer}
                    onChange={(event) =>
                      updateField("correctAnswer", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select correct option</option>
                    {form.options.map((option, index) => (
                      <option
                        key={index}
                        value={option}
                        disabled={!option.trim()}
                      >
                        {String.fromCharCode(65 + index)}.{" "}
                        {option || "(empty option)"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    value={form.correctAnswer}
                    onChange={(event) =>
                      updateField("correctAnswer", event.target.value)
                    }
                    placeholder="e.g. 42"
                    className={inputClass}
                  />
                )}
              </Field>

              <Field label="Solution / explanation">
                <textarea
                  rows={4}
                  maxLength={15000}
                  value={form.explanation}
                  onChange={(event) =>
                    updateField("explanation", event.target.value)
                  }
                  placeholder="Explain the solution step by step."
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Question image URL (optional)">
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(event) =>
                      updateField("imageUrl", event.target.value)
                    }
                    placeholder="https://..."
                    className={inputClass}
                  />
                </Field>

                <Field label="Explanation image URL (optional)">
                  <input
                    type="url"
                    value={form.explanationImageUrl}
                    onChange={(event) =>
                      updateField("explanationImageUrl", event.target.value)
                    }
                    placeholder="https://..."
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Correct marks">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    required
                    value={form.marks}
                    onChange={(event) =>
                      updateField("marks", Number(event.target.value))
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Negative marks">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.25}
                    required
                    value={form.negativeMarks}
                    onChange={(event) =>
                      updateField(
                        "negativeMarks",
                        Number(event.target.value)
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target.value as QuestionInput["status"]
                      )
                    }
                    className={inputClass}
                  >
                    <option value="DRAFT">Save as draft</option>
                    <option value="PUBLISHED">Publish</option>
                  </select>
                </Field>
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-800 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="rounded-xl border border-slate-700 px-5 py-3 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#101827] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <span className="rounded-xl bg-indigo-500/10 p-2 text-indigo-300">
          {icon}
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}
