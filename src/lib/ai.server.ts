import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import {
  CHAT_SYSTEM_PROMPT,
  INSIGHTS_SYSTEM_PROMPT,
  VOICE_EXTRACTION_SYSTEM_PROMPT,
  AI_CONFIG,
  containsEmergencyKeywords,
  EMERGENCY_RESPONSE,
} from "./ai.config";

export type AIMessage = {
  role: "user" | "model";
  parts: string;
};

export class AiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let genAI: GoogleGenerativeAI | null = null;

/**
 * Initialize the Gemini client
 * Only initializes once per server instance
 */
function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) {
      throw new AiError(401, "AI is not configured for this app. Please add GEMINI_API_KEY to your environment.");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Get a Gemini model instance with specified configuration
 */
function getModel(
  modelName: string = AI_CONFIG.defaultModel,
  systemInstruction?: string
): GenerativeModel {
  const client = getGeminiClient();
  return client.getGenerativeModel({
    model: modelName,
    safetySettings: AI_CONFIG.safetySettings,
    systemInstruction,
  });
}

/**
 * Cache for recent AI responses to avoid redundant API calls
 * Key format: "cacheKey:dataHash"
 */
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Simple hash function for cache keys
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Get cached response if available and fresh
 */
function getCachedResponse(cacheKey: string): string | null {
  const cached = responseCache.get(cacheKey);
  if (!cached) return null;
  
  const age = Date.now() - cached.timestamp;
  if (age > CACHE_TTL) {
    responseCache.delete(cacheKey);
    return null;
  }
  
  return cached.response;
}

/**
 * Store response in cache
 */
function cacheResponse(cacheKey: string, response: string): void {
  responseCache.set(cacheKey, { response, timestamp: Date.now() });
  
  // Clean up old entries if cache gets too large
  if (responseCache.size > 100) {
    const now = Date.now();
    for (const [key, value] of responseCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        responseCache.delete(key);
      }
    }
  }
}

/**
 * Chat with Gemini AI
 * Includes conversation history and emergency keyword detection
 */
export async function chatWithAI(
  message: string,
  conversationHistory: AIMessage[] = [],
  context?: { symptoms?: unknown[]; mood?: unknown[]; recentLogs?: unknown[] }
): Promise<string> {
  // Check for emergency keywords first
  if (containsEmergencyKeywords(message)) {
    return EMERGENCY_RESPONSE;
  }

  try {
    const model = getModel(AI_CONFIG.defaultModel, CHAT_SYSTEM_PROMPT);

    // Build context string if health data provided
    let contextString = "";
    if (context) {
      const parts: string[] = [];
      if (context.symptoms && Array.isArray(context.symptoms) && context.symptoms.length > 0) {
        parts.push(`Recent symptoms: ${context.symptoms.length} entries tracked`);
      }
      if (context.mood && Array.isArray(context.mood) && context.mood.length > 0) {
        parts.push(`Recent mood: ${context.mood.length} entries logged`);
      }
      if (context.recentLogs && Array.isArray(context.recentLogs) && context.recentLogs.length > 0) {
        parts.push(`Recent voice logs: ${context.recentLogs.length} entries`);
      }
      if (parts.length > 0) {
        contextString = `\n\nUser's recent health data context: ${parts.join(", ")}`;
      }
    }

    const userMessage = message + contextString;

    // Start chat with history
    const chat = model.startChat({
      history: conversationHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts }],
      })),
      generationConfig: {
        temperature: AI_CONFIG.temperature.chat,
        maxOutputTokens: AI_CONFIG.maxTokens.chat,
      },
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();

    if (!response) {
      throw new AiError(500, "AI returned an empty response");
    }

    return response;
  } catch (error) {
    console.error("Gemini chat error:", error);
    
    if (error instanceof AiError) {
      throw error;
    }

    // Handle specific Gemini errors
    if (error && typeof error === "object" && "status" in error) {
      const status = (error as { status?: number }).status;
      if (status === 429) {
        throw new AiError(429, "MindTalk AI is experiencing high demand. Please try again in a moment.");
      }
      if (status === 403) {
        throw new AiError(403, "AI service access denied. Please check your API configuration.");
      }
    }

    throw new AiError(500, "MindTalk AI is having trouble responding right now. Please try again shortly.");
  }
}

/**
 * Generate health insights from structured data
 * Analyzes patterns and provides actionable suggestions
 */
