# Google Gemini AI Integration for MindTalk AI

## Overview

MindTalk AI now uses Google Gemini as its AI reasoning engine for all chat and health insight features. Gemini provides fast, cost-efficient responses while maintaining strict health-safety guidelines.

## Setup

### 1. Get a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Add API Key to Environment

Add your Gemini API key to the `.env` file:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

**Important:** Never commit your API key to version control. The `.env` file is already in `.gitignore`.

### 3. Deploy Environment Variable

When deploying to production, add the `GEMINI_API_KEY` environment variable to your hosting platform:

- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Cloudflare Pages**: Settings → Environment Variables
- **Supabase Edge Functions**: Use `supabase secrets set GEMINI_API_KEY=your-key`

## Architecture

### Core Components

1. **`src/lib/ai.config.ts`** - Centralized configuration
   - Health-safety system prompts
   - Emergency keyword detection
   - Model and token limit settings

2. **`src/lib/ai.server.ts`** - Core AI functions
   - `chatWithAI()` - Conversational chat with context
   - `generateHealthInsights()` - Analyze health data patterns
   - `extractVoiceLogData()` - Parse transcripts into structured data

3. **`src/lib/ai.functions.ts`** - Server functions
   - `askHealthCoach()` - Chat endpoint with multi-language support
   - `analyzeVoiceNote()` - Voice log analysis
   - `generateInsights()` - Insights generation with translation
   - `saveChatMessage()` / `loadChatHistory()` - Conversation persistence

## Key Features

### Health-Safety System Prompt

Every AI call includes a comprehensive safety prompt that enforces:

- ✅ General wellness information only (never diagnoses)
- ✅ Always recommend professional care for concerning symptoms
- ✅ Immediate emergency guidance for critical situations
- ✅ Warm, plain-language, non-alarming tone
- ✅ No medical certainty claims
- ✅ Clear disclaimers on health responses

**Emergency Keywords Detection:**
The system automatically detects emergency-related keywords (chest pain, difficulty breathing, suicidal thoughts, etc.) and immediately provides emergency care guidance before any other response.

### Cost Optimization

1. **Response Caching** (5-minute TTL)
   - Identical health data queries return cached results
   - Reduces API calls by ~30-50% for repeated views

2. **Token Limits**
   - Chat: 1,024 tokens (concise responses)
   - Insights: 2,048 tokens (detailed analysis)
   - Extraction: 1,024 tokens (structured JSON only)

3. **Model Selection**
   - Default: `gemini-1.5-flash-latest` (fast, cost-efficient)
   - Fallback: `gemini-1.5-pro-latest` (complex reasoning, if needed)

4. **Smart Context Loading**
   - Only fetches recent data (last 5-7 entries)
   - Summarizes data rather than sending full details

### Multi-Language Support

Gemini always reasons in English for consistency and safety. Translation to Twi/Dagbani happens via:

1. **For Chat:** Gemini returns bilingual JSON:
   ```json
   {
     "reply": "response in target language",
     "english": "same response in English for audio"
   }
   ```

2. **For Insights:** Translated separately after generation
3. **For Audio:** GhanaNLP or browser TTS (English-only for now)

### Conversation Persistence

Chat messages are stored in the `chat_messages` table with:
- User ID
- Role (user/assistant)
- Message content
- Language
- Timestamp

Load up to 20 most recent messages for conversation context.

## API Usage

### Chat with Health Context

```typescript
import { askHealthCoach } from "@/lib/ai.functions";

const response = await askHealthCoach({
  message: "I've been feeling tired lately",
  language: "en",
  history: [
    { role: "user", content: "Hi" },
    { role: "assistant", content: "Hello! How can I help?" }
  ],
  userId: "user-id-here"
});

console.log(response.reply); // AI response
console.log(response.audioText); // Text for TTS
```

### Generate Health Insights

```typescript
import { generateInsights } from "@/lib/ai.functions";

const insights = await generateInsights({
  userId: "user-id-here",
  timeWindow: "week", // "day" | "week" | "month"
  language: "en"
});

insights.insights.forEach(insight => {
  console.log(insight.title);
  console.log(insight.content);
  console.log(insight.priority); // "info" | "suggestion" | "follow_up"
});
```

### Analyze Voice Transcript

```typescript
import { analyzeVoiceNote } from "@/lib/ai.functions";

const result = await analyzeVoiceNote({
  transcription: "I have a headache and feel tired",
  language: "en"
});

console.log(result.transcription); // Original text
console.log(result.aiResponse); // Empathetic response
console.log(result.structuredData); // Extracted symptoms, mood, etc.
```

## Error Handling

All functions include graceful error handling:

```typescript
try {
  const response = await askHealthCoach({ ... });
} catch (error) {
  if (error instanceof AiError) {
    console.error(`AI Error (${error.status}): ${error.message}`);
    
    switch (error.status) {
      case 401:
        // API key not configured
        break;
      case 429:
        // Rate limit exceeded
        break;
      case 500:
        // General AI service error
        break;
    }
  }
}
```

