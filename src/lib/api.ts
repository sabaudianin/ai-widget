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
  })
    .then(async (res) => {
      const data = (await res.json()) as AiResponse;
      if (!res.ok) {
        // Rzucamy API Error tylko dla błędów HTTP (4xx, 5xx)
        throw new ApiError(data.error || "Request failed", data.details);
      }
      return data;
    })
    .catch((error) => {
      // Jeśli to błąd anulowania (AbortError), rzucamy go dalej (nie jako ApiError)
      if (error.name === "AbortError") {
        throw error;
      }
      // W przeciwnym razie rzucamy oryginalny błąd (np. błąd sieci)
      throw error;
    });
}
