# Supported Languages in MindTalk AI

MindTalk AI now supports **11 languages** including English and 10 major Ghanaian languages, making healthcare accessible to millions across Ghana.

## Complete Language List

| Code | Language | Native Name | Speakers | Voice Support | Translation |
|------|----------|-------------|----------|---------------|-------------|
| `en` | English | English | ~5M in Ghana | ✅ Full | ✅ Yes |
| `tw` | Twi (Akan) | Twi | ~9M | ✅ Full | ✅ Yes |
| `ak` | Akuapem Twi | Akuapem Twi | ~3M | ✅ Full | ✅ Yes |
| `fat` | Fante | Mfantse | ~2.5M | ✅ Full | ✅ Yes |
| `dag` | Dagbani | Dagbanli | ~1.2M | ✅ Full | ✅ Yes |
| `ee` | Ewe | Eʋegbe | ~3M | ✅ Full | ✅ Yes |
| `ga` | Ga | Gã | ~1M | ✅ Full | ✅ Yes |
| `gur` | Gurene (Frafra) | Gurene | ~500K | ✅ Full | ✅ Yes |
| `kpo` | Ikposo | Ikposo | ~100K | ⚠️ Limited | ✅ Yes |
| `ksm` | Kasem | Kasem | ~250K | ⚠️ Limited | ✅ Yes |
| `nic` | Nzema | Nzema | ~300K | ⚠️ Limited | ✅ Yes |

**Total Potential Reach:** ~26 million speakers

## Language Groups

### Akan Languages (Central/Southern Ghana)
- **Twi (tw)** - Most widely spoken Akan dialect
- **Akuapem Twi (ak)** - Eastern region variant
- **Fante (fat)** - Coastal region variant

### Gur/Mole-Dagbani Languages (Northern Ghana)
- **Dagbani (dag)** - Dagomba people, Northern Region
- **Gurene (gur)** - Upper East Region (Frafra)
- **Kasem (ksm)** - Upper East Region, border areas

### Kwa Languages
- **Ewe (ee)** - Volta Region, also spoken in Togo/Benin
- **Ga (ga)** - Greater Accra Region
- **Nzema (nic)** - Western Region

### Other
- **Ikposo (kpo)** - Oti Region, small community
- **English (en)** - Official language, widely spoken

## Feature Support by Language

### Full Voice Support (ASR + TTS)
Languages with high-quality speech recognition and text-to-speech:
- ✅ English, Twi, Akuapem Twi, Fante, Dagbani, Ewe, Ga, Gurene

### Limited Voice Support
Languages with basic support (may have lower accuracy or availability):
- ⚠️ Ikposo, Kasem, Nzema

**Note:** All languages support translation between each other and English.

## How It Works

### 1. User Selects Language
Choose your preferred language from the language selector:

```tsx
import { LanguageSelector, useLanguagePreference } from "@/components/LanguageSelector";

function MyComponent() {
  const [language, setLanguage] = useLanguagePreference("en");
  
  return (
    <LanguageSelector value={language} onChange={setLanguage} />
  );
}
```

### 2. Voice Logs (ASR)
When you record a voice note in your language:
1. Audio is sent to GhanaNLP ASR
2. Transcribed to text in your language
3. Translated to English for AI processing
4. AI response translated back to your language
5. TTS speaks the response in your language

### 3. Chat (Translation)
When you type in your language:
1. Message translated to English
2. Gemini AI generates response in English
3. Response translated back to your language
4. Optional TTS playback in your language

### 4. AI Insights
Health insights are:
1. Generated in English (for medical accuracy)
2. Translated to your selected language
3. Displayed with translation indicator
4. Available as audio in your language

## Usage Examples

### Voice Log in Twi

```typescript
const result = await analyzeVoiceNote({
  audioBase64: audioData,
  format: "webm",
  language: "tw"  // Twi
});

console.log(result.transcription);  // Twi text
console.log(result.aiResponse);     // AI response in Twi
```

### Chat in Ewe

```typescript
const response = await askHealthCoach({
  message: "Dɔléle le asinye",  // "I have a headache" in Ewe
  language: "ee",  // Ewe
  history: []
});

console.log(response.reply);  // AI response in Ewe
```

### Generate Speech in Ga

```typescript
const audio = await generateSpeech({
  text: "Mishwɛ ni",  // "I am fine" in Ga
  language: "ga"
});

// Play Ga audio
playAudio(audio.audio);
```

## Language Selection UI

### Dropdown Selector

```tsx
<LanguageSelector 
  value={language} 
  onChange={setLanguage}
  showLabel={true}
/>
```

### Grid Selector (Settings Page)

```tsx
<LanguageGrid 
  value={language} 
  onChange={setLanguage}
/>
```

### Language Badge

```tsx
<LanguageBadge language="tw" />
// Displays: 🌐 Twi (Akan)
```