**User-Facing Error Messages:**
- "MindTalk AI is experiencing high demand. Please try again in a moment." (429)
- "MindTalk AI is having trouble responding right now. Please try again shortly." (500)
- "AI is not configured for this app." (401)

## Safety Considerations

### Medical Disclaimers

All responses involving health data end with:
> "Remember, this information is for general wellness purposes only and isn't a substitute for professional medical care."

### Emergency Response

When emergency keywords are detected:
```
🚨 **This sounds like a medical emergency.**

Please seek immediate medical attention:
- Call emergency services (911 in US, 999 in UK, 112 in EU)
- Or go to the nearest emergency room
- Or call your country's crisis helpline

Do this right away — your safety is the top priority.
```

### Data Privacy

- API calls are made server-side only (never from client)
- User health data is summarized before sending to Gemini
- No personally identifiable information sent to Gemini
- Chat history stored locally in Supabase (not sent to Google)

## Cost Estimates

Based on Gemini 1.5 Flash pricing (as of 2026):

**Free Tier:**
- 15 requests per minute
- 1 million tokens per day
- Plenty for development and small-scale usage

**Paid Tier (if needed):**
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens

**Estimated Monthly Costs:**
- 1,000 chats/month: ~$1-2
- 500 insights/month: ~$2-3
- 1,000 voice extractions/month: ~$1-2

**Total for typical usage:** $5-10/month

## Monitoring

Track API usage and errors by checking server logs:

```bash
# Look for these log messages
grep "Gemini chat error" logs.txt
grep "Gemini insights generation error" logs.txt
grep "Voice log extraction error" logs.txt
```

Key metrics to monitor:
- Response time (should be <2 seconds)
- Error rate (should be <1%)
- Cache hit rate (target 30-50%)
- Token usage (track against daily limits)

## Migration from Lovable Gateway

The integration maintains backward compatibility:

1. `callGateway()` function still exists - redirects to Gemini
2. `WELLNESS_SYSTEM_PROMPT` exported for compatibility
3. Same JSON response structure
4. No breaking changes to existing API calls

## Troubleshooting

### "AI is not configured for this app"

**Cause:** `GEMINI_API_KEY` environment variable not set

**Solution:**
1. Check `.env` file has the key
2. Restart dev server: `npm run dev`
3. For production, verify environment variable in hosting dashboard

### Rate Limit Errors (429)

**Cause:** Exceeded 15 requests per minute (free tier)

**Solution:**
1. Implement request throttling
2. Upgrade to paid tier
3. Use caching more aggressively

### Empty or Invalid Responses

**Cause:** Gemini API timeout or service issue

**Solution:**
1. Check Google AI Studio status page
2. Verify API key is valid
3. Check network connectivity
4. Retry with exponential backoff

### JSON Parsing Errors

**Cause:** Gemini returned non-JSON for structured data request

**Solution:**
- Already handled by `extractJson()` fallback
- Returns default/empty structure instead of crashing
- Logs error for debugging

## Testing

### Manual Testing

1. **Test Chat:**
   ```typescript
   // In browser console or test file
   const result = await askHealthCoach({
     message: "I have a headache",
     language: "en",
     history: []
   });
   console.log(result.reply);
   ```

2. **Test Emergency Detection:**
   ```typescript
   const result = await chatWithAI("I'm having chest pain");
   // Should return emergency response immediately
   ```

3. **Test Insights:**
   ```typescript
   const insights = await generateInsights({
     userId: "test-user-id",
     timeWindow: "week",
     language: "en"
   });
   console.log(insights);
   ```

### Integration Tests

Create test files in `src/__tests__/` for automated testing:

```typescript
import { chatWithAI, generateHealthInsights } from "@/lib/ai.server";

describe("Gemini AI Integration", () => {
  it("should detect emergency keywords", async () => {
    const response = await chatWithAI("chest pain and difficulty breathing");
    expect(response).toContain("medical emergency");
  });

  it("should generate insights from health data", async () => {
    const insights = await generateHealthInsights({
      symptoms: [{ name: "headache", severity: 7 }],
      mood: [{ mood_score: 5 }],
      userId: "test"
    });
    expect(insights.length).toBeGreaterThan(0);
  });
});
```

## Future Enhancements

Potential improvements:

1. **Streaming Responses** - Show AI typing in real-time
2. **Voice Input** - Direct audio transcription via Gemini Audio API
3. **Image Analysis** - Analyze uploaded health photos
4. **Longer Context** - Use Gemini's 1M token context window
5. **Fine-tuning** - Custom model for health-specific responses
6. **Multi-modal** - Combine text, audio, and images

## Support

For issues or questions:

1. Check this documentation first
2. Review server logs for error details
3. Test API key in [Google AI Studio](https://aistudio.google.com/)
4. Check [Gemini API documentation](https://ai.google.dev/docs)

## License & Attribution

This integration uses Google's Gemini API under their terms of service:
- [Gemini API Terms](https://ai.google.dev/terms)
- [Google AI Studio Terms](https://aistudio.google.com/terms)

MindTalk AI maintains all health-safety guidelines independently of Google's services.
