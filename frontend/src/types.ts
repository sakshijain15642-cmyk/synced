export type IncidentStatus =
  | "open"
  | "investigating"
  | "mitigated"
  | "resolved";

export type Severity = "low" | "medium" | "high" | "critical";

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