import { useCallback, useEffect, useState } from "react";

export type SessionUser = { id: number; username: string; created_at?: number };

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export async function authRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, credentials: "include", headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "The account service could not complete that request.");
  return payload;
}

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/" } = options ?? {};
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authRequest<{ user: SessionUser | null }>("/api/auth/me");
      setUser(response.user);
      setError(null);
      return response.user;
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error("Unable to read the current session."));
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authRequest<{ ok: boolean }>("/api/auth/logout", { method: "POST", body: "{}" });
    setUser(null);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!redirectOnUnauthenticated || loading || user || window.location.pathname === redirectPath) return;
    window.location.assign(redirectPath);
  }, [redirectOnUnauthenticated, loading, user, redirectPath]);

  return { user, loading, error, isAuthenticated: Boolean(user), refresh, logout };
}
