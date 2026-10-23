import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  ListTodo,
  Sparkles,
  Target,
} from 'lucide-react'
import type { TestResult } from '../types/test'
import { analyzeTestResult, type TopicAnalysis } from '../utils/analysis'

interface PlanTask {
  id: string
  subject: string
  topic: string
  type: 'Revision' | 'Practice' | 'Mock Retest'
  duration: string
  priority: 'High' | 'Medium' | 'Normal'
  completed: boolean
}

export default function StudyPlanPage() {
  const navigate = useNavigate()
  const [weakTopics, setWeakTopics] = useState<TopicAnalysis[]>([])
  const [tasks, setTasks] = useState<PlanTask[]>([])
  const [hasAttemptedMock, setHasAttemptedMock] = useState(false)

  useEffect(() => {
    const rawResult = sessionStorage.getItem('jee-compass-test-result')
    if (rawResult) {
      try {
        const parsed: TestResult = JSON.parse(rawResult)
        const analysis = analyzeTestResult(parsed)
        setWeakTopics(analysis.weakTopics)
        setHasAttemptedMock(true)

        // Generate dynamic tasks from detected weak topics
        const dynamicTasks: PlanTask[] = analysis.weakTopics.map((item, idx) => ({
          id: `weak-${idx}`,
          subject: item.subject,
          topic: item.topic,
          type: item.accuracy === 0 ? 'Revision' : 'Practice',
          duration: item.accuracy === 0 ? '30 min' : '20 min',
          priority: 'High',
          completed: false,
        }))

        // Add standard foundational tasks
        setTasks([
          ...dynamicTasks,
          {
            id: 'base-1',
            subject: 'Physics',
            topic: 'Kinematics & Projectile Motion',
            type: 'Practice',
            duration: '25 min',
            priority: 'Medium',
            completed: false,
          },
          {
            id: 'base-2',
            subject: 'Chemistry',
            topic: 'Chemical Bonding Hybridisation',
            type: 'Revision',
            duration: '20 min',
            priority: 'Normal',
            completed: false,
          },
        ])
        return
      } catch {
        // Fallback to default routine
      }
    }

    // Default roadmap when no test has been submitted yet
    setTasks([
      {
        id: 'def-1',
        subject: 'Physics',
        topic: 'Newton’s Laws of Motion',
        type: 'Revision',
        duration: '25 min',
        priority: 'High',
        completed: false,
      },
      {
        id: 'def-2',
        subject: 'Mathematics',
        topic: 'Quadratic Equations & Roots',
        type: 'Practice',
        duration: '30 min',
        priority: 'High',
        completed: false,
      },
      {
        id: 'def-3',
        subject: 'Chemistry',
        topic: 'Atomic Structure & Quantum Numbers',
        type: 'Revision',
        duration: '20 min',
        priority: 'Medium',
        completed: false,
      },
    ])
  }, [])

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )
  }

  const completedCount = tasks.filter((t) => t.completed).length
  const progressPercent = Math.round((completedCount / (tasks.length || 1)) * 100)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-10">
      {/* Page Heading */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            <Calendar size={14} />
            ADAPTIVE JEE ROADMAP
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Personalized Study Plan
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Target your weakest chapters first to maximize score velocity.
          </p>
        </div>

        <button
          onClick={() => navigate('/tests')}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
        >
          <Target size={15} />
          Take Diagnostic Test
        </button>
      </header>

      {/* Overview Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0d1423] p-5">
          <p className="text-xs font-medium text-slate-400">Daily Completion</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">
              {completedCount} / {tasks.length}
            </span>
            <span className="text-xs font-semibold text-indigo-300">{progressPercent}%</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0d1423] p-5">
          <p className="text-xs font-medium text-slate-400">Focus Chapters</p>
          <p className="mt-3 text-2xl font-bold text-amber-400">
            {weakTopics.length > 0 ? `${weakTopics.length} Critical` : 'Balanced Routine'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {hasAttemptedMock
              ? 'Derived from your recent test errors'
              : 'Take a mock test to customize'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0d1423] p-5">
          <p className="text-xs font-medium text-slate-400">Active Streak</p>
          <div className="mt-3 flex items-center gap-2">
            <Flame size={24} className="text-orange-400" />
            <span className="text-2xl font-bold text-white">1 Day</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Solve daily to maintain consistency</p>
        </div>
      </section>

      {/* Attention Required Banner (if weak topics exist) */}
      {weakTopics.length > 0 && (
        <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-amber-400" size={18} />
            <div>
              <h3 className="text-sm font-semibold text-amber-200">
                Action Required: High-Mistake Chapters Detected
              </h3>
              <p className="mt-1 text-xs leading-5 text-amber-200/70">
                You scored below 60% on {weakTopics.map((t) => t.topic).join(', ')}. Review the
                revision notes and solve targeted DPP questions before retesting.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Task Checklist */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#0d1423] p-6">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <ListTodo size={18} className="text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Today's Prioritized Tasks</h2>
          </div>
          <span className="text-xs text-slate-500">Click to mark complete</span>
        </div>

        <div className="mt-4 space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                task.completed
                  ? 'border-white/5 bg-white/[0.01] opacity-50'
                  : 'border-white/[0.08] bg-[#111a2d] hover:border-indigo-400/40 hover:bg-[#131e36]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    task.completed
                      ? 'border-emerald-400 bg-emerald-400 text-slate-950'
                      : 'border-slate-600'
                  }`}
                >
                  {task.completed && <CheckCircle2 size={14} className="stroke-[3]" />}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        task.completed ? 'text-slate-500 line-through' : 'text-slate-200'
                      }`}
                    >
                      {task.topic}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        task.priority === 'High'
                          ? 'bg-rose-500/15 text-rose-300'
                          : 'bg-indigo-500/15 text-indigo-300'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <span className="mt-0.5 block text-[11px] text-slate-400">
                    {task.subject} · {task.type}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock size={13} />
                  {task.duration}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (task.type === 'Revision') navigate('/materials')
                    else navigate('/dpp')
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-400/10"
                >
                  {task.type === 'Revision' ? 'Study' : 'Practice'}
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Direct Quick Jump */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div
          onClick={() => navigate('/materials')}
          className="group cursor-pointer rounded-2xl border border-white/[0.08] bg-[#0d1423] p-5 transition hover:border-indigo-400/40 hover:bg-[#111a2d]"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
              <BookOpen size={20} />
            </div>
            <ArrowRight
              size={16}
              className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-white"
            />
          </div>
          <h3 className="mt-4 text-sm font-bold text-white">Study Formula Sheets</h3>
          <p className="mt-1 text-xs text-slate-400">
            Revise key equations for high-yield JEE topics before solving problems.
          </p>
        </div>

        <div
          onClick={() => navigate('/doubts')}
          className="group cursor-pointer rounded-2xl border border-white/[0.08] bg-[#0d1423] p-5 transition hover:border-cyan-400/40 hover:bg-[#111a2d]"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-300">
              <Sparkles size={20} />
            </div>
            <ArrowRight
              size={16}
              className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-white"
            />
          </div>
          <h3 className="mt-4 text-sm font-bold text-white">Consult Doubt Solver</h3>
          <p className="mt-1 text-xs text-slate-400">
            Clear conceptual bottlenecks immediately with step-by-step guidance.
          </p>
        </div>
      </section>
    </div>
  )
}