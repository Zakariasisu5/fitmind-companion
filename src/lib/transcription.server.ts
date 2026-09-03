/**
 * Unified Transcription Service for MindTalk AI
 *
 * Routes audio transcription to the appropriate provider:
 * - Default: Lovable AI Gateway speech-to-text (works in serverless runtimes)
 * - Twi/Dagbani: Khaya ASR when configured, with gateway fallback
 */

import { transcribeAudio as khayaTranscribe, type AppLangCode } from "./khaya.server";

export type TranscriptionLanguage = "en" | "tw" | "ak" | "fat" | "dag" | "dga" | "gur" | "kus" | "ksm" | "ee" | "ga" | "gon" | "kpo" | "nic";

export interface TranscriptionResult {
  text: string;
  language: TranscriptionLanguage;
  confidence?: number | undefined;
  verified: boolean;
  provider: "gateway" | "ghananlp" | "mock";
  warning?: string | undefined;
}

const MIME_BY_FORMAT: Record<string, string> = {
  webm: "audio/webm",
  m4a: "audio/mp4",
  mp4: "audio/mp4",
  wav: "audio/wav",
  mp3: "audio/mpeg",
  ogg: "audio/ogg",
};

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Transcribe with the Lovable AI Gateway (OpenAI-compatible /audio/transcriptions).
 * No ffmpeg / native deps, so it works on Vercel and other serverless runtimes.
 */
async function gatewayTranscribe(
  audioBase64: string,
  format: string,
  language: TranscriptionLanguage,
): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    throw new Error(
      "Speech-to-text is not configured. Add LOVABLE_API_KEY to your environment and redeploy.",
    );
  }

  const bytes = base64ToBytes(audioBase64);
  if (bytes.byteLength < 1024) {
    throw new Error("That recording was too short or empty — please try again.");
  }
  if (bytes.byteLength > 24 * 1024 * 1024) {
    throw new Error("That recording is too long. Please keep voice logs under a few minutes.");
  }

  const ext = format in MIME_BY_FORMAT ? format : "webm";
  const form = new FormData();
  form.append("model", "openai/gpt-4o-transcribe");
  form.append("file", new Blob([bytes as unknown as BlobPart], { type: MIME_BY_FORMAT[ext]! }), `recording.${ext}`);
  if (language === "en") form.append("language", "en");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(`[Transcription] Gateway error ${response.status}: ${detail.slice(0, 500)}`);
    if (response.status === 429) throw new Error("Too many requests right now — please try again in a moment.");
    if (response.status === 402) throw new Error("AI credits are exhausted. Please top up to keep using voice logs.");
    throw new Error(`Transcription service error (${response.status}). Please try again.`);
  }

  const json = (await response.json()) as { text?: string };
  const text = (json.text ?? "").trim();
  if (!text) throw new Error("We couldn't hear anything in that recording — please try again.");
  return text;
}

/**
 * Transcribe audio using the appropriate provider based on language
 */
export async function transcribeAudio(
  audioBase64: string,
  language: TranscriptionLanguage,
  format: string = "webm",
): Promise<TranscriptionResult> {
  console.log(`[Transcription] Starting transcription for language: ${language}, format: ${format}`);

  // Local languages: prefer Khaya when it is configured.
  if (language !== "en") {
    const khayaKey = process.env["KHAYA_API_KEY"];
    if (khayaKey && khayaKey !== "your-khaya-api-key-here") {
      try {
        const bytes = base64ToBytes(audioBase64);
        const khayaFormat: "wav" | "mp3" | "ogg" = format === "wav" ? "wav" : format === "ogg" ? "ogg" : "mp3";
        const result = await khayaTranscribe(Buffer.from(bytes), khayaFormat, language as AppLangCode);
        const verified = (result.confidence ?? 0) > 0.7;
        return {
          text: result.text,
          language,
          confidence: result.confidence,
          verified,
          provider: "ghananlp",
          ...(verified ? {} : { warning: "Low confidence transcription — please review and edit if needed." }),
        };
      } catch (error) {
        console.warn("[Transcription] Khaya failed, falling back to gateway:", error);
      }
    }
  }

  const text = await gatewayTranscribe(audioBase64, format, language);
  return {
    text,
    language,
    verified: true,
    provider: "gateway",
    ...(language === "en"
      ? {}
      : { warning: "Transcribed with the general speech model — please review the text for accuracy." }),
  };
}

/**
 * Convert audio format to a standardized format for transcription
 */
export function normalizeAudioFormat(format: string): string {
  const formatMap: Record<string, string> = {
    mp4: "m4a",
    webm: "webm",
    m4a: "m4a",
    wav: "wav",
    mp3: "mp3",
    ogg: "ogg",
  };

  return formatMap[format.toLowerCase()] || "webm";
}