export async function generateHealthInsights(data: {
  symptoms?: unknown[];
  mood?: unknown[];
  nutrition?: unknown[];
  voiceLogs?: unknown[];
  userId: string;
  timeWindow?: string;
}): Promise<Array<{ title: string; content: string; category: string; priority: "info" | "suggestion" | "follow_up" }>> {
  // Create cache key from data
  const dataStr = JSON.stringify({ ...data, userId: hashString(data.userId) });
  const cacheKey = `insights:${hashString(dataStr)}`;

  // Check cache first
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as Array<{ title: string; content: string; category: string; priority: "info" | "suggestion" | "follow_up" }>;
    } catch {
      // Invalid cache, continue to generate
    }
  }

  try {
    const model = getModel(AI_CONFIG.defaultModel, INSIGHTS_SYSTEM_PROMPT);

    // Build data summary
    const summary = {
      symptoms: data.symptoms?.length ?? 0,
      mood: data.mood?.length ?? 0,
      nutrition: data.nutrition?.length ?? 0,
      voiceLogs: data.voiceLogs?.length ?? 0,
      timeWindow: data.timeWindow ?? "recent",
    };

    const prompt = `Analyze this health tracking data and generate 2-4 insights:

Data Summary:
- Symptoms tracked: ${summary.symptoms}
- Mood entries: ${summary.mood}
- Nutrition entries: ${summary.nutrition}
- Voice logs: ${summary.voiceLogs}
- Time period: ${summary.timeWindow}

Data Details:
${JSON.stringify({ symptoms: data.symptoms, mood: data.mood, nutrition: data.nutrition }, null, 2)}

Generate insights as a JSON array with this structure:
[
  {
    "title": "Brief insight title",
    "content": "2-3 sentence explanation with actionable suggestion",
    "category": "symptoms" | "mood" | "nutrition" | "general",
    "priority": "info" | "suggestion" | "follow_up"
  }
]

Focus on patterns, connections between data points, and gentle suggestions. Use "follow_up" priority if something warrants professional consultation.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: AI_CONFIG.temperature.insights,
        maxOutputTokens: AI_CONFIG.maxTokens.insights,
      },
    });

    const response = result.response.text();
    const insights = extractJson<Array<{ title: string; content: string; category: string; priority: "info" | "suggestion" | "follow_up" }>>(
      response,
      []
    );

    // Cache the result
    if (insights.length > 0) {
      cacheResponse(cacheKey, JSON.stringify(insights));
    }

    return insights;
  } catch (error) {
    console.error("Gemini insights generation error:", error);
    throw new AiError(500, "Unable to generate health insights right now. Please try again later.");
  }
}

/**
 * Extract structured data from voice log transcript
 * Returns JSON with symptoms, mood, concerns, etc.
 */
export async function extractVoiceLogData(
  transcript: string
): Promise<{
  symptoms: Array<{ name: string; severity?: number; notes?: string }>;
  mood: { score?: number; description?: string } | null;
  concerns: string[];
  triggers: string[];
  key_phrases: string[];
}> {
  const defaultResponse = {
    symptoms: [],
    mood: null,
    concerns: [],
    triggers: [],
    key_phrases: [],
  };

  if (!transcript || transcript.trim().length === 0) {
    return defaultResponse;
  }

  try {
    const model = getModel(AI_CONFIG.defaultModel, VOICE_EXTRACTION_SYSTEM_PROMPT);

    const prompt = `Extract structured health information from this voice log transcript:

"${transcript}"

Return ONLY valid JSON (no other text):
{
  "symptoms": [{"name": "symptom name", "severity": 1-10, "notes": "context"}],
  "mood": {"score": 1-10, "description": "mood description"},
  "concerns": ["concern 1"],
  "triggers": ["trigger 1"],
  "key_phrases": ["important phrase 1"]
}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: AI_CONFIG.temperature.extraction,
        maxOutputTokens: AI_CONFIG.maxTokens.extraction,
        responseMimeType: "application/json",
      },
    });

    const response = result.response.text();
    const extracted = extractJson(response, defaultResponse);

    return extracted;
  } catch (error) {
    console.error("Voice log extraction error:", error);
    
    // Retry once with more explicit instructions
    try {
      const model = getModel(AI_CONFIG.defaultModel, VOICE_EXTRACTION_SYSTEM_PROMPT);
      const result = await model.generateContent({
        contents: [{ 
          role: "user", 
          parts: [{ text: `Extract data from: "${transcript}"\n\nReturn only JSON, no explanation.` }] 
        }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: AI_CONFIG.maxTokens.extraction,
        },
      });

      const response = result.response.text();
      return extractJson(response, defaultResponse);
    } catch (retryError) {
      console.error("Voice log extraction retry failed:", retryError);
      // Return default structure rather than failing
      return defaultResponse;
    }
  }
}

/**
 * Extract JSON from AI response text
 * Handles markdown code blocks and text around JSON
 */
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

/**
 * Legacy function for backward compatibility
 * Redirects to chatWithAI
 */
export async function callGateway(body: Record<string, unknown>): Promise<string> {
  const messages = body.messages as Array<{ role: string; content: string }> | undefined;
  if (!messages || messages.length === 0) {
    throw new AiError(400, "No messages provided");
  }

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    throw new AiError(400, "Last message must be from user");
  }

  const history: AIMessage[] = messages.slice(0, -1).map(msg => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: msg.content,
  }));

  return chatWithAI(lastMessage.content, history);
}

// Re-export for backward compatibility
export { CHAT_SYSTEM_PROMPT as WELLNESS_SYSTEM_PROMPT };
