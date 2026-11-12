import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/client";
import { createTeam, listTeams } from "../api/teams";
import TextField from "../components/TextField";
import type { Team } from "../types";
import { validateTeamName } from "../utils/validation";
import ErrorBanner from "../components/ErrorBanner";
import Loading from "../components/Loading";
import { usePageTitle } from "../hooks/usePageTitle";

export default function TeamsPage() {
  // null means "not loaded yet".
  usePageTitle("Teams");
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listTeams()
      .then((result) => {
        if (!cancelled) setTeams(result);
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(
            error instanceof ApiError ? error.message : "Could not load teams.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const nameError = validateTeamName(name);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setCreateError(null);
    if (nameError) return;

    setCreating(true);
    try {
      const team = await createTeam(name.trim());
      setTeams((current) => [...(current ?? []), team]); // no refetch needed
      setName("");
      setSubmitted(false);
    } catch (error) {
      setCreateError(
        error instanceof ApiError ? error.message : "Could not create the team.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <main>
      <h1>Your teams</h1>

      {loadError && <ErrorBanner message={loadError} />}
      {teams === null && !loadError && <Loading label="Loading teams..." />}
      {teams !== null && teams.length === 0 && (
        <p>You are not in any team yet. Create one below.</p>
      )}
      {teams !== null && teams.length > 0 && (
        <ul className="team-list">
          {teams.map((team) => (
            <li key={team.id}>
              <Link to={`/teams/${team.id}`}>{team.name}</Link>
            </li>
          ))}
        </ul>
      )}

      <h2>Create a team</h2>
      <form onSubmit={handleCreate} noValidate>
        <TextField
          label="Team name"
          value={name}
          onChange={setName}
          error={submitted ? nameError : null}
        />
        {createError && (
          <p className="form-error" role="alert">
            {createError}
          </p>
        )}
        <button type="submit" className="primary" disabled={creating}>
          {creating ? "Creating..." : "Create team"}
        </button>
      </form>
    </main>
  );
}