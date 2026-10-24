import { BrainCircuit, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AnalysisBanner() {
  const navigate = useNavigate();

  return (
    <section className="rounded-2xl border border-indigo-400/15 bg-gradient-to-br from-indigo-500/[0.09] to-[#0d1423] p-6">
      {" "}
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
        {" "}
        <BrainCircuit size={23} />{" "}
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-300">
        Learn from every attempt
      </p>
      <h3 className="mt-2 text-xl font-bold leading-7 text-white">
        Your mistakes can become your strengths.
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        Practice a question, identify the concept you missed, and get a clear
        recommendation for what to revise next.
      </p>
      <button
        onClick={() => navigate("/analysis")}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 transition hover:text-indigo-200"
      >
        Explore your analysis
        <ChevronRight size={16} />
      </button>
    </section>
  );
}
