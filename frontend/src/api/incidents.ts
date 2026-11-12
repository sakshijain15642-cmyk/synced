import type { Incident, IncidentStatus, Severity } from "../types";
import { request } from "./client";

export interface ListIncidentsParams {
  status?: IncidentStatus;
  limit?: number;
  offset?: number;
}

export function listIncidents(
  teamId: number,
  params: ListIncidentsParams = {},
): Promise<Incident[]> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.offset !== undefined) query.set("offset", String(params.offset));

  const queryString = query.toString();
  const suffix = queryString ? `?${queryString}` : "";
  return request<Incident[]>(`/teams/${teamId}/incidents${suffix}`);
}

export function getIncident(
  teamId: number,
  incidentId: number,
): Promise<Incident> {
  return request<Incident>(`/teams/${teamId}/incidents/${incidentId}`);
}

export interface CreateIncidentInput {
  title: string;
  description?: string;
  severity?: Severity;
}

export interface UpdateIncidentInput {
  title?: string;
  description?: string;
  status?: IncidentStatus;
  severity?: Severity;
}

export function createIncident(
  teamId: number,
  input: CreateIncidentInput,
): Promise<Incident> {
  return request<Incident>(`/teams/${teamId}/incidents`, {
    method: "POST",
    json: input,
  });
}

// PATCH: send only the fields that change; the server returns the full incident.
export function updateIncident(
  teamId: number,
  incidentId: number,
  changes: UpdateIncidentInput,
): Promise<Incident> {
  return request<Incident>(`/teams/${teamId}/incidents/${incidentId}`, {
    method: "PATCH",
    json: changes,
  });
}