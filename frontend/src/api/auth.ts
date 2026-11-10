import type { Token, User } from "../types";
import { request } from "./client";
import { setToken } from "./token";

interface SignupData {
  email: string;
  full_name: string;
  password: string;
}

export function signup(data: SignupData): Promise<User> {
  return request<User>("/auth/signup", { method: "POST", json: data });
}

// The API expects the email in a field named "username" (the OAuth2 standard).
export async function login(email: string, password: string): Promise<void> {
  const token = await request<Token>("/auth/login", {
    method: "POST",
    form: { username: email, password },
  });
  setToken(token.access_token);
}

export function getCurrentUser(): Promise<User> {
  return request<User>("/auth/me");
}