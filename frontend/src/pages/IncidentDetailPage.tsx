import { Link, useParams } from "react-router-dom";

export default function IncidentDetailPage() {
  const { teamId, incidentId } = useParams();

  return (
    <main>
      <h1>
        Incident {incidentId} (team {teamId})
      </h1>
      <p>Incident detail coming on Day 13.</p>
      <Link to={`/teams/${teamId}`}>Back to incidents</Link>
    </main>
  );
}