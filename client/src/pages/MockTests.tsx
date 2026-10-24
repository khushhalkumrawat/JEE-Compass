import { useNavigate } from "react-router-dom";
import { Clock3, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

export default function MockTests() {
  const navigate = useNavigate();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Mock Tests</h1>
        <p className="mt-2 text-slate-400">
          Practice with a full-length JEE Main pattern paper.
        </p>
      </div>

      <article className="flex flex-col justify-between gap-5 rounded-2xl border border-white/10 bg-[#0d1423] p-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300">
            <FileText size={24} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              JEE Main Pattern Mock Test
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Physics, Chemistry and Mathematics
            </p>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <Clock3 size={16} /> 3 hours
              </span>
              <span>75 questions</span>
              <span>300 marks</span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                +4 for correct answers
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                -1 for incorrect answers
              </p>
              <p className="text-xs text-slate-500">
                Practice paper; not an official NTA paper.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/tests/full-length-jee-main')}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
        >
          Start Test <ArrowRight size={17} />
        </button>
      </article>
    </section>
  );
}
