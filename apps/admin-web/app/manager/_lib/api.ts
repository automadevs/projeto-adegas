function apiBase(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  if (typeof window !== "undefined") {
    return "/api/v1";
  }

  return "http://localhost:3000/api/v1";
}

export async function api<TResponse>(path: string, init: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  headers.set("accept", "application/json");
  const base = apiBase();
  const response = await fetch(`${base}${path}`, { ...init, headers });
  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { detail?: string; title?: string } | null;
    throw new Error(problem?.detail ?? problem?.title ?? "Erro na API");
  }
  return await response.json() as TResponse;
}
