import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ApiError } from "../api/client";
import { listIncidents } from "../api/incidents";
import Badge from "../components/Badge";
import { INCIDENT_STATUSES, isIncidentStatus, type Incident } from "../types";
import { capitalize, timeAgo } from "../utils/format";

const PAGE_SIZE = 10;

interface Loaded {
  requestKey: string;
  incidents: Incident[];
  hasMore: boolean;
}

interface Failed {
  requestKey: string;
  message: string;
}

export default function IncidentListPage() {
  const { teamId } = useParams();
  const id = Number(teamId);
  const validTeam = Number.isInteger(id);

  // The filter lives in the URL: /teams/3?status=open
  const [searchParams, setSearchParams] = useSearchParams();
  const rawStatus = searchParams.get("status");
  const status = isIncidentStatus(rawStatus) ? rawStatus : null;

  const [attempt, setAttempt] = useState(0); // bump to retry after an error
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState<Failed | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);

  // Only results for THIS key count; anything else is stale and ignored.
  const requestKey = `${id}|${status ?? "all"}|${attempt}`;
  const current = loaded?.requestKey === requestKey ? loaded : null;
  const error = failed?.requestKey === requestKey ? failed.message : null;
  const isLoading = current === null && error === null;

  useEffect(() => {
    if (!validTeam) return;
    let cancelled = false;

    listIncidents(id, {
      status: status ?? undefined,
      limit: PAGE_SIZE,
      offset: 0,
    })
      .then((page) => {
        if (cancelled) return;
        setLoaded({
          requestKey,
          incidents: page,
          hasMore: page.length === PAGE_SIZE,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setFailed({
          requestKey,
          message:
            err instanceof ApiError ? err.message : "Could not load incidents.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [id, status, requestKey, validTeam]);

  function handleFilterChange(value: string) {
    setMoreError(null);
    setSearchParams(value ? { status: value } : {});
  }

  async function loadMore() {
    if (!current) return;
    setLoadingMore(true);
    setMoreError(null);
    try {
      const page = await listIncidents(id, {
        status: status ?? undefined,
        limit: PAGE_SIZE,
        offset: current.incidents.length,
      });
      setLoaded((prev) => {
        if (!prev || prev.requestKey !== requestKey) return prev;
        // Skip anything we already have (new incidents can shift the pages).
        const known = new Set(prev.incidents.map((incident) => incident.id));
        const fresh = page.filter((incident) => !known.has(incident.id));
        return {
          ...prev,
          incidents: [...prev.incidents, ...fresh],
          hasMore: page.length === PAGE_SIZE,
        };
      });
    } catch (err) {
      setMoreError(
        err instanceof ApiError
          ? err.message
          : "Could not load more incidents.",
      );
    } finally {
      setLoadingMore(false);
    }
  }

  if (!validTeam) {
    return (
      <main>
        <h1>Team not found</h1>
        <Link to="/teams">Back to teams</Link>
      </main>
    );
  }

  return (
    <main>
      <p>
        <Link to="/teams">&larr; Back to teams</Link>
      </p>
      <h1>Incidents</h1>

      <div className="toolbar">
        <label htmlFor="status-filter">Status</label>
        <select
          id="status-filter"
          value={status ?? ""}
          onChange={(event) => handleFilterChange(event.target.value)}
        >
          <option value="">All</option>
          {INCIDENT_STATUSES.map((option) => (
            <option key={option} value={option}>
              {capitalize(option)}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p>Loading incidents...</p>}

      {error && (
        <>
          <p className="form-error" role="alert">
            {error}
          </p>
          <button type="button" onClick={() => setAttempt((n) => n + 1)}>
            Try again
          </button>
        </>
      )}

      {current && current.incidents.length === 0 && (
        <p>
          {status
            ? `No ${status} incidents.`
            : "No incidents yet. Creating them comes on Day 14."}
        </p>
      )}

      {current && current.incidents.length > 0 && (
        <>
          <ul className="incident-list">
            {current.incidents.map((incident) => (
              <li key={incident.id} className="incident-row">
                <div className="incident-main">
                  <Link to={`/teams/${id}/incidents/${incident.id}`}>
                    {incident.title}
                  </Link>
                  <div className="incident-meta">
                    #{incident.id} &middot; opened{" "}
                    <time
                      dateTime={incident.created_at}
                      title={new Date(incident.created_at).toLocaleString()}
                    >
                      {timeAgo(incident.created_at)}
                    </time>
                  </div>
                </div>
                <div className="incident-badges">
                  <Badge kind="severity" value={incident.severity} />
                  <Badge kind="status" value={incident.status} />
                </div>
              </li>
            ))}
          </ul>

          {moreError && (
            <p className="form-error" role="alert">
              {moreError}
            </p>
          )}
          {current.hasMore && (
            <button type="button" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          )}
        </>
      )}
    </main>
  );
}