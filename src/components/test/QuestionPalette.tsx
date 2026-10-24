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
visited,
onSelect,
}: QuestionPaletteProps) {
const statuses = [
{
label: "Answered",
color: "bg-emerald-600 text-white",
count: answers.filter((answer) => answer !== null).length,
},
{
label: "Not Answered",
color: "bg-red-600 text-white",
count: answers.filter(
(answer, index) => answer === null && visited[index] && !review[index],
).length,
},
{
label: "Marked for Review",
color: "bg-purple-600 text-white",
count: review.filter(
(marked, index) => marked && answers[index] === null,
).length,
},
{
label: "Answered & Marked for Review",
color: "bg-amber-400 text-slate-950",
count: review.filter(
(marked, index) => marked && answers[index] !== null,
).length,
},
{
label: "Not Visited",
color: "bg-slate-200 text-slate-900",
count: visited.filter((value, index) => !value && index !== current)
.length,
},
];

return ( <div> <div className="mb-4 flex items-center justify-between gap-2"> <h3 className="font-semibold text-white">Question Palette</h3> <span className="text-xs text-slate-400">
{answers.filter((answer) => answer !== null).length}/{total} answered </span> </div>

```
  <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5">
    {Array.from({ length: total }, (_, index) => {
      const isAnswered = answers[index] !== null;
      const isReview = review[index];
      const isVisited = visited[index];

      let color = "bg-slate-200 text-slate-900";

      if (isVisited && !isAnswered) {
        color = "bg-red-600 text-white";
      }

      if (isAnswered) {
        color = "bg-emerald-600 text-white";
      }

      if (isReview) {
        color = isAnswered
          ? "bg-amber-400 text-slate-950"
          : "bg-purple-600 text-white";
      }

      return (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(index)}
          aria-label={`Go to question ${index + 1}`}
          aria-current={current === index ? "step" : undefined}
          className={`relative flex h-10 items-center justify-center rounded-lg text-sm font-bold transition hover:brightness-110 ${
            color
          } ${
            current === index
              ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0d1423]"
              : ""
          }`}
        >
          {index + 1}
        </button>
      );
    })}
  </div>

  <div className="mt-5 grid grid-cols-1 gap-3 text-xs text-slate-300">
    {statuses.map((status) => (
      <div
        key={status.label}
        className="flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <span
            className={`h-4 w-4 shrink-0 rounded ${status.color}`}
          />
          <span>{status.label}</span>
        </div>
        <span className="font-semibold">{status.count}</span>
      </div>
    ))}
  </div>
</div>

);
}
