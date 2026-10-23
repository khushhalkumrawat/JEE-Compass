interface QuestionPaletteProps {
  total: number;
  current: number;
  answers: (string | number | null)[];
  review: boolean[];
  onSelect: (index: number) => void;
}

export default function QuestionPalette({
  total,
  current,
  answers,
  review,
  onSelect,
}: QuestionPaletteProps) {
  return (
    <div>
      <h3 className="mb-3 font-semibold text-white">Question Palette</h3>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
        {Array.from({ length: total }, (_, index) => {
          const isAnswered = answers[index] !== null;
          const isReview = review[index];
          const isCurrent = current === index;

          let color = "bg-slate-800 text-slate-300";

          if (isAnswered) color = "bg-emerald-600 text-white";
          if (isReview) color = "bg-amber-500 text-slate-950";
          if (isCurrent)
            color = "ring-2 ring-white ring-offset-2 ring-offset-[#0d1423]";

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Go to question ${index + 1}`}
              aria-current={isCurrent ? "step" : undefined}
              className={`flex h-10 items-center justify-center rounded-lg text-sm font-semibold ${color}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2 text-xs text-slate-400">
        <p>🟩 Answered</p>
        <p>🟨 Marked for review</p>
        <p>⬛ Not answered</p>
      </div>
    </div>
  );
}
