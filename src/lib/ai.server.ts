const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export type GatewayMessage = {
  role: "system" | "user" | "assistant";
  content: unknown;
};

export class AiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function callGateway(body: Record<string, unknown>): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiError(401, "AI is not configured for this app.");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string }; message?: string };
      message = parsed.error?.message ?? parsed.message ?? text;
    } catch {
      /* keep raw text */
    }
    if (res.status === 429) message = "The assistant is busy right now. Please try again in a moment.";
    if (res.status === 402) message = message || "AI credits are exhausted for this workspace.";
    throw new AiError(res.status, message);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}

export function extractJson<T>(raw: string, fallback: T): T {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return fallback;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return fallback;
  }
}

export const WELLNESS_SYSTEM_PROMPT = `You are MindTalk AI, a warm, empathetic wellness companion.
You give general wellness, lifestyle, nutrition, sleep, movement and mental-wellbeing guidance only.
You never diagnose conditions, never prescribe medication, and never claim medical certainty.
If a message suggests a medical emergency (chest pain, trouble breathing, severe bleeding, suicidal thoughts),
calmly urge the person to contact local emergency services immediately.
Keep replies short, kind and practical: 2-4 short paragraphs or a few bullets maximum.`;
