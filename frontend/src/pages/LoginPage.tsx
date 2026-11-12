import { usePageTitle } from "../hooks/usePageTitle"

import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/context";
import TextField from "../components/TextField";
import { validateEmail } from "../utils/validation";

export default function LoginPage() {
  usePageTitle("Log in");
  const { status, signIn } = useAuth();
  const location = useLocation();
  // If a protected page sent us here, go back to it after login.
  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? "/teams";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const errors = {
    email: validateEmail(email),
    password: password ? null : "Password is required.",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setServerError(null);
    if (hasErrors) return;

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "authenticated") {
    return <Navigate to={from} replace />;
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
        {serverError && (
          <p className="form-error" role="alert">
            {serverError}
          </p>
        )}
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p>
        Need an account? <Link to="/signup">Sign up</Link>
      </p>
    </main>
  );
}