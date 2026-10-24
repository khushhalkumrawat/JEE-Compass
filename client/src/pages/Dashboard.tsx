import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import StatsGrid from "../components/dashboard/StatsGrid";
import ModuleGrid from "../components/dashboard/ModuleGrid";
import StudyPlan from "../components/dashboard/StudyPlan";
import AnalysisBanner from "../components/dashboard/AnalysisBanner";

export default function Dashboard() {
  return (
    <>
      {" "}
      <WelcomeBanner />
      <StatsGrid />
      <ModuleGrid />
      <section className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <StudyPlan />
        <AnalysisBanner />
      </section>
      <footer className="mt-10 border-t border-white/[0.06] py-6 text-center text-xs text-slate-600">
        PrepZen · Learn with purpose. Improve with every attempt.
      </footer>
    </>
  );
}
