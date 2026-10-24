import { ChevronRight } from "lucide-react";
import type { Module } from "../../types";

interface ModuleCardProps {
  module: Module;
  onClick: () => void;
}

export default function ModuleCard({ module, onClick }: ModuleCardProps) {
  const Icon = module.icon;

  return (
    <button
      onClick={onClick}
      className="group rounded-2xl border border-white/[0.07] bg-[#0d1423] p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-[#10192b] sm:p-6"
    >
      {" "}
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: module.bg, color: module.color }}
        >
          {" "}
          <Icon size={23} />{" "}
        </div>
        ```
        <ChevronRight
          size={18}
          className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-indigo-300"
        />
      </div>
      <h4 className="mt-5 text-base font-semibold text-white">
        {module.title}
      </h4>
      <p className="mt-2 min-h-10 text-xs leading-5 text-slate-400">
        {module.description}
      </p>
      <p
        className="mt-5 text-[10px] font-bold tracking-[0.15em]"
        style={{ color: module.color }}
      >
        {module.label} ↗
      </p>
    </button>
  );
}
