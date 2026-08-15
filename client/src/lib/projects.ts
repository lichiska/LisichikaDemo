import { authRequest } from "../_core/hooks/useAuth";

export type SavedProject = { id: number; name: string; payload: string; updated_at: number };

export async function saveProject(name: string, payload: Record<string, unknown>, projectId?: number) {
  const response = await authRequest<SavedProject | { ok: boolean; id: number }>(projectId ? `/api/projects/${projectId}` : "/api/projects", {
    method: projectId ? "PUT" : "POST",
    body: JSON.stringify({ name, payload }),
  });
  return response;
}

export async function listProjects() {
  return authRequest<{ projects: SavedProject[] }>("/api/projects");
}
