# Text-to-Speech Setup Guide

## Issue: Speaker Button Not Working

If the speaker button appears but doesn't play audio, or shows an error like "TTS not configured" or "Voice output is not configured", this means the `LOVABLE_API_KEY` environment variable is missing.

## Solution

### Step 1: Add the LOVABLE_API_KEY to your .env file

Open your `.env` file in the project root and add the following line:

```env
LOVABLE_API_KEY=your-lovable-api-key-here
```

Your complete `.env` file should look like this:

```env
SUPABASE_PROJECT_ID="ekqhzcgmikkeyhbxygvl"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_7ZpfoDH060D6HcFn2WVNrQ_FUHDnLe-"
SUPABASE_URL="https://ekqhzcgmikkeyhbxygvl.supabase.co"
VITE_SUPABASE_PROJECT_ID="ekqhzcgmikkeyhbxygvl"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_7ZpfoDH060D6HcFn2WVNrQ_FUHDnLe-"
VITE_SUPABASE_URL="https://ekqhzcgmikkeyhbxygvl.supabase.co"
LOVABLE_API_KEY=your-actual-api-key-here
```

### Step 2: Get Your Lovable API Key

Since this is a Lovable-connected project, you can get your API key from:

1. **Lovable Dashboard**: https://lovable.dev
2. Navigate to your project settings
3. Look for "API Keys" or "Environment Variables"
4. Copy the `LOVABLE_API_KEY` value

### Step 3: Restart the Development Server

After adding the API key to your `.env` file:

1. Stop the development server (Ctrl+C in terminal)
2. Restart it with:
   ```bash
   npm run dev
   ```
   or
   ```bash
   bun dev
   ```

### Step 4: Test the Speaker Button

1. Navigate to the Voice Log page (`/voice`)
2. Find a voice log entry with an AI response
3. Click the speaker icon (🔊)
4. You should see:
   - Loading spinner briefly
   - Audio should start playing
   - Icon changes to 🔇 (stop icon)

## Troubleshooting

### Error: "Voice output is not configured"
- **Cause**: `LOVABLE_API_KEY` is not set or is invalid
- **Solution**: Follow steps above to add the correct API key

### Error: "Audio is muted"
- **Cause**: The global mute toggle is enabled
- **Solution**: Look for the mute/unmute button in the chat interface and toggle it

### Error: "TTS not configured"
- **Cause**: The API key might be invalid or the TTS service is unavailable
- **Solution**: 
  1. Verify your API key is correct
  2. Check your internet connection
  3. Check browser console for detailed error messages

### Audio loads but doesn't play
- **Cause**: Browser autoplay policy or AudioContext issues
- **Solution**: 
  1. Make sure you've interacted with the page (clicked somewhere)
  2. Check browser permissions for audio
  3. Try refreshing the page

### Button shows but nothing happens
- **Cause**: JavaScript error or hook not properly initialized
- **Solution**: 
  1. Open browser DevTools (F12)
  2. Check Console tab for errors
  3. Look for red error messages related to "VoiceLogSpeaker" or "useVoiceLogTTS"

## Verification Checklist

- [ ] `.env` file exists in project root
- [ ] `LOVABLE_API_KEY` is added to `.env` file
- [ ] Development server was restarted after adding the key
- [ ] Browser was refreshed (Ctrl+Shift+R / Cmd+Shift+R)
- [ ] Voice log entries have AI responses visible
- [ ] Speaker icon is visible next to AI responses
- [ ] Clicking speaker icon shows loading state
- [ ] Audio plays successfully

## Alternative: Use Environment Variables UI (if available)

If your Lovable project has an environment variables UI:

1. Go to your Lovable project dashboard
2. Navigate to Settings → Environment Variables
3. Add `LOVABLE_API_KEY` with the correct value
4. The changes should auto-sync to your local environment

## How the TTS System Works

1. **User clicks speaker icon** → Component calls `playVoiceLog(logId, text)`
2. **Hook sends request** → POST to `/api/tts` with AI response text
3. **TTS API calls Lovable Gateway** → Uses `LOVABLE_API_KEY` for authentication
4. **Audio streams back** → Server-Sent Events (SSE) with PCM audio chunks
5. **Browser plays audio** → AudioContext buffers and plays the audio

## Need More Help?

If you've followed all steps and it's still not working:

1. Check the browser console for detailed error messages
2. Check the terminal where dev server is running for server errors
3. Verify the `/api/tts` endpoint is accessible (should return error if no key is set)
4. Contact Lovable support if the API key is the issue

## Security Note

⚠️ **Never commit your `.env` file to Git!**

The `.env` file is listed in `.gitignore` by default. It contains sensitive API keys that should never be shared or committed to version control.
