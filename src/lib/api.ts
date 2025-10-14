import { ApiError } from "./errors";

export type AiResponse = { text?: string; error?: string; details?: unknown };

const API_URL: string =
  (typeof window !== "undefined" && window.__NEXT_API__) ||
  import.meta.env.VITE_API_URL ||
  // fallback z env
  "http://localhost:3000/api/ai";

export function postPrompt(
  prompt: string,
  signal?: AbortSignal
): Promise<AiResponse> {
  return fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
    mode: "cors",
    signal,
  }).then(async (res) => {
    const data = (await res.json()) as AiResponse;
    if (!res.ok) {
      throw new ApiError(data.error || "Request failed", data.details);
    }
    return data;
  });
}
