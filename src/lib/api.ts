/**
 * API paths: use relative `/api/...` in dev (Vite proxy) or set VITE_API_URL for production.
 */
export function apiUrl(path: string): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  const base = typeof raw === "string" ? raw.trim().replace(/\/$/, "") : "";
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!base) return p;
  return `${base}${p}`;
}

export async function apiFetch(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<Response> {
  const { json, headers: hdrs, ...rest } = init ?? {};
  const headers = new Headers(hdrs);
  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const body =
    json !== undefined ? JSON.stringify(json) : (rest as RequestInit).body;

  return fetch(apiUrl(path), {
    ...rest,
    headers,
    body,
  });
}
