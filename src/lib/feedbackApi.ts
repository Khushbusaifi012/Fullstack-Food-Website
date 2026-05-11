import { apiFetch } from "./api";

export type FeedbackCategory = "bug" | "suggestion" | "compliment" | "other";

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (data?.error) return data.error;
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status}).`;
}

export async function submitFeedback(
  token: string,
  body: { message: string; category: FeedbackCategory },
): Promise<{ id: string }> {
  let res: Response;
  try {
    res = await apiFetch("/api/feedback", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      json: body,
    });
  } catch (e: unknown) {
    if (e instanceof TypeError) {
      throw new Error(
        "Network error — start the API (npm run dev:api or npm run dev:full).",
      );
    }
    throw e;
  }
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { ok: boolean; id: string };
  return { id: data.id };
}
