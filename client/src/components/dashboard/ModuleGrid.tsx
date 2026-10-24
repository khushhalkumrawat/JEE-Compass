import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { modules } from "../../data/dashboard";
import ModuleCard from "../ui/ModuleCard";

export default function ModuleGrid() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredModules = useMemo(() => {
    const query = search.trim().toLowerCase();

    return modules.filter((module) =>
      `${module.title} ${module.description}`.toLowerCase().includes(query),
    );
  }, [search]);

  return (
    <section className="mt-10">
      {" "}
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        {" "}
        <div>
          {" "}
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">
            Everything you need{" "}
          </p>
          <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">
            Your learning workspace
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            One platform. Your complete JEE preparation.
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0d1423] px-3 py-2.5 sm:w-64">
          <Search size={16} className="shrink-0 text-slate-500" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find a module..."
            className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
          />
        </label>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredModules.map((module) => (
          <ModuleCard
            key={module.path}
            module={module}
            onClick={() => navigate(module.path)}
          />
        ))}

        {filteredModules.length === 0 && (
          <p className="text-sm text-slate-400">
            No modules match your search.
          </p>
        )}
      </div>
    </section>
  );
}
