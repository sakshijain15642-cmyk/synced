// These mirror the backend's rules (Pydantic schemas). The backend still
// re-checks everything: this file exists only to give instant feedback.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required.";
  if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address.";
  return null;
}

export function validateNewPassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password.length > 128) return "Password must be at most 128 characters.";
  return null;
}

export function validateFullName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Name is required.";
  if (trimmed.length > 100) return "Name must be at most 100 characters.";
  return null;
}

export function validateTeamName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Team name is required.";
  if (trimmed.length > 100) return "Team name must be at most 100 characters.";
  return null;
}

export function validateIncidentTitle(title: string): string | null {
  const trimmed = title.trim();
  if (!trimmed) return "Title is required.";
  if (trimmed.length > 200) return "Title must be at most 200 characters.";
  return null;
}

export function validateIncidentDescription(description: string): string | null {
  if (description.trim().length > 5000) {
    return "Description must be at most 5000 characters.";
  }
  return null;
}