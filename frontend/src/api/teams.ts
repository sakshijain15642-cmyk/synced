import type { Team } from "../types";
import { request } from "./client";

export function listTeams(): Promise<Team[]> {
  return request<Team[]>("/teams");
}

export function createTeam(name: string): Promise<Team> {
  return request<Team>("/teams", { method: "POST", json: { name } });
}