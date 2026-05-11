import { apiFetch } from "./api";

export type SupportMessage = {
  id: string;
  userId: number;
  email: string;
  name: string;
  subject: string;
  message: string;
  orderId: string;
  createdAt: string;
};

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (data?.error) return data.error;
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status}).`;
}

export async function fetchMyMessages(
  token: string,
): Promise<SupportMessage[]> {
  let res: Response;
  try {
    res = await apiFetch("/api/messages", {
      headers: { Authorization: `Bearer ${token}` },
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
  const data = (await res.json()) as { messages: SupportMessage[] };
  return data.messages;
}

export async function submitSupportMessage(
  token: string,
  body: { subject?: string; message: string; orderId?: string },
): Promise<{ id: string }> {
  let res: Response;
  try {
    res = await apiFetch("/api/messages", {
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
