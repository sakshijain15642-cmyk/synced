import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../api/client";
import { getIncident } from "../api/incidents";
import Badge from "../components/Badge";
import type { Incident } from "../types";
import { formatDateTime, timeAgo } from "../utils/format";

interface Loaded {
  requestKey: string;
  incident: Incident;
}

interface Failed {
  requestKey: string;
  status: number | null;
  message: string;
}

export default function IncidentDetailPage() {
  const { teamId, incidentId } = useParams();
  const teamNumber = Number(teamId);
  const incidentNumber = Number(incidentId);
  const validTeam = Number.isInteger(teamNumber);
  const validIds = validTeam && Number.isInteger(incidentNumber);
  const backTo = validTeam ? `/teams/${teamNumber}` : "/teams";

  const [attempt, setAttempt] = useState(0); // bump to retry after an error
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState<Failed | null>(null);

  // Only results for THIS key count; anything else is stale and ignored.
  const requestKey = `${teamNumber}|${incidentNumber}|${attempt}`;
  const incident = loaded?.requestKey === requestKey ? loaded.incident : null;
  const failure = failed?.requestKey === requestKey ? failed : null;
  const isLoading = incident === null && failure === null;

  useEffect(() => {
    if (!validIds) return;
    let cancelled = false;

    getIncident(teamNumber, incidentNumber)
      .then((result) => {
        if (!cancelled) setLoaded({ requestKey, incident: result });
      })
      .catch((err) => {
        if (cancelled) return;
        setFailed({
          requestKey,
          status: err instanceof ApiError ? err.status : null,
          message:
            err instanceof ApiError
              ? err.message
              : "Could not load this incident.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [teamNumber, incidentNumber, requestKey, validIds]);

  // Put the incident title in the browser tab.
  useEffect(() => {
    document.title = incident ? `${incident.title} - Synced` : "Synced";
    return () => {
      document.title = "Synced";
    };
  }, [incident]);

  if (!validIds || failure?.status === 404) {
    return (
      <main>
        <h1>Incident not found</h1>
        <p>It may not exist, or it may belong to a team you are not in.</p>
        <Link to={backTo}>Back to incidents</Link>
      </main>
    );
  }

  return (
    <main>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/teams">Teams</Link> /{" "}
        <Link to={backTo}>Team #{teamNumber}</Link> /{" "}
        <span>Incident #{incidentNumber}</span>
      </nav>

      {isLoading && <p>Loading incident...</p>}

      {failure && (
        <>
          <p className="form-error" role="alert">
            {failure.message}
          </p>
          <button type="button" onClick={() => setAttempt((n) => n + 1)}>
            Try again
          </button>
        </>
      )}

      {incident && (
        <article>
          <h1 className="incident-title">{incident.title}</h1>
          <div className="incident-badges">
            <Badge kind="severity" value={incident.severity} />
            <Badge kind="status" value={incident.status} />
          </div>

          <dl className="detail-meta">
            <div>
              <dt>Opened</dt>
              <dd>
                <time dateTime={incident.created_at}>
                  {formatDateTime(incident.created_at)}
                </time>{" "}
                ({timeAgo(incident.created_at)})
              </dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>
                <time dateTime={incident.updated_at}>
                  {formatDateTime(incident.updated_at)}
                </time>{" "}
                ({timeAgo(incident.updated_at)})
              </dd>
            </div>
            <div>
              <dt>Opened by</dt>
              <dd>User #{incident.created_by}</dd>
            </div>
          </dl>

          <h2>Description</h2>
          {incident.description ? (
            <p className="description">{incident.description}</p>
          ) : (
            <p className="muted">No description provided.</p>
          )}

          <h2>Actions</h2>
          <p className="muted">Changing the status comes on Day 14.</p>
        </article>
      )}
    </main>
  );
}