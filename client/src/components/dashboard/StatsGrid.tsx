import StatCard from "../ui/StatCard";
import { dashboardStats } from "../../data/dashboard";

export default function StatsGrid() {
  return (
    <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {dashboardStats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}{" "}
    </section>
  );
}
