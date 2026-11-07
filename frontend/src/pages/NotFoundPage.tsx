import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main>
      <h1>Page not found</h1>
      <Link to="/teams">Go to your teams</Link>
    </main>
  );
}