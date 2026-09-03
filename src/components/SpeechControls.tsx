import { Loader2, Volume2, VolumeX } from "lucide-react";
import {
  LANGUAGES,
  MAX_RATE,
  MIN_RATE,
  hasNativeVoice,
  languageLabel,
  useSpeech,
  type LangCode,
} from "@/lib/speech";
import { cn } from "@/lib/utils";

export function MuteToggle({ className }: { className?: string }) {
  const { muted, toggleMuted, isSpeaking } = useSpeech();
  return (
    <button
      type="button"
      onClick={toggleMuted}
      aria-pressed={muted}
      aria-label={muted ? "Turn voice replies on" : "Mute voice replies"}
      className={cn(
        "tap flex size-11 items-center justify-center rounded-2xl border border-border transition-colors",
        muted ? "bg-background text-muted-foreground" : "bg-secondary text-secondary-foreground",
        className,
      )}
    >
      {muted ? (
        <VolumeX className="size-5" />
      ) : isSpeaking ? (
        <Volume2 className="size-5 animate-pulse" />
      ) : (
        <Volume2 className="size-5" />
      )}
    </button>
  );
}

export function LanguagePicker({ className }: { className?: string }) {
  const { language, setLanguage } = useSpeech();
  return (
    <label className={cn("flex items-center gap-2", className)}>
      <span className="sr-only">Language</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as LangCode)}
        className="tap h-11 rounded-2xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function VoiceFallbackNotice({ className }: { className?: string }) {
  const { language, muted } = useSpeech();
  if (hasNativeVoice(language)) return null;
  return (
    <p
      className={cn(
        "rounded-2xl border border-dashed border-border px-4 py-3 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      No natural {languageLabel(language)} voice is available yet. Text is shown in{" "}
      {languageLabel(language)}, and {muted ? "audio would be" : "the spoken reply is"} an English
      version of the same answer.
    </p>
  );
}

export function SpeakButton({
  text,
  audioText,
  id,
  className,
}: {
  text: string;
  audioText?: string;
  id: string;
  className?: string;
}) {
  const { speak, stop, speakingId } = useSpeech();
  const active = speakingId === id;
  return (
    <button
      type="button"
      onClick={() => (active ? stop() : speak(text, { id, audioText }))}
      aria-label={active ? "Stop reading aloud" : "Read aloud"}
      className={cn(
        "tap flex size-11 shrink-0 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:text-foreground",
        active && "text-primary",
        className,
      )}
    >
      {active ? <Loader2 className="size-5 animate-spin" /> : <Volume2 className="size-5" />}
    </button>
  );
}

export function VoicePlaybackControls({ className }: { className?: string }) {
  const { muted, toggleMuted, volume, setVolume, rate, setRate, isSpeaking, stop } = useSpeech();

  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-card-foreground">Voice playback</p>
          <p className="text-xs text-muted-foreground">
            {muted ? "Muted — replies show as text only" : "Replies are spoken aloud automatically"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSpeaking ? (
            <button
              type="button"
              onClick={stop}
              className="tap flex h-11 items-center justify-center rounded-2xl border border-border px-3 text-xs font-medium"
            >
              Stop
            </button>
          ) : null}
          <MuteToggle />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            Volume <span>{Math.round(volume * 100)}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            disabled={muted}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Voice volume"
            className="tap mt-2 h-11 w-full accent-primary disabled:opacity-50"
          />
        </label>

        <label className="block">
          <span className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            Speed <span>{rate.toFixed(2)}x</span>
          </span>
          <input
            type="range"
            min={MIN_RATE}
            max={MAX_RATE}
            step={0.05}
            value={rate}
            disabled={muted}
            onChange={(e) => setRate(Number(e.target.value))}
            aria-label="Voice speed"
            className="tap mt-2 h-11 w-full accent-primary disabled:opacity-50"
          />
        </label>
      </div>
    </div>
  );
}
