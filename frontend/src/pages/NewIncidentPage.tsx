import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../api/client";
import { createIncident } from "../api/incidents";
import SelectField from "../components/SelectField";
import TextAreaField from "../components/TextAreaField";
import TextField from "../components/TextField";
import { SEVERITIES, type Severity } from "../types";
import {
  validateIncidentDescription,
  validateIncidentTitle,
} from "../utils/validation";

export default function NewIncidentPage() {
  const { teamId } = useParams();
  const teamNumber = Number(teamId);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const errors = {
    title: validateIncidentTitle(title),
    description: validateIncidentDescription(description),
  };
  const hasErrors = Object.values(errors).some(Boolean);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setServerError(null);
    if (hasErrors) return;

    setSubmitting(true);
    try {
      const incident = await createIncident(teamNumber, {
        title: title.trim(),
        description: description.trim(),
        severity,
      });
      // replace: Back from the new incident returns to the list, not this form.
      navigate(`/teams/${teamNumber}/incidents/${incident.id}`, {
        replace: true,
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

  if (!Number.isInteger(teamNumber)) {
    return (
      <main>
        <h1>Team not found</h1>
        <Link to="/teams">Back to teams</Link>
      </main>
    );
  }

  return (
    <main>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/teams">Teams</Link> /{" "}
        <Link to={`/teams/${teamNumber}`}>Team #{teamNumber}</Link> /{" "}
        <span>New incident</span>
      </nav>
      <h1>New incident</h1>

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Title"
          value={title}
          onChange={setTitle}
          error={submitted ? errors.title : null}
        />
        <TextAreaField
          label="Description"
          value={description}
          onChange={setDescription}
          error={submitted ? errors.description : null}
        />
        <SelectField
          label="Severity"
          value={severity}
          options={SEVERITIES}
          onChange={setSeverity}
        />
        {serverError && (
          <p className="form-error" role="alert">
            {serverError}
          </p>
        )}
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? "Creating..." : "Create incident"}
        </button>{" "}
        <Link to={`/teams/${teamNumber}`}>Cancel</Link>
      </form>
    </main>
  );
}