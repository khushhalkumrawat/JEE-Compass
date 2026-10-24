import { useState, type FormEvent } from "react";
import {
  BookOpen,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { loginStudent, registerStudent } from "../services/auth";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "register";

  const [isRegister, setIsRegister] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function fillJudgeCredentials() {
    setEmail("judge@jeecompass.demo");
    setPassword("JEECompass@2026");
    setError("");
  }
  
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await registerStudent(name, email, password);
      } else {
        await loginStudent(email, password);
      }

      const destination = searchParams.get("next");

      navigate(
        destination &&
          destination.startsWith("/") &&
          !destination.startsWith("//")
          ? destination
          : "/",
        { replace: true },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsRegister((current) => !current);
    setError("");
    setPassword("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080d19] px-4 py-10 text-slate-200">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/15 text-indigo-300">
            <BookOpen size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              JEE Compass
            </h1>
            <p className="text-sm text-slate-400">Your path to JEE success</p>
          </div>
        </Link>

        <section className="rounded-3xl border border-white/[0.09] bg-white/[0.035] p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="mb-7">
            <p className="mb-2 text-sm font-medium text-indigo-300">
              {isRegister ? "START YOUR JOURNEY" : "WELCOME BACK"}
            </p>

            <h2 className="text-2xl font-bold text-white">
              {isRegister ? "Create your account" : "Sign in to JEE Compass"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {isRegister
                ? "Create an account to keep your test results and progress together."
                : "Continue your preparation and access your saved progress."}
            </p>
          </div>

          {!isRegister && (
            <div className="mb-6 rounded-2xl border border-indigo-400/25 bg-indigo-500/[0.08] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                  <GraduationCap size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white">
                    Judge Demo Access
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-slate-400">
                    Evaluating JEE Compass? Use the demo account to explore the
                    platform.
                  </p>

                  <div className="mt-3 rounded-lg bg-black/20 px-3 py-2 text-sm">
                    <span className="text-slate-500">Demo email</span>
                    <p className="mt-1 break-all text-slate-200">
                      judge@jeecompass.demo
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={fillJudgeCredentials}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-500/15 px-3 py-2.5 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/25"
                  >
                    Fill judge email
                    <ArrowRight size={16} />
                  </button>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Ask the project presenter for the demo password.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Full name
                </label>

                <div className="relative">
                  <UserRound
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    size={18}
                  />

                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={80}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-white/10 bg-[#080d19] py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={18}
                />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-[#080d19] py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={18}
                />

                <input
                  id="password"
                  type="password"
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  required
                  minLength={isRegister ? 8 : undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    isRegister ? "At least 8 characters" : "Enter your password"
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#080d19] py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <LoaderCircle size={18} className="animate-spin" />}

              {loading
                ? "Please wait..."
                : isRegister
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            {isRegister ? "Already have an account?" : "New to JEE Compass?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="font-semibold text-indigo-300 hover:text-indigo-200"
            >
              {isRegister ? "Sign in" : "Create an account"}
            </button>
          </p>
        </section>

        <p className="mt-6 text-center text-xs text-slate-500">
          Your preparation, progress, and results in one place.
        </p>
      </div>
    </main>
  );
}
