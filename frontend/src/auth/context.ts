import { createContext, useContext } from "react";
import type { User } from "../types";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

export interface SignupInput {
  email: string;
  full_name: string;
  password: string;
}

export interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignupInput) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return value;
}