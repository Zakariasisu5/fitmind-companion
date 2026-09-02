# Voice Log TTS Troubleshooting Guide

## Quick Diagnosis

### Symptom: Speaker icon appears but nothing happens when clicked

**Most Common Cause:** Missing `LOVABLE_API_KEY` environment variable

**Quick Fix:**
1. Open `.env` file in project root
2. Add this line: `LOVABLE_API_KEY=your-actual-key-here`
3. Restart dev server: `npm run dev` or `bun dev`
4. Refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

## Step-by-Step Debugging

### Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Click the speaker icon
4. Look for messages starting with "VoiceLogSpeaker clicked:"

**Expected output:**
```
VoiceLogSpeaker clicked: {logId: "abc123", text: "AI response...", state: {...}}
Starting playback for: abc123
```

**If you see error messages:**
- `TTS error` → API key issue or network problem
- `Failed to fetch` → Server not running or wrong URL
- `Voice output failed (500)` → API key not configured

### Step 2: Check Network Tab

1. In DevTools, go to Network tab
2. Click the speaker icon
3. Look for a request to `/api/tts`

**Expected:**
- Status: 200 OK
- Type: text/event-stream
- Data streaming in (multiple chunks)

**If Status is 500:**
- Response body will say "Voice output is not configured"
- Cause: `LOVABLE_API_KEY` is missing from `.env`

**If Status is 400:**
- Response: "Text is required"
- Cause: Empty or invalid AI response text

**If No request appears:**
- Component might not be mounting correctly
- Check React DevTools for component errors

### Step 3: Use the Diagnostic Tool

Add the diagnostic component temporarily to test TTS:

```tsx
// In src/routes/_authenticated/voice.tsx or dashboard.tsx
import { TTSDiagnostic } from "@/components/TTSDiagnostic";

// Add anywhere in your component's return:
<TTSDiagnostic />
```

This will show:
- Current mute status
- What's currently playing
- Test TTS button
- Detailed error messages
- Setup instructions

### Step 4: Verify Environment Variables

**Check if .env file exists:**
```powershell
# Windows PowerShell
Test-Path .env
# Should return: True
```

**Check if LOVABLE_API_KEY is set:**
```powershell
# View .env contents (be careful not to share this output!)
Get-Content .env
```

**Expected .env contents:**
```env
SUPABASE_PROJECT_ID="..."
SUPABASE_PUBLISHABLE_KEY="..."
SUPABASE_URL="..."
VITE_SUPABASE_PROJECT_ID="..."
VITE_SUPABASE_PUBLISHABLE_KEY="..."
VITE_SUPABASE_URL="..."
LOVABLE_API_KEY=your-key-here  ← This line must be present
```

### Step 5: Restart Everything

Sometimes environment variables don't reload properly:

```powershell
# 1. Stop dev server (Ctrl+C)
# 2. Clear any caches
Remove-Item -Recurse -Force .vinxi, .output -ErrorAction SilentlyContinue
# 3. Restart
npm run dev
```

Then in browser:
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or clear cache and reload

---

## Common Issues & Solutions

### Issue: "TTS not configured" error

**Symptoms:**
- Click speaker → loading → error appears
- Error message: "Setup required" or "TTS not configured"

**Cause:** Missing or invalid `LOVABLE_API_KEY`

