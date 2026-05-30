// Resolves the base URL for AI routes (chat + vision).
//
// If NEXT_PUBLIC_AI_BACKEND_URL is set (e.g. http://localhost:8000) the Python
// FastAPI backend serves these routes. If it is empty, calls fall back to the
// in-app Next.js routes under /api so the app still works with no backend.
const BASE = (process.env.NEXT_PUBLIC_AI_BACKEND_URL ?? "").replace(/\/$/, "");

/** Build the URL for an AI route, e.g. aiUrl("/api/chat"). */
export function aiUrl(path: string): string {
  return BASE ? `${BASE}${path}` : path;
}
