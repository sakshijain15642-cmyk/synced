export const INCIDENT_STATUSES = [
  "open",
  "investigating",
  "mitigated",
  "resolved",
] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type Severity = (typeof SEVERITIES)[number];

export function isIncidentStatus(value: string | null): value is IncidentStatus {
  return INCIDENT_STATUSES.some((status) => status === value);
}

export interface User {
  id: number;
  email: string;
  full_name: string;
}

export interface Team {
  id: number;
  name: string;
}

export interface Incident {
  id: number;
  team_id: number;
  created_by: number;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: Severity;
  created_at: string;
  updated_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}