import ReactMarkdown from 'react-markdown'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  ArrowUp,
  Bot,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  LoaderCircle,
  MessageCircle,
  Plus,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { askDoubt, type ChatMessage } from '../services/api'

const subjects = ['Physics', 'Chemistry', 'Mathematics'] as const

const suggestions = [
  {
    title: 'Explain a concept',
    prompt: 'Explain the work-energy theorem with derivations and standard JEE sign conventions.',
    icon: BookOpen,
  },
  {
    title: 'Solve a numerical',
    prompt: 'A car travelling at 20 m/s brakes with deceleration of 4 m/s^2. Find the stopping distance.',
    icon: CircleHelp,
  },
  {
    title: 'JEE shortcut',
    prompt: 'Give me the quick method to find the hybridisation and shape of XeF4 and SF4.',
    icon: Sparkles,
  },
]

export default function DoubtSolver() {
  const [subject, setSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics'>('Physics')
  const [topic, setTopic] = useState('')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  async function handleSubmit(event?: FormEvent, customPrompt?: string) {
    event?.preventDefault()
    const question = (customPrompt ?? input).trim()
    if (!question || loading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
    }

    setMessages((curr) => [...curr, userMessage])
    setInput('')
    setLoading(true)

    try {
      const answer = await askDoubt({
        question,
        subject,
        topic,
        history: messages.slice(-6),
      })

      setMessages((curr) => [...curr, { role: 'assistant', content: answer }])
    } catch {
      setMessages((curr) => [
        ...curr,
        {
          role: 'assistant',
          content:
            "I'm currently reviewing this concept. Please rephrase your question or verify your internet connection.",
        },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleCopy(text: string, index: number) {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  function startNewChat() {
    if (loading) return
    setMessages([])
    setInput('')
    setTopic('')
    inputRef.current?.focus()
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7.5rem)] w-full max-w-5xl flex-col gap-5 pb-6">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Sparkles size={14} />
            AI STUDY COPILOT
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            24/7 JEE Doubt Solver
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Instant step-by-step solutions, derivations, and formulas tailored for JEE Main & Advanced.
          </p>
        </div>

        <button
          onClick={startNewChat}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d1423] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:bg-slate-800 disabled:opacity-40"
        >
          <Plus size={15} />
          New Query
        </button>
      </header>

      {/* Target Subject & Topic Selectors */}
      <section className="grid gap-3 rounded-2xl border border-white/[0.08] bg-[#0d1423] p-4 sm:grid-cols-2">
        <div>
          <label htmlFor="doubt-subject" className="mb-1.5 block text-xs font-medium text-slate-400">
            Select Subject
          </label>
          <div className="relative">
            <select
              id="doubt-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value as typeof subject)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-[#111b2d] px-3.5 py-2.5 pr-10 text-xs font-medium text-white outline-none transition focus:border-cyan-400"
            >
              {subjects.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        <div>
          <label htmlFor="doubt-topic" className="mb-1.5 block text-xs font-medium text-slate-400">
            Chapter or Specific Formula <span className="text-slate-500">(Optional)</span>
          </label>
          <input
            id="doubt-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Electrostatics, Thermodynamics, Matrices"
            maxLength={100}
            className="w-full rounded-xl border border-white/10 bg-[#111b2d] px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-slate-600 transition focus:border-cyan-400"
          />
        </div>
      </section>

      {/* Conversation Window */}
      <section className="flex min-h-[460px] flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1423]">
        {/* Status bar */}
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0a0f1d] px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
              <Bot size={17} />
            </div>
            <span className="text-xs font-semibold text-slate-200">JEE Compass Tutor</span>
            <span className="text-xs text-slate-500">({subject})</span>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Tutor Online
          </span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="mx-auto flex max-w-xl flex-col items-center py-10 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                <MessageCircle size={26} />
              </div>
              <h2 className="text-lg font-bold text-white">Ask your first doubt</h2>
              <p className="mt-1 text-xs text-slate-400">
                Type any formula, conceptual problem, or question. Choose a starter to test:
              </p>

              <div className="mt-6 grid w-full gap-2.5 text-left sm:grid-cols-3">
                {suggestions.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.title}
                      disabled={loading}
                      onClick={() => handleSubmit(undefined, item.prompt)}
                      className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.03] disabled:opacity-40"
                    >
                      <Icon size={16} className="mb-2 text-cyan-300" />
                      <p className="text-xs font-semibold text-slate-200">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">
                        {item.prompt}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    message.role === 'user'
                      ? 'bg-indigo-500/15 text-indigo-300'
                      : 'bg-cyan-400/10 text-cyan-300'
                  }`}
                >
                  {message.role === 'user' ? <UserRound size={16} /> : <Bot size={17} />}
                </div>

                <div
                  className={`relative max-w-[85%] rounded-2xl p-4 sm:max-w-[78%] ${
                    message.role === 'user'
                      ? 'bg-indigo-600/15 text-indigo-100 ring-1 ring-indigo-500/20'
                      : 'border border-white/[0.07] bg-slate-900/60 text-slate-200'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="text-[11px] font-semibold tracking-wider text-slate-400">
                      {message.role === 'user' ? 'YOU' : 'JEE TUTOR SOLUTION'}
                    </span>

                    {message.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(message.content, index)}
                        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                        title="Copy solution"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check size={11} className="text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {message.role === 'user' ? (
                    <p className="whitespace-pre-wrap text-xs font-medium leading-relaxed">
                      {message.content}
                    </p>
                  ) : (
                    <div className="space-y-2.5 text-xs leading-relaxed text-slate-200 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-cyan-300 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-4">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                <Bot size={17} />
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/[0.07] bg-slate-900/60 px-4 py-3 text-xs text-slate-400">
                <LoaderCircle size={15} className="animate-spin text-cyan-400" />
                Formulating step-by-step solution...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="border-t border-white/[0.06] bg-[#0a0f1d] p-3 sm:p-4">
          <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-[#111b2d] p-2 transition focus-within:border-cyan-400/50">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void handleSubmit()
                }
              }}
              placeholder={`Ask any ${subject} question (e.g., "Find the equivalent resistance across terminals A and B")...`}
              rows={1}
              maxLength={2000}
              disabled={loading}
              className="max-h-32 min-h-[38px] flex-1 resize-none bg-transparent px-2.5 py-1.5 text-xs text-white outline-none placeholder:text-slate-500 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Submit Question"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {loading ? <LoaderCircle size={16} className="animate-spin" /> : <ArrowUp size={16} />}
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-slate-500">
            <span>Press Enter to send · Shift + Enter for new line</span>
            <span>JEE Compass 2026</span>
          </div>
        </form>
      </section>
    </div>
  )
}