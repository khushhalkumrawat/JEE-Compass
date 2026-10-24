import { useEffect, useState } from "react";
import {
  Check,
  Plus,
  Trash2,
  ListTodo,
  History,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import {
  getDailyTasks,
  saveDailyTasks,
  getDailyHistory,
  formatHistoryDate,
  type DailyTask,
  type DailyHistory,
} from "../utils/dailyTasks";

export default function StudyPlan() {
  const [tasks, setTasks] = useState<DailyTask[]>(getDailyTasks);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("General");
  const [time, setTime] = useState("30 min");

  const [showHistory, setShowHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [history, setHistory] = useState<DailyHistory[]>([]);

  function openHistory() {
    setHistory(getDailyHistory());
    setShowHistory((previous) => !previous);
    setSelectedDate(null);
  }

  useEffect(() => {
    saveDailyTasks(tasks);
  }, [tasks]);

  const completed = tasks.filter((task) => task.done).length;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    const newTask: DailyTask = {
      id: Date.now(),
      title: trimmedTitle,
      subject: subject.trim() || "General",
      time: time.trim() || "No time set",
      done: false,
    };

    setTasks((previous) => [...previous, newTask]);
    setTitle("");
  }

  function toggleTask(id: number) {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }

  function deleteTask(id: number) {
    setTasks((previous) => previous.filter((task) => task.id !== id));
  }

  return (
    <section className="mx-auto max-w-4xl rounded-2xl border border-white/[0.07] bg-[#0d1423] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-300">
            <ListTodo size={20} />
            <p className="text-xs font-semibold uppercase tracking-[0.15em]">
              Daily productivity
            </p>
          </div>

          <h1 className="mt-3 text-2xl font-bold text-white">
            Today's Study Plan
          </h1>

          <button
            type="button"
            onClick={openHistory}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/20"
          >
            <History size={16} />
            {showHistory ? "Hide History" : "View Task History"}
            <ChevronDown
              size={15}
              className={`transition-transform ${showHistory ? "rotate-180" : ""}`}
            />
          </button>

          <p className="mt-2 text-sm text-slate-400">
            Plan your study session, track your progress, and stay consistent.
          </p>
        </div>

        <div className="rounded-xl bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-300">
          {completed}/{tasks.length} completed
        </div>
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>{progress}% completed</span>
        <span>{tasks.length - completed} tasks remaining</span>
      </div>

      <form
        onSubmit={addTask}
        className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
      >
        <h2 className="mb-4 text-sm font-semibold text-white">
          Add a new task
        </h2>

        <div className="space-y-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What do you want to study?"
            maxLength={150}
            className="w-full rounded-xl border border-white/10 bg-[#080e19] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
            required
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Subject (e.g. Physics)"
              maxLength={60}
              className="w-full rounded-xl border border-white/10 bg-[#080e19] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
            />

            <input
              value={time}
              onChange={(event) => setTime(event.target.value)}
              placeholder="Estimated time (e.g. 45 min)"
              maxLength={40}
              className="w-full rounded-xl border border-white/10 bg-[#080e19] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            <Plus size={17} />
            Add task
          </button>
        </div>
      </form>

      {showHistory && (
        <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
              <CalendarDays size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-white">Daily Task History</h2>
              <p className="mt-1 text-xs text-slate-500">
                Review your progress from previous days.
              </p>
            </div>
          </div>

          {history.length === 0 ? (
            <p className="mt-6 text-sm text-slate-400">
              No saved history yet. Your daily progress will appear here.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {history.map((day) => (
                <div
                  key={day.date}
                  className="rounded-xl border border-white/[0.06] bg-[#080e19] p-4"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedDate((previous) =>
                        previous === day.date ? null : day.date,
                      )
                    }
                    className="w-full text-left"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          {formatHistoryDate(day.date)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {day.completed} of {day.total} tasks completed
                        </p>
                      </div>

                      <span className="rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                        {day.progress}%
                      </span>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${day.progress}%` }}
                      />
                    </div>
                  </button>

                  {selectedDate === day.date && (
                    <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-4">
                      {day.tasks.length === 0 ? (
                        <p className="text-xs text-slate-500">
                          No tasks were saved for this day.
                        </p>
                      ) : (
                        day.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-start gap-3 rounded-lg bg-white/[0.02] p-3"
                          >
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                                task.done
                                  ? "bg-emerald-400/15 text-emerald-400"
                                  : "border border-slate-600 text-slate-500"
                              }`}
                            >
                              {task.done && <Check size={13} />}
                            </span>

                            <div className="min-w-0 flex-1">
                              <p
                                className={`break-words text-sm ${
                                  task.done
                                    ? "text-slate-500 line-through"
                                    : "text-slate-300"
                                }`}
                              >
                                {task.title}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {task.subject} · {task.time}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 text-xs ${
                                task.done
                                  ? "text-emerald-400"
                                  : "text-amber-400"
                              }`}
                            >
                              {task.done ? "Completed" : "Pending"}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Your tasks</h2>
          <span className="text-xs text-slate-500">{tasks.length} total</span>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
            <ListTodo className="mx-auto text-slate-500" size={30} />
            <p className="mt-3 text-sm font-medium text-slate-300">
              No tasks for today
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Add a task above to start planning your day.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 transition hover:bg-white/[0.035]"
              >
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  aria-label={
                    task.done
                      ? `Mark ${task.title} incomplete`
                      : `Mark ${task.title} complete`
                  }
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                    task.done
                      ? "border-emerald-400 bg-emerald-400 text-slate-950"
                      : "border-slate-600 hover:border-indigo-400"
                  }`}
                >
                  {task.done && <Check size={13} />}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`break-words text-sm font-medium ${
                      task.done
                        ? "text-slate-500 line-through"
                        : "text-slate-200"
                    }`}
                  >
                    {task.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {task.subject} · {task.time}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  aria-label={`Delete ${task.title}`}
                  className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
