import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import landingBg from "@/assets/landing-bg.mp4.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindTalk AI — your calm AI health companion" },
      {
        name: "description",
        content:
          "Track symptoms, mood, nutrition and voice check-ins in one private, mobile-first wellness app with AI insights.",
      },
      { property: "og:title", content: "MindTalk AI — your calm AI health companion" },
      {
        property: "og:description",
        content: "Voice logging, mood and symptom tracking, brain games and AI wellness guidance.",
      },
    ],
  }),
  component: Landing,
});

const TEAL = "#2dd4a8";
const INK = "#0d1f1c";
const PAPER = "#f3f7f5";

function Landing() {
  return (
    <div className="px-safe pb-safe relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ color: PAPER }}>
      {/* Background video */}
      <video
        className="pointer-events-none fixed inset-0 h-full w-full object-cover"
        src={landingBg.url}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
      />

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 pt-6 md:px-12">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="MindTalk AI" className="h-10 w-10 rounded-lg object-cover" />
          <span className="font-mono text-sm font-bold tracking-widest" style={{ color: TEAL }}>
            MINDTALK_AI
          </span>
        </div>
        <Link
          to="/auth"
          className="tap flex items-center gap-1 font-mono text-xs uppercase tracking-widest transition-colors"
          style={{ color: `${PAPER}b3` }}
        >
          Sign in <ArrowUpRight className="size-4" />
        </Link>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-start justify-center px-5 py-16 md:px-12">
        <div
          className="inline-flex items-center gap-3 rounded-full border px-4 py-1.5 backdrop-blur-sm"
          style={{ backgroundColor: `${INK}80`, borderColor: `${TEAL}33` }}
        >
          <span className="relative flex size-2">
            <span
              className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: TEAL }}
            />
            <span className="relative inline-flex size-2 rounded-full" style={{ backgroundColor: TEAL }} />
          </span>
          <span className="font-mono text-xs uppercase tracking-widest" style={{ color: TEAL }}>
            Privacy-first AI
          </span>
        </div>

        <h1 className="mt-6 font-mono text-5xl font-bold leading-[1.02] tracking-tighter md:text-7xl lg:text-8xl">
          Your body
          <br />
          speaks.
          <br />
          <span style={{ color: TEAL }}>We listen.</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed md:text-xl" style={{ color: `${PAPER}b3` }}>
          Voice check-ins, mood and symptom tracking, and AI wellness guidance — private to your account.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link
            to="/auth"
            className="tap flex h-14 items-center justify-center rounded-xl px-8 text-lg font-semibold transition-transform active:scale-95"
            style={{ backgroundColor: TEAL, color: INK }}
          >
            Get started free
          </Link>
          <Link
            to="/auth"
            className="tap flex h-14 items-center justify-center rounded-xl border px-8 text-lg font-semibold backdrop-blur-sm transition-colors"
            style={{ borderColor: `${PAPER}40`, backgroundColor: `${INK}40` }}
          >
            I already have an account
          </Link>
        </div>
      </main>

      {/* Footer band */}
      <footer className="relative z-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-12">
          <p
            className="max-w-2xl font-mono text-[10px] uppercase leading-relaxed tracking-widest"
            style={{ color: `${PAPER}59` }}
          >
            MindTalk AI is for informational purposes only and is not a substitute for professional medical advice,
            diagnosis, or treatment.
          </p>
          <p className="shrink-0 font-mono text-[10px] uppercase tracking-widest" style={{ color: `${TEAL}80` }}>
            © 2026 MindTalk AI
          </p>
        </div>
      </footer>
    </div>
  );
}
