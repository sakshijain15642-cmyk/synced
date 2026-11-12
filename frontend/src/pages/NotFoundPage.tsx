import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
export default function NotFoundPage() {
  usePageTitle("Page not found");
  return (
    <main>
      <h1>Page not found</h1>
      <Link to="/teams">Go to your teams</Link>
    </main>
  );
}