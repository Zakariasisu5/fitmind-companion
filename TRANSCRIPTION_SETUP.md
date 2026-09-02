# Audio Transcription Setup

## Current Status

⚠️ **Audio transcription is currently using a placeholder**. Voice recordings are accepted but not actually transcribed. You need to integrate a transcription service to enable this feature.

## Why Separate Transcription?

The Gemini integration focuses on AI reasoning (chat, insights, data extraction). Audio transcription is handled separately because:

1. **Different services are better at transcription** - OpenAI Whisper, GhanaNLP ASR
2. **Language support** - GhanaNLP provides better support for Twi and Dagbani
3. **Cost optimization** - Transcription and reasoning have different pricing models
4. **Modularity** - Easy to switch transcription providers without changing AI logic

## Option 1: OpenAI Whisper API (Recommended for English)

### Setup

1. **Get OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add to `.env`: `OPENAI_API_KEY=sk-...`

2. **Install OpenAI SDK**
   ```bash
   npm install openai
   ```

3. **Create Transcription Function**

Create `src/lib/transcription.server.ts`:

```typescript
import OpenAI from "openai";

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env["OPENAI_API_KEY"];
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

export async function transcribeAudio(
  audioBase64: string,
  format: "webm" | "m4a" | "mp4" | "wav" | "mp3" | "ogg"
): Promise<{ text: string; language?: string }> {
  const client = getOpenAIClient();
  
  // Convert base64 to buffer
  const audioBuffer = Buffer.from(audioBase64, "base64");
  
  // Create File object for Whisper API
  const file = new File([audioBuffer], `audio.${format}`, {
    type: `audio/${format}`
  });
  
  // Transcribe using Whisper
  const transcription = await client.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: "en", // or auto-detect
    response_format: "verbose_json", // includes language detection
  });
  
  return {
    text: transcription.text,
    language: transcription.language,
  };
}
```

4. **Update ai.functions.ts**

```typescript
import { transcribeAudio } from "@/lib/transcription.server";

// In analyzeVoiceNote handler:
if (data.audioBase64 && !data.transcription) {
  const result = await transcribeAudio(data.audioBase64, data.format || "webm");
  transcription = result.text;
}
```

### Cost

- **$0.006 per minute** of audio
- Example: 1,000 x 30-second recordings = $3/month

---

## Option 2: GhanaNLP ASR (Recommended for Twi/Dagbani)

### Setup

