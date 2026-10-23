import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Clock3,
  Search,
} from "lucide-react";
import { studyMaterials, type StudyMaterial } from "../data/studyMaterials";

type SubjectFilter = "All" | StudyMaterial["subject"];

const BOOKMARK_STORAGE_KEY = "jee-compass-study-bookmarks";

export default function StudyMaterialPage() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState<SubjectFilter>("All");
  const [selectedMaterial, setSelectedMaterial] =
    useState<StudyMaterial | null>(null);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem(BOOKMARK_STORAGE_KEY) ?? "[]",
      ) as number[];
    } catch {
      return [];
    }
  });

  const filteredMaterials = useMemo(() => {
    const query = search.trim().toLowerCase();

    return studyMaterials.filter((material) => {
      const matchesSubject = subject === "All" || material.subject === subject;

      const matchesSearch =
        !query ||
        [
          material.title,
          material.subject,
          material.chapter,
          material.type,
          material.description,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesBookmark =
        !showBookmarksOnly || bookmarks.includes(material.id);

      return matchesSubject && matchesSearch && matchesBookmark;
    });
  }, [search, subject, showBookmarksOnly, bookmarks]);

  function toggleBookmark(id: number) {
    const updated = bookmarks.includes(id)
      ? bookmarks.filter((item) => item !== id)
      : [...bookmarks, id];

    setBookmarks(updated);
    localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(updated));
  }

  if (selectedMaterial) {
    return (
      <section className="mx-auto max-w-4xl space-y-6">
        <button
          type="button"
          onClick={() => setSelectedMaterial(null)}
          className="flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
        >
          {" "}
          <ArrowLeft size={17} />
          Back to Study Library{" "}
        </button>

        <article className="rounded-2xl border border-white/10 bg-[#0d1423] p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-lg bg-cyan-400/10 px-3 py-1.5 text-cyan-300">
              {selectedMaterial.subject}
            </span>
            <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-slate-300">
              {selectedMaterial.type}
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-bold text-white">
            {selectedMaterial.title}
          </h1>

          <p className="mt-3 text-slate-400">{selectedMaterial.description}</p>

          <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">
            <Clock3 size={16} />
            Estimated reading time: {selectedMaterial.duration}
          </div>

          <div className="mt-8 space-y-4">
            {selectedMaterial.content.map((paragraph, index) => (
              <div
                key={`${selectedMaterial.id}-${index}`}
                className="flex gap-4 rounded-xl border border-white/10 bg-slate-900/50 p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-sm font-bold text-cyan-300">
                  {index + 1}
                </span>

                <p className="text-sm leading-7 text-slate-300">{paragraph}</p>
              </div>
            ))}
          </div>

          {selectedMaterial.resourceUrl && (
            <a
              href={selectedMaterial.resourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm text-cyan-300"
            >
              Open external resource <ArrowUpRight size={16} />
            </a>
          )}

          <button
            type="button"
            onClick={() => toggleBookmark(selectedMaterial.id)}
            className="mt-8 flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-white"
          >
            <Bookmark
              size={17}
              fill={
                bookmarks.includes(selectedMaterial.id)
                  ? "currentColor"
                  : "none"
              }
            />
            {bookmarks.includes(selectedMaterial.id)
              ? "Remove Bookmark"
              : "Bookmark for Revision"}
          </button>
        </article>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {" "}
      <header>
        {" "}
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300">
          Your Learning Library{" "}
        </p>{" "}
        <h1 className="mt-2 text-3xl font-bold text-white">Study Materials </h1>{" "}
        <p className="mt-2 text-slate-400">
          Revise concepts, learn important formulas, and prepare chapter by
          chapter.{" "}
        </p>{" "}
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Study Resources" value={studyMaterials.length} />
        <SummaryCard
          label="Physics"
          value={
            studyMaterials.filter((item) => item.subject === "Physics").length
          }
        />
        <SummaryCard label="Bookmarked" value={bookmarks.length} />
      </div>
      <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0d1423] p-5">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search topics, chapters, or formulas..."
            className="w-full rounded-xl border border-white/10 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(["All", "Physics", "Chemistry", "Mathematics"] as const).map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSubject(item)}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  subject === item
                    ? "bg-cyan-400 text-slate-950"
                    : "border border-white/10 bg-slate-900 text-slate-300"
                }`}
              >
                {item === "All" ? "All Subjects" : item}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => setShowBookmarksOnly((value) => !value)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${
              showBookmarksOnly
                ? "bg-amber-400 text-slate-950"
                : "border border-white/10 bg-slate-900 text-slate-300"
            }`}
          >
            <Bookmark size={15} />
            Bookmarks
          </button>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredMaterials.map((material) => (
          <article
            key={material.id}
            className="flex flex-col rounded-2xl border border-white/10 bg-[#0d1423] p-5 transition hover:border-cyan-400/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300">
                <BookOpen size={22} />
              </div>

              <button
                type="button"
                onClick={() => toggleBookmark(material.id)}
                aria-label={
                  bookmarks.includes(material.id)
                    ? "Remove bookmark"
                    : "Add bookmark"
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-amber-300"
              >
                <Bookmark
                  size={18}
                  fill={
                    bookmarks.includes(material.id) ? "currentColor" : "none"
                  }
                />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md bg-cyan-400/10 px-2 py-1 text-cyan-300">
                {material.subject}
              </span>
              <span className="rounded-md bg-slate-800 px-2 py-1 text-slate-300">
                {material.type}
              </span>
            </div>

            <h2 className="mt-4 text-lg font-bold text-white">
              {material.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {material.description}
            </p>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>{material.chapter}</span>
              <span>{material.duration}</span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedMaterial(material)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Read Material <ArrowUpRight size={16} />
            </button>
          </article>
        ))}
      </div>
      {filteredMaterials.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#0d1423] p-10 text-center">
          <BookOpen className="mx-auto text-slate-500" size={34} />
          <h2 className="mt-4 font-semibold text-white">No materials found</h2>
          <p className="mt-2 text-sm text-slate-400">
            Try a different search or remove some filters.
          </p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#0d1423] p-5">
      {" "}
      <p className="text-sm text-slate-400">{label}</p>{" "}
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>{" "}
    </article>
  );
}