**Solution:**
1. Get your API key from Lovable dashboard (https://lovable.dev)
2. Add to `.env`: `LOVABLE_API_KEY=your-actual-key`
3. Restart dev server
4. Hard refresh browser

**Verification:**
- The error should change or disappear
- Network tab should show 200 response instead of 500

---

### Issue: "Audio is muted" error

**Symptoms:**
- Error message: "Unmute audio"
- No loading state, immediate error

**Cause:** Global mute toggle is enabled

**Solution:**
1. Look for mute/unmute button (usually in chat interface)
2. Click to unmute
3. Try speaker button again

**Note:** The global mute toggle affects all TTS in the app, not just voice logs.

---

### Issue: Loading forever, no audio

**Symptoms:**
- Click speaker → loading spinner appears
- Spinner never stops
- No audio plays
- After 5 seconds, shows "TTS not configured"

**Possible Causes:**
1. API key is set but invalid
2. Network connection issue
3. TTS service is down
4. AudioContext permission blocked

**Solution:**
1. Check browser console for detailed errors
2. Verify API key is correct (no extra spaces/quotes)
3. Test with diagnostic component
4. Check internet connection
5. Try different browser

---

### Issue: Audio plays but can't hear it

**Symptoms:**
- Icon changes to stop state (🔇)
- No errors shown
- But no sound

**Causes:**
1. Device volume is muted or very low
2. Browser tab is muted (check tab icon)
3. Audio output device issue

**Solution:**
1. Check system volume
2. Check browser tab (right-click tab → Unmute Site)
3. Check if other audio works in browser
4. Try headphones/different speakers

---

### Issue: Works in chat but not in voice logs

**Symptoms:**
- TTS works fine in `/chat` page
- Speaker button in voice logs doesn't work
- Same API key, same browser

**Cause:** Component integration issue or data format problem

**Debug:**
1. Check if AI response text exists: `log.ai_response`
2. Check console for component errors
3. Verify `VoiceLogSpeaker` is receiving correct props

**Check in voice.tsx:**
```tsx
{log.ai_response ? (
  <VoiceLogSpeaker
    logId={log.id}        // Must be unique string
    text={log.ai_response} // Must be non-empty string
    language="en"          // Must be valid language code
  />
) : null}
```

---

### Issue: First play fails, replay works

**Symptoms:**
- First click → error or timeout
- Second click → works perfectly

**Cause:** AudioContext initialization issue or race condition

**Solution:**
This is usually a one-time initialization issue. If it persists:
1. Check for JavaScript errors in console
2. Ensure user has interacted with page before clicking
3. Clear browser cache
4. Try different browser

---

## Advanced Debugging

### Check AudioContext State

Open browser console and run:
```javascript
// Check if AudioContext is available
console.log('AudioContext available:', 'AudioContext' in window);

// Check current state (if exists)
const ctx = new AudioContext();
console.log('AudioContext state:', ctx.state); // should be "running"
ctx.close();
```

### Test TTS API Directly

```javascript
// Test the API endpoint directly
fetch('/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Hello world' })
})
.then(res => {
  console.log('Status:', res.status);
  return res.text();
})
.then(text => console.log('Response:', text.substring(0, 200)))
.catch(err => console.error('Error:', err));
```

**Expected:** Status 200, Response starts with "data:"

**If Status 500:** Check server terminal for error details

### Check Component Mounting

In React DevTools:
1. Select Components tab
2. Search for "VoiceLogSpeaker"
3. Check props: logId, text should have values
4. Check hooks: useVoiceLogTTS should show state

### Monitor State Changes

Add temporary logging to the hook:
```tsx
// In src/hooks/useVoiceLogTTS.ts
console.log('Hook state:', { speakingId, muted, states: Array.from(states.entries()) });
```

---

## Environment-Specific Issues

### Development vs Production

**Development (npm run dev):**
- Uses .env file directly
- Hot reloading sometimes doesn't pick up .env changes
- Solution: Always restart server after .env changes

**Production (npm run build):**
- Environment variables must be set on hosting platform
- .env file is NOT included in build
- Solution: Configure LOVABLE_API_KEY in hosting dashboard

### Windows-Specific

**Path issues:**
- Ensure .env is in project root (same folder as package.json)
- Use backslashes in file paths if needed

**PowerShell permissions:**
- If "script execution is disabled" error appears
- Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Browser-Specific

**Chrome/Edge:**
- Usually works best
- Check for "blocked mixed content" if on HTTPS

**Firefox:**
- May require manual AudioContext permission
- Check `about:config` → `media.autoplay.enabled`

**Safari:**
- Stricter autoplay policies
- May need user gesture before playing
- AudioContext may start suspended

---

## Getting Help

If none of these solutions work:

1. **Gather information:**
   - Browser name and version
   - Operating system
   - Console errors (screenshot)
   - Network tab screenshot
   - .env file (WITHOUT showing the actual API key)

2. **Check these files:**
   - `src/hooks/useVoiceLogTTS.ts` - Hook implementation
   - `src/components/VoiceLogSpeaker.tsx` - Component
   - `src/lib/speech.tsx` - Speech provider
   - `src/routes/api/tts.ts` - API endpoint

3. **Verify setup:**
   - ✅ .env file exists with LOVABLE_API_KEY
   - ✅ Dev server restarted after adding key
   - ✅ Browser hard refreshed
   - ✅ Voice log has AI response (gray box visible)
   - ✅ Speaker icon is visible and clickable
   - ✅ No console errors before clicking

4. **Create minimal reproduction:**
   - Use TTSDiagnostic component
   - Note exact error messages
   - Try on different device/browser

---

## Success Checklist

Speaker button should:
- ✅ Appear next to AI responses
- ✅ Show tooltip on hover
- ✅ Show loading spinner on first click
- ✅ Play audio after ~1-2 seconds
- ✅ Change to stop icon while playing
- ✅ Stop audio when clicked again
- ✅ Replay instantly on second play
- ✅ Auto-stop when playing different log
- ✅ Show clear error if something fails

If all boxes check, congratulations! Your TTS is working correctly. 🎉
