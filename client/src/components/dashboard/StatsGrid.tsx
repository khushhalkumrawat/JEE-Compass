import { useEffect, useState } from "react";
import StatCard from "../ui/StatCard";
import { dashboardStats } from "../../data/dashboard";
import { getTestHistory } from "../../services/testResults";
import { fetchDPPProgress } from "../../services/dppProgress";
import type { TestResult } from "../../types/test";
import { getStudyStreak } from "../../services/studyActivity";

export default function StatsGrid() {
  const [stats, setStats] = useState(dashboardStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        const [testResponse, dppProgress, studyStreak] = await Promise.all([
          getTestHistory(),
          fetchDPPProgress(),
          getStudyStreak(),
        ]);

        if (!active) return;

        const results: TestResult[] = Array.isArray(testResponse)
          ? testResponse
          : Array.isArray(testResponse?.results)
            ? testResponse.results
            : Array.isArray(testResponse?.data)
              ? testResponse.data
              : [];

        const mockQuestionsAttempted = results.reduce(
          (sum, result) => sum + (Number(result.attempted) || 0),
          0,
        );

        const dppQuestionsAttempted = Object.keys(
          dppProgress.answered ?? {},
        ).length;

        const questionsSolved = mockQuestionsAttempted + dppQuestionsAttempted;

        const mockCorrect = results.reduce(
          (sum, result) => sum + (Number(result.correct) || 0),
          0,
        );

        const dppCorrect = (dppProgress.correct ?? []).length;

        const totalCorrect = mockCorrect + dppCorrect;

        const totalAttempted = mockQuestionsAttempted + dppQuestionsAttempted;

        const accuracy =
          totalAttempted > 0
            ? `${Math.round((totalCorrect / totalAttempted) * 100)}%`
            : "—";
        setStats(
          dashboardStats.map((stat) => {
            switch (stat.label) {
              case "Questions Solved":
                return {
                  ...stat,
                  value: String(questionsSolved),
                  note: "DPP + mock-test questions attempted",
                };

              case "Study Streak":
                return {
                  ...stat,
                  value: `${studyStreak} ${studyStreak === 1 ? "day" : "days"}`,
                  note:
                    studyStreak > 0
                      ? "Keep your learning streak alive!"
                      : "Study today to start your streak",
                };

              case "Mock Tests":
                return {
                  ...stat,
                  value: String(results.length),
                  note: "Tests submitted",
                };

              case "Accuracy":
                return {
                  ...stat,
                  value: accuracy,
                  note: "Across DPP + mock-test questions",
                };

              default:
                return stat;
            }
          }),
        );
      } catch (error) {
        console.error("Failed to load dashboard statistics:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadStats();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          stat={
            loading &&
            [
              "Questions Solved",
              "Study Streak",
              "Mock Tests",
              "Accuracy",
            ].includes(stat.label)
              ? { ...stat, value: "..." }
              : stat
          }
        />
      ))}
    </section>
  );
}
