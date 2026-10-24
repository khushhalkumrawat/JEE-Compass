interface QuestionPaletteProps {
  total: number;
  current: number;
  answers: (string | number | null)[];
  review: boolean[];
  visited: boolean[];
  onSelect: (index: number) => void;
}

export default function QuestionPalette({
  total,
  current,
  answers,
  review,
  onSelect,
}: QuestionPaletteProps) {
  const answered = answers.filter((answer) => answer !== null).length;
  const unanswered = total - answered;
  const markedForReview = review.filter(Boolean).length;

  return (
    <div className="flex min-w-0 flex-col gap-5">
      {/* Single palette heading */}
      <h3 className="text-lg font-bold text-white">
        Question Palette
      </h3>

      {/* Status legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-emerald-500" />
          Answered
        </span>

        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-slate-500 bg-slate-800" />
          Unanswered
        </span>

        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-amber-500" />
          Review
        </span>
      </div>

      {/* Responsive grid: stays in normal document flow */}
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: total }, (_, index) => {
          const isAnswered = answers[index] !== null;
          const isCurrent = current === index;
          const isReview = review[index];

          let statusClass =
            "border border-slate-600 bg-slate-800 text-slate-200";

          if (isAnswered) {
            statusClass =
              "border border-emerald-500 bg-emerald-500 text-slate-950";
          }

          if (isReview) {
            statusClass =
              "border border-amber-500 bg-amber-500 text-slate-950";
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Question ${index + 1}${
                isAnswered ? ", answered" : ", unanswered"
              }${isReview ? ", marked for review" : ""}`}
              aria-current={isCurrent ? "step" : undefined}
              className={[
                "flex aspect-square min-w-0 items-center justify-center",
                "rounded-lg text-sm font-semibold transition-colors",
                "hover:brightness-110 focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-cyan-400",
                statusClass,
                isCurrent
                  ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0d1423]"
                  : "",
              ].join(" ")}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Statistics occupy their own space below the complete grid */}
      <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
        <div className="min-w-0 rounded-xl bg-slate-800/70 p-3">
          <p className="text-xs text-slate-400">Answered</p>
          <p className="mt-1 text-xl font-bold text-emerald-400">
            {answered}
          </p>
        </div>

        <div className="min-w-0 rounded-xl bg-slate-800/70 p-3">
          <p className="text-xs text-slate-400">Unanswered</p>
          <p className="mt-1 text-xl font-bold text-slate-200">
            {unanswered}
          </p>
        </div>

        <div className="col-span-2 rounded-xl bg-slate-800/70 p-3">
          <p className="text-xs text-slate-400">Marked for Review</p>
          <p className="mt-1 text-xl font-bold text-amber-400">
            {markedForReview}
          </p>
        </div>
      </div>
    </div>
  );
}