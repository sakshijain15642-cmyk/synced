import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/auth";
import { ApiError } from "../api/client";
import { clearToken } from "../api/token";
import type { User } from "../types";

export default function TeamsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false; // ignore results that arrive after we've left the page

    getCurrentUser()
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          navigate("/login");
        } else {
          setError(err instanceof ApiError ? err.message : "Something went wrong.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  return (
    <main>
      <h1>Your teams</h1>
      {error && <p className="form-error">{error}</p>}
      {user && (
        <p>
          Logged in as <strong>{user.full_name}</strong> ({user.email})
        </p>
      )}
      <p>Team list coming on Day 11.</p>
      <Link to="/teams/1">Open team 1 (demo link)</Link>
      <br />
      <button type="button" onClick={handleLogout}>
        Log out
      </button>
    </main>
  );
}