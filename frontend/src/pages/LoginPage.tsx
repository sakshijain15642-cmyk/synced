import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <main>
      <h1>Log in</h1>
      <p>Login form coming on Day 9.</p>
      <Link to="/signup">Need an account? Sign up</Link>
    </main>
  );
}