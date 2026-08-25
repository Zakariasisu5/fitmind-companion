import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, HeartPulse, MessageCircleHeart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FitMind Care — your calm AI health companion" },
      {
        name: "description",
        content:
          "Track symptoms, mood, nutrition and voice check-ins in one private, mobile-first wellness app with AI insights.",
      },
      { property: "og:title", content: "FitMind Care — your calm AI health companion" },
      {
        property: "og:description",
        content: "Voice logging, mood and symptom tracking, brain games and AI wellness guidance.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    index: "01",
    icon: HeartPulse,
    label: "Body map",
    text: "Visual localized tracking for physical symptoms and tension points.",
    highlight: false,
  },
  {
    index: "02",
    icon: MessageCircleHeart,
    label: "AI chat",
    text: "Instant therapeutic dialogue and brain games to maintain cognitive sharpness.",
    highlight: true,
  },
  {
    index: "03",
    icon: BarChart3,
    label: "Biometrics",
    text: "Unified voice, mood and nutrition logs, private to your account.",
    highlight: false,
  },
] as const;

function Landing() {
  return (
    <div className="px-safe pb-safe min-h-screen w-full bg-[#0d1f1c] text-[#f3f7f5]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 items-center gap-12 p-5 md:p-12 lg:grid-cols-10 lg:gap-16">
        {/* 60% — hero narrative */}
        <div className="space-y-8 lg:col-span-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#2dd4a8]/20 bg-[#14332e] px-4 py-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#2dd4a8] opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-[#2dd4a8]" />
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-[#2dd4a8]">
              Privacy-first AI
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="font-mono text-5xl font-bold leading-tight tracking-tighter md:text-7xl">
              FitMind <span className="text-[#2dd4a8]">Care</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-[#f3f7f5]/70 md:text-2xl">
              Vocalize your well-being. Intelligent voice check-ins that track symptoms, mood and
              nutrition in real time.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Link
              to="/auth"
              className="tap flex h-14 items-center justify-center rounded-xl bg-[#2dd4a8] px-8 text-lg font-semibold text-[#0d1f1c] transition-all hover:-translate-y-0.5 hover:bg-[#3ce0b4] active:scale-95"
            >
              Get started free
            </Link>
            <Link
              to="/auth"
              className="tap flex h-14 items-center justify-center rounded-xl border border-[#f3f7f5]/20 px-8 text-lg font-semibold transition-colors hover:bg-[#f3f7f5]/5"
            >
              I already have an account
            </Link>
          </div>

          <div className="border-t border-[#f3f7f5]/10 pt-8">
            <p className="max-w-md font-mono text-[10px] uppercase leading-relaxed tracking-widest text-[#f3f7f5]/40">
              Medical disclaimer — FitMind Care is for informational purposes only and is not a
              substitute for professional medical advice, diagnosis, or treatment.
            </p>
          </div>
        </div>

        {/* 40% — feature stack */}
        <div className="relative lg:col-span-4">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 size-64 rounded-full bg-[#2dd4a8]/5 blur-3xl"
          />
          <div className="relative z-10 space-y-6">
            {FEATURES.map(({ index, icon: Icon, label, text, highlight }) =>
              highlight ? (
                <div
                  key={label}
                  className="rounded-2xl border border-[#2dd4a8] bg-[#2dd4a8] p-6 shadow-2xl shadow-[#2dd4a8]/10 transition-transform hover:scale-[1.02] lg:-translate-x-8"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-mono text-sm text-[#0d1f1c]">
                      {index} — {label.toUpperCase()}
                    </span>
                    <span className="flex items-center gap-2 rounded-md bg-[#0d1f1c] px-2 py-0.5 font-mono text-[10px] font-bold text-[#2dd4a8]">
                      <Icon className="size-3" />
                      LIVE
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#0d1f1c]">{text}</p>
                </div>
              ) : (
                <div
                  key={label}
                  className="rounded-2xl border border-[#f3f7f5]/10 bg-[#14332e] p-6 transition-transform hover:scale-[1.02]"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-mono text-sm text-[#2dd4a8]">
                      {index} — {label.toUpperCase()}
                    </span>
                    <span className="flex size-8 items-center justify-center rounded-lg bg-[#2dd4a8]/10">
                      <Icon className="size-4 text-[#2dd4a8]" />
                    </span>
                  </div>
                  <p className="text-sm text-[#f3f7f5]/80">{text}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
