import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowUp,
  Bot,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  LoaderCircle,
  MessageCircle,
  Plus,
  Sparkles,
  UserRound,
} from "lucide-react";
import { askDoubt, type ChatMessage } from "../services/api";
import MathContent from "../components/ui/MathContent";

const subjects = ["Physics", "Chemistry", "Mathematics"] as const;

const suggestions = [
  {
    title: "Explain a concept",
    description:
      "Help me understand a difficult concept from first principles.",
    icon: BookOpen,
  },
  {
    title: "Solve a numerical",
    description: "Solve a JEE numerical step by step with formulas.",
    icon: CircleHelp,
  },
  {
    title: "JEE shortcut",
    description: "Show me a faster method to solve a JEE question.",
    icon: Sparkles,
  },
];

export default function DoubtSolver() {
  const [subject, setSubject] = useState("Physics");
  const [topic, setTopic] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function handleSubmit(event?: FormEvent, prompt?: string) {
    event?.preventDefault();

    const question = (prompt ?? input).trim();

    if (!question || loading) return;

    const previousMessages = messages;
    const userMessage: ChatMessage = {
      role: "user",
      content: question,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const answer = await askDoubt({
        question,
        subject,
        topic,
        history: previousMessages.slice(-8),
      });

      setMessages((current) => [
        ...current,
        { role: "assistant", content: answer },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function startNewChat() {
    if (loading) return;
    setMessages([]);
    setInput("");
    setError("");
    setTopic("");
    inputRef.current?.focus();
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-6xl flex-col gap-6 pb-6">
      {" "}
      <header className="flex flex-wrap items-center justify-between gap-4">
        {" "}
        <div>
          {" "}
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-cyan-400">
            {" "}
            <Sparkles size={16} />
            YOUR PERSONAL JEE TUTOR{" "}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            AI Doubt Solver
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Stuck on a concept or numerical? Ask your doubt and learn the
            solution step by step.
          </p>
        </div>
        <button
          onClick={startNewChat}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08] disabled:opacity-50"
        >
          <Plus size={16} />
          New chat
        </button>
      </header>
      <section className="grid gap-4 rounded-2xl border border-white/[0.08] bg-[#0d1423] p-4 sm:grid-cols-2 sm:p-5">
        <div>
          <label
            htmlFor="doubt-subject"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Subject
          </label>

          <div className="relative">
            <select
              id="doubt-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-[#111b2d] px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-cyan-400/60"
            >
              {subjects.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="doubt-topic"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Chapter or topic <span className="text-slate-500">(optional)</span>
          </label>

          <input
            id="doubt-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="e.g. Rotational Motion"
            maxLength={150}
            className="w-full rounded-xl border border-white/10 bg-[#111b2d] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-cyan-400/60"
          />
        </div>
      </section>
      <section className="flex min-h-[440px] flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1423]">
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
            <Bot size={21} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-white">JEE Compass Tutor</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {subject} · Step-by-step explanations
            </p>
          </div>

          <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2.5 py-1 text-xs text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Tutor ready
          </span>
        </div>

        <div className="flex-1 space-y-5 p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="mx-auto flex max-w-2xl flex-col items-center py-8 text-center sm:py-12">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300">
                <MessageCircle size={30} />
              </div>

              <h3 className="text-xl font-semibold text-white">
                What are you stuck on?
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                Ask any JEE-related question. I'll help you understand the
                reasoning instead of just giving you the answer.
              </p>

              <div className="mt-8 grid w-full gap-3 text-left sm:grid-cols-3">
                {suggestions.map((suggestion) => {
                  const Icon = suggestion.icon;

                  return (
                    <button
                      key={suggestion.title}
                      disabled={loading}
                      onClick={() =>
                        handleSubmit(
                          undefined,
                          `${suggestion.title}: ${suggestion.description}`,
                        )
                      }
                      className="group rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.04] disabled:opacity-50"
                    >
                      <Icon
                        size={20}
                        className="mb-3 text-cyan-300 transition group-hover:scale-110"
                      />
                      <p className="text-sm font-medium text-white">
                        {suggestion.title}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        {suggestion.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    message.role === "user"
                      ? "bg-violet-400/10 text-violet-300"
                      : "bg-cyan-400/10 text-cyan-300"
                  }`}
                >
                  {message.role === "user" ? (
                    <UserRound size={18} />
                  ) : (
                    <Bot size={19} />
                  )}
                </div>

                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[80%] ${
                    message.role === "user"
                      ? "rounded-tr-sm bg-violet-500/10 text-slate-100"
                      : "rounded-tl-sm border border-white/[0.07] bg-white/[0.025] text-slate-200"
                  }`}
                >
                  <p className="mb-2 text-xs font-medium text-slate-400">
                    {message.role === "user" ? "You" : "JEE Compass Tutor"}
                  </p>

                  <div className="break-words text-sm leading-7">
                    {message.role === "assistant" ? (
                      <MathContent content={message.content} />
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <Bot size={19} />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-sm text-slate-400">
                <LoaderCircle
                  size={16}
                  className="animate-spin text-cyan-300"
                />
                Working through your doubt...
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="ml-12 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-4 text-sm text-rose-200"
            >
              <p>{error}</p>
              <button
                onClick={() => {
                  const lastUserMessage = [...messages]
                    .reverse()
                    .find((message) => message.role === "user");

                  if (lastUserMessage) {
                    setMessages((current) => current.slice(0, -1));
                    setInput(lastUserMessage.content);
                    setError("");
                  }
                }}
                className="mt-2 font-medium underline underline-offset-4"
              >
                Edit question and try again
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(event) => handleSubmit(event)}
          className="border-t border-white/[0.07] p-4 sm:p-5"
        >
          <div className="rounded-2xl border border-white/10 bg-[#111b2d] p-2 transition focus-within:border-cyan-400/40">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
              placeholder={`Ask your ${subject} doubt here...`}
              rows={2}
              maxLength={4000}
              disabled={loading}
              className="max-h-40 min-h-14 w-full resize-y bg-transparent px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-slate-500 disabled:opacity-60"
            />

            <div className="flex items-center justify-between gap-3 px-2 pb-1">
              <span className="text-xs text-slate-500">
                <span className="hidden sm:inline">Enter to send · </span>
                Shift + Enter for a new line
              </span>

              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send doubt"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <ArrowUp size={19} />
                )}
              </button>
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-slate-500">
            AI can make mistakes. Verify important formulas and answers with
            trusted study material.
          </p>
        </form>
      </section>
    </div>
  );
}
