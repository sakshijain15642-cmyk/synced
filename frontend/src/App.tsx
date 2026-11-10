import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import IncidentDetailPage from "./pages/IncidentDetailPage";
import IncidentListPage from "./pages/IncidentListPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import SignupPage from "./pages/SignupPage";
import TeamsPage from "./pages/TeamsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/teams" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Everything inside here requires a logged-in user. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/:teamId" element={<IncidentListPage />} />
          <Route
            path="/teams/:teamId/incidents/:incidentId"
            element={<IncidentDetailPage />}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}