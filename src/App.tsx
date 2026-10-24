import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import StudyMaterial from "./pages/StudyMaterial";
import DailyPractice from "./pages/DailyPractice";
import DoubtSolver from "./pages/DoubtSolver";
import MockTests from "./pages/MockTests";
import TestAttempt from "./pages/TestAttempt";
import TestResult from "./pages/TestResult";
import PerformanceAnalysis from "./pages/PerformanceAnalysis";
import StudyPlanPage from "./pages/StudyPlanPage";
import TestHistory from "./pages/TestHistory";
import TestReview from "./pages/TestReview";
import AuthPage from "./pages/AuthPage";
import AdminQuestions from "./pages/AdminQuestions";
import { getStudent } from "./services/auth";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/register"
          element={<Navigate to="/login?mode=register" replace />}
        />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/materials" element={<StudyMaterial />} />
          <Route path="/dpp" element={<DailyPractice />} />
          <Route path="/doubts" element={<DoubtSolver />} />
          <Route path="/tests" element={<MockTests />} />
          <Route path="/tests/:attemptId" element={<TestAttempt />} />
          <Route path="/results/:attemptId" element={<TestResult />} />
          <Route path="/analysis" element={<PerformanceAnalysis />} />
          <Route path="/study-plan" element={<StudyPlanPage />} />
          <Route path="/test-history" element={<TestHistory />} />
          <Route path="/results/:attemptId/review" element={<TestReview />} />
          <Route
            path="/admin/questions"
            element={
              getStudent()?.role === "admin" ? (
                <AdminQuestions />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
