import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import TextField from "../components/TextField";
import {
  validateEmail,
  validateFullName,
  validateNewPassword,
} from "../utils/validation";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const errors = {
    fullName: validateFullName(fullName),
    email: validateEmail(email),
    password: validateNewPassword(password),
    confirmPassword:
      confirmPassword === password ? null : "Passwords do not match.",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
        <button type="submit" className="primary">
          Create account
        </button>
      </form>
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}