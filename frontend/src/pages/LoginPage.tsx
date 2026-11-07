import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import TextField from "../components/TextField";
import { validateEmail } from "../utils/validation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Errors are computed from the current values, not stored in state.
  const errors = {
    email: validateEmail(email),
    password: password ? null : "Password is required.",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // stop the browser from reloading the page
    setSubmitted(true);
    if (hasErrors) {
      setNotice(null);
      return;
    }
    // Day 10 replaces this with a real API call.
    setNotice("Form is valid. Connecting to the API comes on Day 10.");
  }

  return (
    <main>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          error={submitted ? errors.email : null}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          error={submitted ? errors.password : null}
        />
        <button type="submit" className="primary">
          Log in
        </button>
      </form>
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      <p>
        Need an account? <Link to="/signup">Sign up</Link>
      </p>
    </main>
  );
}