## Regional Distribution

### Greater Accra Region
- English, Ga, Twi

### Ashanti Region
- Twi, English

### Western Region  
- Fante, Nzema, Twi, English

### Volta Region
- Ewe, English

### Northern Region
- Dagbani, English

### Upper East Region
- Gurene, Kasem, English

### Upper West Region
- Dagaare (coming soon), English

### Eastern Region
- Akuapem Twi, English

### Central Region
- Fante, Twi, English

## Translation Quality

### High Accuracy (Medical Context)
- English ↔ Twi
- English ↔ Fante
- English ↔ Ewe
- English ↔ Ga
- English ↔ Dagbani

### Moderate Accuracy
- English ↔ Akuapem Twi
- English ↔ Gurene

### Developing Accuracy
- English ↔ Ikposo
- English ↔ Kasem
- English ↔ Nzema

**Important:** All translations are flagged with a "Translated" indicator to maintain transparency about accuracy.

## Best Practices

### For Users
1. **Choose your primary language** in settings
2. **Review translations** - especially for medical terms
3. **Edit transcriptions** if ASR confidence is low
4. **Use English** for complex medical discussions if preferred

### For Developers
1. **Always show translation indicators** - be transparent
2. **Handle fallbacks gracefully** - use English if translation fails
3. **Log accuracy issues** - help improve the system
4. **Test with native speakers** - validate translations
5. **Cache TTS audio** - reduce API calls and latency

## Common Phrases by Language

### Greetings

| English | Twi | Ewe | Ga | Dagbani |
|---------|-----|-----|----|---------| 
| Hello | Maakye | Ŋdi / Ɛ | Ojekoo | Desba |
| How are you? | Wo ho te sɛn? | Efɔa? | Ojekoo mli? | A lali la? |
| I'm fine | Me ho yɛ | Ŋdi nyuie | Mi daa nyɛ | M mali |
| Thank you | Medaase | Akpe | Oyiwaladonŋ | N yel tuma |

### Health Terms

| English | Twi | Ewe | Ga | Dagbani |
|---------|-----|-----|----|---------| 
| Pain | Ɛyaw | Vevesesese | Hiɔ | Niŋdi |
| Headache | Tirim yareɛ | Taŋutɔgbalɔ | Hiɔ le gbɛmɔ | Niyul puma niŋdi |
| Hospital | Ayaresabea | Kɔɖa | Ayalɔ | Boo gbandiya |
| Medicine | Aduro | Atike | Amɛ | Tiɣiri |
| Doctor | Oduruyɛfo | Dokita | Amɛwɔla | Borɡi doktari |

## Accuracy & Limitations

### What Works Well
✅ Common health symptoms
✅ Basic medical conversations
✅ General wellness topics
✅ Emotional state descriptions
✅ Daily health tracking

### What Needs Care
⚠️ Complex medical terminology
⚠️ Specific drug names
⚠️ Technical diagnoses
⚠️ Rare conditions
⚠️ Idiomatic expressions

**Recommendation:** For critical medical information, we display both the translation and the English original.

## Future Language Additions

Languages under consideration for future support:

### High Priority
- **Dagaare** (Upper West, ~1M speakers)
- **Gonja** (Savannah Region, ~300K)
- **Hausa** (Northern, ~500K in Ghana)

### Medium Priority  
- **Dangme** (Greater Accra, ~800K)
- **Kokomba** (Northern, ~100K)
- **Builsa** (Upper East, ~200K)

### Research Phase
- **Sisaala** (Upper West)
- **Buli** (Upper East)
- **Kusaal** (Upper East)

## Accessibility Impact

### By Literacy Level
- **High literacy**: Can use English
- **Medium literacy**: Prefer local language text
- **Low literacy**: Rely on voice features

### By Age Group
- **18-35**: Often bilingual (English + local)
- **35-60**: Prefer local language
- **60+**: May only speak local language

### By Region
- **Urban areas**: More English proficiency
- **Rural areas**: Primarily local languages

**MindTalk AI's multi-language support makes healthcare accessible across all these demographics.**

## Technical Notes

### Language Detection
Currently, users must manually select their language. Automatic language detection may be added in future versions.

### Code-Switching
Many Ghanaians mix English with local languages. Currently, choose one primary language per conversation for best results.

### Dialects
Some languages have multiple dialects. We support the most widely-spoken variants.

### Updates
GhanaNLP continuously improves their models. Check for updates regularly for better accuracy.

## Support & Feedback

If you notice translation issues:
1. Report via in-app feedback
2. Specify the language pair (e.g., "Ewe → English")
3. Provide the incorrect phrase and expected translation
4. Context helps (medical term, casual conversation, etc.)

Your feedback helps improve accuracy for everyone!

---

**Total Language Support: 11 languages**
**Total Potential Users: 26+ million people**
**Coverage: ~95% of Ghana's population**
