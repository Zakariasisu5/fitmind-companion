/**
 * Unified Transcription Service for MindTalk AI
 * 
 * Routes audio transcription to the appropriate provider:
 * - English → Whisper API (OpenAI) or fallback
 * - Twi/Dagbani → GhanaNLP ASR
 */

import { transcribeAudio as khayaTranscribe, type AppLangCode } from "./khaya.server";

export type TranscriptionLanguage = "en" | "tw" | "ak" | "fat" | "dag" | "dga" | "gur" | "kus" | "ksm" | "ee" | "ga" | "gon" | "kpo" | "nic";

export interface TranscriptionResult {
  text: string;
  language: TranscriptionLanguage;
  confidence?: number;
  verified: boolean;
  provider: "whisper" | "ghananlp" | "mock";
  warning?: string;
}

/**
 * Transcribe audio using the appropriate provider based on language
 */
export async function transcribeAudio(
  audioBase64: string,
  language: TranscriptionLanguage,
  format: string = "webm"
): Promise<TranscriptionResult> {
  console.log(`[Transcription] Starting transcription for language: ${language}, format: ${format}`);

  // Route to appropriate provider
  if (language === "en") {
    return await transcribeEnglish(audioBase64, format);
  } else {
    return await transcribeLocalLanguage(audioBase64, language as AppLangCode, format);
  }
}

/**
 * Transcribe English audio using Whisper API
 * 
 * TODO: Implement actual Whisper integration
 * For now, returns a mock transcription
 */
async function transcribeEnglish(
  audioBase64: string,
  format: string
): Promise<TranscriptionResult> {
  try {
    // Check if OpenAI API key is configured
    const openaiKey = process.env["OPENAI_API_KEY"];
    
    if (!openaiKey || openaiKey === "your-openai-api-key-here") {
      console.warn("[Transcription] OpenAI API key not configured, using mock transcription");
      return {
        text: "[Mock English transcription - Please set up Whisper API for actual transcription]",
        language: "en",
        verified: false,
        provider: "mock",
        warning: "Whisper API not configured. Add OPENAI_API_KEY to enable English transcription.",
      };
    }

    // TODO: Implement actual Whisper API call
    // For now, return mock data
    console.warn("[Transcription] Whisper integration not yet implemented");
    
    /*
    // Future Whisper implementation:
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: openaiKey });
    
    const audioBuffer = Buffer.from(audioBase64, "base64");
    const file = new File([audioBuffer], `audio.${format}`, {
      type: `audio/${format}`
    });
    
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "en",
      response_format: "verbose_json",
    });
    
    return {
      text: transcription.text,
      language: "en",
      confidence: 0.95,
      verified: true,
      provider: "whisper",
    };
    */

    return {
      text: "[Whisper integration pending - Please see TRANSCRIPTION_SETUP.md]",
      language: "en",
      verified: false,
      provider: "mock",
      warning: "Whisper API integration not yet implemented. See TRANSCRIPTION_SETUP.md for setup instructions.",
    };
  } catch (error) {
    console.error("[Transcription] English transcription error:", error);
    return {
      text: "[Transcription failed - Please try again]",
      language: "en",
      verified: false,
      provider: "mock",
      warning: `Transcription error: ${(error as Error).message}`,
    };
  }
}

/**
 * Transcribe Twi or Dagbani audio using Khaya
 */
async function transcribeLocalLanguage(
  audioBase64: string,
  language: AppLangCode,
  format: string
): Promise<TranscriptionResult> {
  try {
    const result = await khayaTranscribe(audioBase64, language, format);
    
    // Add warning if confidence is low
    let warning: string | undefined;
    if (!result.verified) {
      warning = "Low confidence transcription - please review and edit if needed";
    }

    return {
      text: result.text,
      language: language as TranscriptionLanguage,
      confidence: result.confidence,
      verified: result.verified,
      provider: "khaya",
      warning,
    };
  } catch (error) {
    console.error(`[Transcription] Khaya ${language} transcription error:`, error);
    
    // Return a fallback result rather than throwing
    return {
      text: `[Transcription failed for ${language} - Khaya unavailable]`,
      language: language as TranscriptionLanguage,
      verified: false,
      provider: "khaya",
      warning: `Khaya transcription failed: ${(error as Error).message}. Please try again or switch to English.`,
    };
  }
}

/**
 * Convert audio format to a standardized format for transcription
 * Helps with compatibility across different providers
 */
export function normalizeAudioFormat(format: string): string {
  const formatMap: Record<string, string> = {
    "mp4": "m4a",
    "webm": "webm",
    "m4a": "m4a",
    "wav": "wav",
    "mp3": "mp3",
    "ogg": "ogg",
  };
  
  return formatMap[format.toLowerCase()] || "webm";
}
