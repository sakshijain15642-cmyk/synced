import type { Incident, IncidentStatus } from "../types";
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