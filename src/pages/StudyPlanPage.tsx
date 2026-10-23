import { useState } from 'react'
import { Check } from 'lucide-react'
import { initialStudyTasks } from '../data/dashboard'

export default function StudyPlan() {
const [tasks, setTasks] = useState(initialStudyTasks)

const completed = tasks.filter((task) => task.done).length

function toggleTask(id: number) {
setTasks((previous) =>
previous.map((task) =>
task.id === id ? { ...task, done: !task.done } : task,
),
)
}

return ( <section className="rounded-2xl border border-white/[0.07] bg-[#0d1423] p-6"> <div className="flex items-start justify-between gap-4"> <div> <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-300">
Your daily goals </p>

      <h3 className="mt-2 text-lg font-bold text-white">
        Today's study plan
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        Small, consistent steps make a difference.
      </p>
    </div>

    <div className="rounded-xl bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-300">
      {completed}/{tasks.length} done
    </div>
  </div>

  <div className="mt-6 space-y-3">
    {tasks.map((task) => (
      <button
        key={task.id}
        onClick={() => toggleTask(task.id)}
        className="flex w-full items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.015] p-4 text-left transition hover:bg-white/[0.04]"
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
            task.done
              ? 'border-emerald-400 bg-emerald-400 text-slate-950'
              : 'border-slate-600'
          }`}
        >
          {task.done && <Check size={13} />}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={`block text-sm font-medium ${
              task.done
                ? 'text-slate-500 line-through'
                : 'text-slate-200'
            }`}
          >
            {task.title}
          </span>

          <span className="mt-1 block text-[10px] font-semibold tracking-wider text-slate-500">
            {task.subject}
          </span>
        </span>

        <span className="shrink-0 text-xs text-slate-500">
          {task.time}
        </span>
      </button>
    ))}
  </div>
</section>

)
}
