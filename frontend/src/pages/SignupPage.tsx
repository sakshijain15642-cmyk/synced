import { Link } from "react-router-dom";

export default function SignupPage() {
  return (
    <main>
      <h1>Sign up</h1>
      <p>Signup form coming on Day 9.</p>
      <Link to="/login">Already have an account? Log in</Link>
    </main>
  );
}