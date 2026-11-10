import { useEffect, useState, type ReactNode } from "react";
import { getCurrentUser, login, signup } from "../api/auth";
import { UNAUTHORIZED_EVENT } from "../api/client";
import { clearToken, getToken } from "../api/token";
import type { User } from "../types";
import { AuthContext, type AuthStatus, type SignupInput } from "./context";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    getToken() ? "loading" : "anonymous",
  );

  // On first load, if a token is stored, ask the server whether it is still valid.
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;

    getCurrentUser()
      .then((currentUser) => {
        if (cancelled) return;
        setUser(currentUser);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!cancelled) setStatus("anonymous");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // The API client announces it when the server rejects our token.
  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
      setStatus("anonymous");
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () =>
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  async function signIn(email: string, password: string) {
    await login(email, password);
    setUser(await getCurrentUser());
    setStatus("authenticated");
  }

  async function signUp(input: SignupInput) {
    await signup(input);
    await signIn(input.email, input.password);
  }

  function signOut() {
    clearToken();
    setUser(null);
    setStatus("anonymous");
  }

  return (
    <AuthContext.Provider value={{ user, status, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}