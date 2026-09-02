# 🔧 Quick Fix: Speaker Button Not Working

## The Problem
You see the speaker icon (🔊) next to voice log AI responses, but when you click it:
- Nothing happens, OR
- Shows "Setup required" or "TTS not configured" error, OR
- Loading spinner appears but never plays audio

## The Solution (2 minutes)

### 1. Add Missing API Key

Open your `.env` file and add this line:

```env
LOVABLE_API_KEY=your-actual-lovable-api-key
```

**Where to get the key:**
- Go to https://lovable.dev
- Open your project
- Look for Settings → API Keys or Environment Variables
- Copy the API key value

### 2. Restart Development Server

Stop the server (Ctrl+C) and restart:
```bash
npm run dev
```
or
```bash
bun dev
```

### 3. Refresh Browser

Hard refresh your browser:
- **Windows:** Ctrl + Shift + R
- **Mac:** Cmd + Shift + R

### 4. Test It

1. Go to Voice Log page (`/voice`)
2. Find an entry with an AI response (gray background box)
3. Click the speaker icon (🔊)
4. You should see:
   - Loading spinner (1-2 seconds)
   - Audio starts playing
   - Icon changes to 🔇

## Still Not Working?

### Quick Checks:

**Is audio muted?**
- Look for mute toggle button (usually in chat interface)
- Click to unmute if needed

**Is the .env file in the right place?**
- Must be in project root folder (same level as package.json)
- Not in src/ or any subfolder

**Did you restart the server?**
- .env changes require server restart
- Always stop (Ctrl+C) and restart (npm run dev)

**Did you hard refresh?**
- Normal refresh (F5) might use cached files
- Always use Ctrl+Shift+R or Cmd+Shift+R

### Test with Diagnostic Tool

Add this to test if TTS is working:

1. Open `src/routes/_authenticated/voice.tsx`
2. Add at the top:
   ```tsx
   import { TTSDiagnostic } from "@/components/TTSDiagnostic";
   ```
3. Add inside the component JSX:
   ```tsx
   <TTSDiagnostic />
   ```
4. Save and check the page
5. Click "Test TTS" button for detailed diagnostics

### Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Click the speaker icon
4. Look for error messages

**Common errors:**
- `Voice output failed (500)` → API key missing/invalid
- `Failed to fetch` → Server not running
- `TTS not configured` → Add API key and restart

## Complete .env Example

Your `.env` file should look like this:

```env
SUPABASE_PROJECT_ID="ekqhzcgmikkeyhbxygvl"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_7ZpfoDH060D6HcFn2WVNrQ_FUHDnLe-"
SUPABASE_URL="https://ekqhzcgmikkeyhbxygvl.supabase.co"
VITE_SUPABASE_PROJECT_ID="ekqhzcgmikkeyhbxygvl"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_7ZpfoDH060D6HcFn2WVNrQ_FUHDnLe-"
VITE_SUPABASE_URL="https://ekqhzcgmikkeyhbxygvl.supabase.co"
LOVABLE_API_KEY=lpk_1234567890abcdefghijklmnopqrstuvwxyz  ← ADD THIS LINE
```

**Important:** Replace the example API key with your actual key!

## Detailed Documentation

For more help, see:
- **TTS_SETUP_GUIDE.md** - Complete setup instructions
- **TROUBLESHOOTING.md** - Detailed debugging guide
- **VOICE_LOG_TTS_FEATURE.md** - Technical documentation

## Success! ✅

Once working, you should be able to:
- Click speaker icon on any voice log with AI response
- Hear the AI response read aloud
- Click again to stop
- Replay instantly (no loading second time)
- Multiple logs stop each other automatically

Enjoy your working TTS feature! 🎉
