## GhanaNLP Integration for MindTalk AI

## Overview

MindTalk AI now supports Twi and Dagbani languages through GhanaNLP's translation, speech-to-text (ASR), and text-to-speech (TTS) APIs. This provides a fully local-language experience for Ghanaian users while maintaining health-safety accuracy by reasoning in English.

## Architecture Flow

### Voice Log Journey (Twi/Dagbani)

1. **User speaks** in Twi or Dagbani
2. **GhanaNLP ASR** transcribes audio → Twi/Dagbani text
3. **GhanaNLP Translation** translates → English text
4. **Gemini AI** reasons about health data in English (best accuracy)
5. **GhanaNLP Translation** translates AI response → Twi/Dagbani text
6. **GhanaNLP TTS** generates audio → Twi/Dagbani speech
7. **User hears and reads** response in their language

### Chat Journey (Twi/Dagbani)

1. **User types** message in Twi or Dagbani
2. **GhanaNLP Translation** translates → English
3. **Gemini AI** generates response in English
4. **GhanaNLP Translation** translates → Twi/Dagbani
5. **GhanaNLP TTS** (optional) speaks response
6. **User sees** translated text with "translated" indicator

## Setup

### 1. Get GhanaNLP API Key

1. Visit [translation.ghananlp.org](https://translation.ghananlp.org)
2. Sign up for an account
3. Generate an API key
4. Copy the key

### 2. Add API Key to Environment

Add to your `.env` file:

```env
GHANANLP_API_KEY=your-ghananlp-api-key-here
```

**Important:** Never commit this key to version control.

### 3. Deploy Environment Variable

For production, add `GHANANLP_API_KEY` to your hosting platform:

- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Build & Deploy → Environment
- **Cloudflare**: Settings → Environment Variables

### 4. Restart Server

```bash
npm run dev
```

## API Endpoints

### Speech-to-Text (ASR)

**Function:** `transcribeAudio(audioBase64, language, format)`

**Supported Languages:**
- `tw` - Twi (Akan)
- `dag` - Dagbani

**Returns:**
```typescript
{
  text: string;              // Transcribed text
  confidence: number;        // 0-1 confidence score
  language: string;          // Language code
  verified: boolean;         // True if confidence >= 0.7
}
```

**Low Confidence Handling:**
- If confidence < 0.7, `verified = false`
- UI shows warning: "Low confidence transcription - please review"
- User can manually edit transcription before saving

### Text-to-Speech (TTS)

**Function:** `synthesizeSpeech(text, language)` or `getCachedOrGenerateTTS(text, language)`

**Supported Languages:**
- `tw` - Twi
- `dag` - Dagbani

**Returns:**
```typescript
{
  audio: string;    // Base64-encoded MP3
  format: string;   // "mp3"
  cached: boolean;  // True if from cache
}
```

**Caching:**
- Audio cached for 24 hours per text+language
- Replays don't re-call API
- Cache size limited to 200 entries
- Saves API costs and improves speed

### Translation

**Function:** `translateText(text, fromLang, toLang)`

**Supported Languages:**
- `en` - English
- `tw` - Twi
- `dag` - Dagbani

**Returns:**
```typescript
{
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
}
```

## Usage Examples

### Voice Log with Transcription

```typescript
import { analyzeVoiceNote } from "@/lib/ai.functions";

// Record audio in Twi
const audioData = "base64-encoded-audio";

const result = await analyzeVoiceNote({
  audioBase64: audioData,
  format: "webm",
  language: "tw"  // Twi
});

console.log(result.transcription);        // Twi text
console.log(result.aiResponse);           // Twi translation of AI response
console.log(result.transcriptionVerified); // true/false
console.log(result.transcriptionWarning);  // Warning if low confidence
```

### Chat with Translation

```typescript
import { askHealthCoach } from "@/lib/ai.functions";

const response = await askHealthCoach({
  message: "Me nka mu sɛ me ti yɛ me yaw", // "I have a headache" in Twi
  language: "tw",
  history: []
});

console.log(response.reply);        // Twi translation of AI response
console.log(response.translated);   // true
console.log(response.audioText);    // English (for fallback TTS)
```

### Generate Speech

```typescript
import { generateSpeech } from "@/lib/ai.functions";

const audio = await generateSpeech({
  text: "Mehia mmoa",  // "I need help" in Twi
  language: "tw"
});

if (audio.audio) {
  // Play cached or generated Twi audio
  const audioBlob = base64ToBlob(audio.audio, "audio/mp3");
  const url = URL.createObjectURL(audioBlob);
  new Audio(url).play();
} else if (audio.useBrowserTTS) {
  // Fallback to browser TTS
  const utterance = new SpeechSynthesisUtterance(audio.text);
  speechSynthesis.speak(utterance);
}
```

## Error Handling & Fallbacks

### GhanaNLP Service Unavailable

All GhanaNLP calls have automatic fallbacks:

**ASR Failure:**
```
[Transcription failed for tw - GhanaNLP unavailable]
User can manually type their message
```

**TTS Failure:**
```
"Audio in English — Twi voice unavailable for this response"
Falls back to browser TTS with English
```

**Translation Failure:**
```
Shows original English response
Displays warning: "Translation unavailable"
```

### Confidence Thresholds

**High Confidence (≥ 0.7):**
- Transcription marked as verified
- Saved automatically
- No user review needed

**Low Confidence (< 0.7):**
- Shows warning badge
- User prompted to review/edit
- Can approve or correct before saving

### Timeout Handling

- **ASR**: 45 second timeout
- **TTS**: 60 second timeout
- **Translation**: 30 second timeout

If timeout occurs, falls back gracefully with error message.

## UI/UX Indicators

### Translated Content Tag

When content is translated, show a small indicator:

```tsx
{response.translated && (
  <span className="text-xs text-muted-foreground">
    🌐 Translated
  </span>
)}
```

### Language Selection

Let users select their language for voice logs:

```tsx
<select value={language} onChange={(e) => setLanguage(e.target.value)}>
  <option value="en">English</option>
  <option value="tw">Twi</option>
  <option value="dag">Dagbani</option>
</select>
```

### Low Confidence Warning

```tsx
{!transcriptionVerified && (
  <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
    ⚠️ Low confidence transcription - please review and edit if needed
  </div>
)}
```

### Audio Loading State

```tsx
{isSpeaking ? (
  <Loader2 className="size-4 animate-spin" />
) : (
  <Volume2 className="size-4" />
)}
```

## Cost Considerations

### GhanaNLP Pricing

Check [translation.ghananlp.org](https://translation.ghananlp.org) for current pricing.

**Estimated Usage (typical user):**
- 10 voice logs/week = 40 ASR calls/month
- 10 chat messages/week = 40 translations/month
- TTS plays (cached) = 40 initial + replays free
- **Total**: ~120 API calls/month per active user

### Cost Optimization

1. **TTS Caching** - Saves ~60-70% of TTS API calls
2. **Translation Caching** - Can cache common phrases
3. **Batch Processing** - Process multiple translations together
4. **Fallback Early** - Use browser TTS for English

## Monitoring & Logs

### Server Logs

Track GhanaNLP API performance:

```bash
# Look for these log messages
grep "\[GhanaNLP\]" logs.txt
grep "\[Voice\]" logs.txt
grep "\[Chat\]" logs.txt
grep "\[TTS\]" logs.txt
```

**Key Metrics:**
- ASR success rate (target >90%)
- ASR confidence scores (target >0.7)
- TTS cache hit rate (target >60%)
- Translation accuracy (manual review)
- API latency (target <5s for ASR, <3s for TTS)

### Error Rate Monitoring

```javascript
// Track GhanaNLP reliability
const metrics = {
  asrSuccess: 0,
  asrFailed: 0,
  ttsSuccess: 0,
  ttsFailed: 0,
  translationSuccess: 0,
  translationFailed: 0
};

// Log after each call
console.log(`[Metrics] ASR success rate: ${(metrics.asrSuccess / (metrics.asrSuccess + metrics.asrFailed) * 100).toFixed(1)}%`);
```

## Testing

### Test ASR (Twi)

```bash
# Record a short Twi audio clip
# Convert to base64

curl -X POST http://localhost:3000/api/analyze-voice \
  -H "Content-Type: application/json" \
  -d '{
    "audioBase64": "your-base64-audio",
    "language": "tw",
    "format": "webm"
  }'
```

### Test Translation

```typescript
import { translateText } from "@/lib/ghananlp.server";

const result = await translateText(
  "I have a headache",
  "en",
  "tw"
);
console.log(result.translatedText); // Should be Twi
```

### Test TTS

```typescript
import { generateSpeech } from "@/lib/ai.functions";

const audio = await generateSpeech({
  text: "Akwaaba",  // "Welcome" in Twi
  language: "tw"
});

// Should return audio or fallback
console.log(audio);
```

## Troubleshooting

### "GhanaNLP API key not configured"

**Cause:** `GHANANLP_API_KEY` not set or placeholder value

**Solution:**
1. Check `.env` file has real key
2. Restart dev server
3. Verify key at translation.ghananlp.org

### ASR Returns Low Confidence

**Causes:**
- Background noise
- Poor audio quality
- Mixed languages
- Unclear speech

**Solutions:**
- Guide users to speak clearly
- Reduce background noise
- Provide manual edit option
- Show confidence score

### TTS Fails for Specific Phrases

**Causes:**
- Text too long (>5000 chars)
- Special characters
- GhanaNLP service issue

**Solutions:**
- Truncate long text
- Sanitize special chars
- Fall back to English TTS
- Show warning to user

### Translation Seems Inaccurate

**Causes:**
- GhanaNLP model limitations
- Context-dependent phrases
- Medical terminology
- Idiomatic expressions

**Solutions:**
- Add "Translated" indicator
- Allow user feedback
- Build glossary of common terms
- Consider human review for critical content

## Security & Privacy

### API Key Protection

- ✅ Stored server-side only
- ✅ Never exposed to frontend
- ✅ Not committed to git
- ✅ Rotated periodically

### Data Handling

- Audio transcriptions stored locally (Supabase)
- No audio sent to GhanaNLP after transcription
- Translations not stored (regenerated on demand)
- TTS audio cached locally only

### HIPAA/Privacy Considerations

- GhanaNLP processes health-related text
- Review GhanaNLP's privacy policy
- Consider on-premise deployment for sensitive data
- Add consent for translation services

## Roadmap & Future Enhancements

### Phase 1 (Current)
- ✅ Basic ASR for Twi/Dagbani
- ✅ Translation pipeline
- ✅ TTS with caching
- ✅ Fallback handling

### Phase 2 (Planned)
- [ ] Custom medical terminology glossary
- [ ] Improved confidence scoring
- [ ] Batch translation optimization
- [ ] User feedback loop

### Phase 3 (Future)
- [ ] More Ghanaian languages (Ga, Ewe, etc.)
- [ ] Voice cloning for personalized TTS
- [ ] Offline mode with downloaded models
- [ ] Real-time translation streaming

## Support

### GhanaNLP Support

- Email: support@ghananlp.org
- Documentation: https://translation.ghananlp.org/docs
- GitHub: (check if available)

### MindTalk AI Support

For integration issues:
1. Check server logs
2. Verify API key is valid
3. Test with simple phrases first
4. Review error messages
5. Check GhanaNLP service status

## Compliance & Attribution

- Credit GhanaNLP in your app's about/credits page
- Follow GhanaNLP's terms of service
- Display appropriate language labels
- Be transparent about translation quality

---

**Note:** GhanaNLP is a smaller, research-driven API. Build robust fallbacks from day one. Monitor reliability and adjust user expectations accordingly.
