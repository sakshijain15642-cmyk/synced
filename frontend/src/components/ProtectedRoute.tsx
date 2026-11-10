import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/context";

export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <main>
        <p>Loading...</p>
      </main>
    );
  }
  if (status === "anonymous") {
    // Remember where they were going, so login can send them back there.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}