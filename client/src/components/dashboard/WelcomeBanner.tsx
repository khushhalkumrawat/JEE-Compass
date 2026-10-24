import { ChevronRight, GraduationCap, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WelcomeBanner() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-[#171d3c] via-[#11172e] to-[#111525] p-6 sm:p-9 lg:p-10">
      {" "}
      <div className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      ```
      <div className="relative max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-300/[0.08] px-3 py-1.5 text-[11px] font-medium text-indigo-200">
          <Zap size={13} />
          YOUR PERSONAL JEE COMPANION
        </div>

        <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[44px]">
          Your dream IIT.
          <br />
          <span className="text-indigo-300">Your roadmap.</span>
        </h2>

        <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400 sm:text-base">
          Study smarter, practice consistently, and understand every mistake.
          Your journey to JEE success starts here.
        </p>

        <button
          onClick={() => navigate("/tests")}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-400"
        >
          Start Practicing
          <ChevronRight size={17} />
        </button>
      </div>
      <div className="absolute bottom-8 right-10 hidden h-36 w-36 items-center justify-center rounded-full border border-indigo-300/10 bg-indigo-400/[0.04] lg:flex">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-indigo-300/20 bg-indigo-400/[0.08]">
          <GraduationCap
            size={47}
            className="text-indigo-200"
            strokeWidth={1.2}
          />
        </div>
      </div>
    </section>
  );
}
