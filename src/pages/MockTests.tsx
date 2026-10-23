import { useNavigate } from "react-router-dom";
import { Clock3, FileText, ArrowRight } from "lucide-react";

export default function MockTests() {
  const navigate = useNavigate();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Mock Tests</h1>
        <p className="mt-2 text-slate-400">
          Practice under exam-like conditions and review your performance.
        </p>
      </div>

      <article className="flex flex-col justify-between gap-5 rounded-2xl border border-white/10 bg-[#0d1423] p-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300">
            <FileText size={24} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              JEE Practice Test — Demo
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Physics, Chemistry and Mathematics
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
              <Clock3 size={16} />
              30-minute timer · 5 sample questions
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/tests/demo-test')}
          className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
        >
          Start Test <ArrowRight size={17} />
        </button>
      </article>
    </section>
  );
}
