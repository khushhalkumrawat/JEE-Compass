import type { DashboardStat } from "../../types";

interface StatCardProps {
  stat: DashboardStat;
}

export default function StatCard({ stat }: StatCardProps) {
  const Icon = stat.icon;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0d1423] p-5 transition hover:border-white/[0.13]">
      {" "}
      <div className="flex items-start justify-between">
        {" "}
        <p className="text-xs font-medium text-slate-400">{stat.label}</p>
        <div
          className="rounded-xl p-2"
          style={{
            backgroundColor: `${stat.color}15`,
            color: stat.color,
          }}
        >
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-white">
        {stat.value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{stat.note}</p>
    </div>
  );
}