1. **Get GhanaNLP API Access**
   - Contact [GhanaNLP](https://ghananlp.org/) for API access
   - Add API key to `.env`: `GHANANLP_API_KEY=...`

2. **Create GhanaNLP Client**

Create `src/lib/ghananlp.server.ts`:

```typescript
export async function transcribeWithGhanaNLP(
  audioBase64: string,
  language: "en" | "tw" | "dag"
): Promise<{ text: string; confidence?: number }> {
  const apiKey = process.env["GHANANLP_API_KEY"];
  if (!apiKey) {
    throw new Error("GHANANLP_API_KEY not configured");
  }
  
  // Convert language code to GhanaNLP format
  const langMap = { en: "english", tw: "twi", dag: "dagbani" };
  
  const response = await fetch("https://api.ghananlp.org/asr", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audio: audioBase64,
      language: langMap[language],
    }),
  });
  
  if (!response.ok) {
    throw new Error(`GhanaNLP ASR failed: ${response.statusText}`);
  }
  
  const result = await response.json();
  return {
    text: result.transcription,
    confidence: result.confidence,
  };
}
```

3. **Update ai.functions.ts for Multi-Language**

```typescript
import { transcribeWithGhanaNLP } from "@/lib/ghananlp.server";
import { transcribeAudio } from "@/lib/transcription.server";

// In analyzeVoiceNote handler:
if (data.audioBase64 && !data.transcription) {
  if (data.language === "en") {
    // Use Whisper for English
    const result = await transcribeAudio(data.audioBase64, data.format || "webm");
    transcription = result.text;
  } else {
    // Use GhanaNLP for Twi/Dagbani
    const result = await transcribeWithGhanaNLP(data.audioBase64, data.language);
    transcription = result.text;
  }
}
```

---

## Option 3: Browser-Based Web Speech API (Free, Limited)

For quick testing without API costs:

### Update voice.tsx

```typescript
// Add state for browser transcription
const [browserTranscript, setBrowserTranscript] = useState("");

// Initialize Speech Recognition
const recognition = useRef<any>(null);

useEffect(() => {
  if ('webkitSpeechRecognition' in window) {
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    recognition.current = new SpeechRecognition();
    recognition.current.continuous = true;
    recognition.current.interimResults = true;
    
    recognition.current.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setBrowserTranscript(transcript);
    };
  }
}, []);

// Start recognition when recording starts
const start = async () => {
  // ... existing code ...
  if (recognition.current) {
    recognition.current.start();
  }
};

// Stop and use transcript
const stop = () => {
  recorderRef.current?.stop();
  if (recognition.current) {
    recognition.current.stop();
  }
  if (timerRef.current) clearInterval(timerRef.current);
  setRecording(false);
  
  // If we have a browser transcript, use it
  if (browserTranscript) {
    processBrowserTranscript(browserTranscript);
  }
};

const processBrowserTranscript = async (transcript: string) => {
  const result = await analyze({ 
    data: { 
      transcription: transcript,
      language: "en" 
    } 
  });
  
  const { error } = await supabase.from("voice_logs").insert({
    user_id: user!.id,
    transcription: result.transcription,
    ai_response: result.aiResponse,
    extracted_data: result.extracted as never,
    duration_seconds: seconds,
  });
  
  if (!error) {
    toast.success("Voice log saved");
    qc.invalidateQueries({ queryKey: ["voice_logs"] });
  }
};
```

**Limitations:**
- ❌ Only works in Chrome/Edge
- ❌ English only (limited language support)
- ❌ Requires internet connection
- ❌ Less accurate than Whisper
- ✅ Free
- ✅ No API setup needed

---

## Recommended Approach

For MindTalk AI, we recommend a **hybrid approach**:

1. **English users** → OpenAI Whisper (high quality, $0.006/min)
2. **Twi/Dagbani users** → GhanaNLP ASR (local language support)
3. **Fallback** → Browser Web Speech API (if APIs unavailable)

### Implementation Priority

1. ✅ **Immediate** - Keep placeholder working (current state)
2. 🔄 **Phase 1** - Add Whisper for English (1-2 hours setup)
3. 🔄 **Phase 2** - Add GhanaNLP for local languages (requires API access)
4. 🔄 **Phase 3** - Add browser fallback for offline/demo mode

---

## Testing Transcription

Once you've set up a transcription service:

### Test with Audio File

```typescript
// In browser console or test file
const testAudio = "base64-encoded-audio-here";

const result = await analyzeVoiceNote({
  audioBase64: testAudio,
  format: "webm",
  language: "en"
});

console.log("Transcription:", result.transcription);
console.log("AI Response:", result.aiResponse);
console.log("Extracted Data:", result.structuredData);
```

### Test with Direct Transcription

```typescript
const result = await analyzeVoiceNote({
  transcription: "I have a headache and feel tired today",
  language: "en"
});

console.log("AI Response:", result.aiResponse);
console.log("Symptoms:", result.structuredData.symptoms);
```

---

## Current Workaround

Until transcription is set up, the app will:

1. Accept audio recordings (stored locally)
2. Use placeholder transcription text
3. Still extract data and generate AI responses (when you add your Gemini API key)
4. Save to database with placeholder

This allows testing the AI features without transcription.

---

## Questions?

- **Do I need both Gemini AND Whisper?** - Yes, they serve different purposes:
  - Gemini = AI reasoning (chat, insights, analysis)
  - Whisper = Audio → Text transcription
  
- **Can I use just Gemini for everything?** - Gemini can do transcription but:
  - More expensive for long audio
  - Whisper is optimized for transcription
  - Better to use specialized tools

- **What if I don't have Whisper API?** - Use browser Web Speech API (Option 3) for testing

---

## Next Steps

1. Choose your transcription provider (Whisper recommended)
2. Get API key and add to `.env`
3. Install SDK (`npm install openai`)
4. Create transcription function using code above
5. Update `ai.functions.ts` to call transcription
6. Test with a real voice recording
7. Remove placeholder warning
