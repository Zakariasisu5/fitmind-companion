import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Brain, HeartPulse, Mic, MessageCircleHeart, ShieldCheck } from "lucide-react";

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
  { icon: Mic, title: "Voice check-ins", text: "Say how you feel; we transcribe and structure it." },
  { icon: Activity, title: "Trackers", text: "Symptoms, mood and nutrition in one quick loop." },
  { icon: HeartPulse, title: "Body map", text: "Tap a region for metrics and gentle suggestions." },
  { icon: MessageCircleHeart, title: "AI chat", text: "General wellness guidance, never a diagnosis." },
  { icon: Brain, title: "Brain boost", text: "Memory, math and pattern games for focus." },
  { icon: ShieldCheck, title: "Private by default", text: "Your data is yours, protected per account." },
];

function Landing() {
  return (
    <div className="px-safe pb-safe min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-5 pb-16 pt-12">
        <span className="calm-gradient mb-6 flex size-14 items-center justify-center rounded-3xl">
          <HeartPulse className="size-7 text-primary-foreground" />
        </span>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight">
          FitMind Care
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          A calm, mobile-first companion for your body and mind. Log a voice note, track how you feel,
          and get gentle AI guidance — all in one private place.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/auth"
            className="calm-gradient tap flex h-14 items-center justify-center rounded-2xl px-6 text-base font-medium text-primary-foreground"
          >
            Get started free
          </Link>
          <Link
            to="/auth"
            className="tap flex h-14 items-center justify-center rounded-2xl border border-input px-6 text-base font-medium"
          >
            I already have an account
          </Link>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="soft-card p-4">
              <Icon className="size-6 text-primary" />
              <p className="mt-3 font-medium">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
          FitMind Care is a wellness and health tracking application, not a substitute for professional
          medical advice, diagnosis, or treatment.
        </p>
      </div>
    </div>
  );
}
