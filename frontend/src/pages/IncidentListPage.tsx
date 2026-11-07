import { Link, useParams } from "react-router-dom";

export default function IncidentListPage() {
  const { teamId } = useParams();

  return (
    <main>
      <h1>Incidents for team {teamId}</h1>
      <p>Incident list coming on Day 12.</p>
      <Link to={`/teams/${teamId}/incidents/1`}>Open incident 1 (demo link)</Link>
      <br />
      <Link to="/teams">Back to teams</Link>
    </main>
  );
}