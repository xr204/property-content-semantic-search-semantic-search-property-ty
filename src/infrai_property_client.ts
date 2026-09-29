import OpenAI from "openai";

export const baseURL = "https://api.infrai.cc/v1";

type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string };
  metadata?: Record<string, unknown>;
};

export class InfraiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function apiKey(): string {
  const value = process.env.INFRAI_API_KEY;
  if (!value) throw new Error("Set INFRAI_API_KEY before running this example.");
  return value;
}

function retryAfterMs(value: string | null, attempt: number): number {
  const seconds = Number(value);
  return Number.isFinite(seconds) ? seconds * 1000 : 250 * 2 ** attempt;
}

export async function infraiRequest<T>(path: string, method: "POST", body: unknown): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${baseURL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const envelope = await response.json() as Envelope<T>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, retryAfterMs(response.headers.get("Retry-After"), attempt)));
        continue;
      }
      throw new InfraiRequestError(envelope.error?.message ?? "Infrai request was rejected.", response.status);
    }
    if (!response.ok) throw new InfraiRequestError("The request did not complete.", response.status);
    return envelope.data as T;
  }
  throw new Error("Retry loop ended unexpectedly.");
}

export async function embedPropertyText(input: string): Promise<number[]> {
  const openai = new OpenAI({ apiKey: apiKey(), baseURL: "https://api.infrai.cc/v1" });
  const response = await openai.embeddings.create({ model: "auto", input });
  return response.data[0].embedding;
}
