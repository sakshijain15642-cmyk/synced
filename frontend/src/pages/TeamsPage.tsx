import { Link } from "react-router-dom";

export default function TeamsPage() {
  return (
    <main>
      <h1>Your teams</h1>
      <p>Team list coming on Day 11.</p>
      <Link to="/teams/1">Open team 1 (demo link)</Link>
    </main>
  );
}