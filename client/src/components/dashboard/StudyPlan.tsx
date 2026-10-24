import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Check } from "lucide-react";
import {
  getDailyTasks,
  saveDailyTasks,
  type DailyTask,
} from "../../utils/dailyTasks";

export default function StudyPlan() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<DailyTask[]>(getDailyTasks);
  

  useEffect(() => {
    saveDailyTasks(tasks);
  }, [tasks]);

  const completed = tasks.filter((task) => task.done).length;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0d1423] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-300">
            Your daily goals
          </p>
          <h3 className="mt-2 text-lg font-bold text-white">
            Today's study plan
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Small, consistent steps make a difference.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/study-plan")}
          className="inline-flex items-center gap-1 rounded-xl bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
        >
          <span>
            {completed}/{tasks.length} done
          </span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-2 text-right text-xs text-slate-500">
        {progress}% completed
      </p>

      <div className="mt-5 space-y-3">
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() =>
              setTasks((previous) =>
                previous.map((item) =>
                  item.id === task.id ? { ...item, done: !item.done } : item,
                ),
              )
            }
            className="flex w-full items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.015] p-4 text-left transition hover:bg-white/[0.04]"
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                task.done
                  ? "border-emerald-400 bg-emerald-400 text-slate-950"
                  : "border-slate-600"
              }`}
            >
              {task.done && <Check size={13} />}
            </span>

            <span className="min-w-0 flex-1">
              <span
                className={`block text-sm font-medium ${
                  task.done ? "text-slate-500 line-through" : "text-slate-200"
                }`}
              >
                {task.title}
              </span>

              <span className="mt-1 block text-[10px] font-semibold tracking-wider text-slate-500">
                {task.subject}
              </span>
            </span>

            <span className="shrink-0 text-xs text-slate-500">{task.time}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
