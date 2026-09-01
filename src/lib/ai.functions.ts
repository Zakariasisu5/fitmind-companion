import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  callGateway,
  extractJson,
  WELLNESS_SYSTEM_PROMPT,
  type GatewayMessage,
} from "@/lib/ai.server";

const CHAT_MODEL = "google/gemini-3.7-flash";

const LANGUAGE_NAMES = { en: "English", tw: "Twi (Akan)", dag: "Dagbani" } as const;
type LangCode = keyof typeof LANGUAGE_NAMES;

export const askHealthCoach = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        message: z.string().min(1).max(4000),
        language: z.enum(["en", "tw", "dag"]).default("en"),
        history: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
          .max(20)
          .default([]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const language = data.language as LangCode;
    const localised = language !== "en";

    const systemPrompt = localised
      ? `${WELLNESS_SYSTEM_PROMPT}
The user reads ${LANGUAGE_NAMES[language]}. There is no natural ${LANGUAGE_NAMES[language]} voice available, so audio is spoken in English.
Respond ONLY with JSON: {"reply":"your answer in ${LANGUAGE_NAMES[language]}","english":"the same answer in simple spoken English"}`
      : WELLNESS_SYSTEM_PROMPT;

    const messages: GatewayMessage[] = [
      { role: "system", content: systemPrompt },
      ...data.history.map((m) => ({ role: m.role, content: m.content }) as GatewayMessage),
      { role: "user", content: data.message },
    ];
    const raw = await callGateway({ model: CHAT_MODEL, messages });

    if (!localised) {
      const reply = raw || "I'm not sure how to answer that right now.";
      return { reply, audioText: reply, spokenLanguage: "en" as const };
    }

    const parsed = extractJson<{ reply?: string; english?: string }>(raw, { reply: raw });
    const reply = parsed.reply || raw || "I'm not sure how to answer that right now.";
    return { reply, audioText: parsed.english || reply, spokenLanguage: "en" as const };
  });


export const analyzeVoiceNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        audioBase64: z.string().min(10),
        format: z.enum(["webm", "m4a", "mp4", "wav", "mp3", "ogg"]).default("webm"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const format = data.format === "mp4" ? "m4a" : data.format;
    const raw = await callGateway({
      model: CHAT_MODEL,
      messages: [
        {
          role: "system",
          content: `${WELLNESS_SYSTEM_PROMPT}
You receive a spoken health check-in. Respond ONLY with JSON of the shape:
{"transcription":"verbatim transcript","summary":"one sentence","symptoms":[{"name":"","severity":1}],"mood":"","energy_level":1,"sleep_hours":0,"topics":[""],"response":"empathetic reply with general wellness suggestions"}
severity and energy_level are 1-10 integers. Use null for anything not mentioned.`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Transcribe this health check-in and extract structured data." },
            { type: "input_audio", input_audio: { data: data.audioBase64, format } },
          ],
        },
      ],
    });

    const parsed = extractJson<{
      transcription?: string;
      summary?: string;
      response?: string;
      [key: string]: string | number | boolean | null | undefined | object;
    }>(raw, { transcription: raw, response: "" });

    const { transcription, response, ...extracted } = parsed;
    return {
      transcription: transcription ?? "",
      aiResponse: response ?? "",
      extracted: JSON.parse(JSON.stringify(extracted)) as Record<string, string | number | boolean | null>,
    };
  });

export const generateInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        context: z.string().min(1).max(8000),
        focus: z.string().max(200).default("overall wellbeing"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const raw = await callGateway({
      model: CHAT_MODEL,
      messages: [
        {
          role: "system",
          content: `${WELLNESS_SYSTEM_PROMPT}
Respond ONLY with JSON: {"insights":[{"title":"","content":"","category":"","severity":"info|watch|urgent"}]}
Return 2-3 short, actionable, non-diagnostic insights.`,
        },
        {
          role: "user",
          content: `Focus: ${data.focus}\n\nRecent user data:\n${data.context}`,
        },
      ],
    });

    const parsed = extractJson<{
      insights?: Array<{ title: string; content: string; category?: string; severity?: string }>;
    }>(raw, { insights: [] });
    return { insights: parsed.insights ?? [] };
  });
