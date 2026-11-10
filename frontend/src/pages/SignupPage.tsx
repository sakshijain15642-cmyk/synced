import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/context";
import TextField from "../components/TextField";
import {
  validateEmail,
  validateFullName,
  validateNewPassword,
} from "../utils/validation";

export default function SignupPage() {
  const { status, signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const errors = {
    fullName: validateFullName(fullName),
    email: validateEmail(email),
    password: validateNewPassword(password),
    confirmPassword:
      confirmPassword === password ? null : "Passwords do not match.",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setServerError(null);
    if (hasErrors) return;

    setSubmitting(true);
    try {
      await signUp({
        email: email.trim(),
        full_name: fullName.trim(),
        password,
      });
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
    return <Navigate to="/teams" replace />;
  }

  return (
    <main>
      <h1>Sign up</h1>
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Full name"
          autoComplete="name"
          value={fullName}
          onChange={setFullName}
          error={submitted ? errors.fullName : null}
        />
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
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          error={submitted ? errors.password : null}
        />
        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={submitted ? errors.confirmPassword : null}
        />
        {serverError && (
          <p className="form-error" role="alert">
            {serverError}
          </p>
        )}
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}