# FitMind Care

A mobile-first AI health companion that helps you monitor physical and mental well-being through voice logging, symptom tracking, mood monitoring, nutrition logging, cognitive games, and real-time AI insights — all in one privacy-first platform.

**Live preview:** [id-preview.lovable.app](https://id-preview--435bd679-1dfa-4ffe-8128-0c36fb3b9292.lovable.app)  
**Published site:** [well-voice-care.lovable.app](https://well-voice-care.lovable.app)

---

## What it does

FitMind Care is designed as a personal wellness assistant you can keep in your pocket. It prioritizes a clean, thumb-friendly mobile experience and scales up gracefully to desktop.

- **Unified Dashboard** — A single glance at recent voice logs, symptoms, mood entries, and AI insights.
- **Voice Health Logger** — Record a voice note, get it transcribed, and receive structured AI wellness feedback.
- **Symptom Tracker** — Log symptoms with severity, body area, duration, and notes.
- **Mood & Mental Health** — Track mood, energy, stress, anxiety, sleep quality, and visualize trends over time.
- **Nutrition Logging** — Log meals with type, food items, calories, and notes.
- **Interactive Body Map** — Tap body regions (heart, lungs, stomach, head, eyes) to see metrics and AI suggestions.
- **AI Health Coach** — A conversational wellness assistant that persists chat history and always stays within general wellness guidance.
- **Medical Report Upload** — Upload CSV reports, extract metrics, and generate AI wellness insights.
- **Emergency Contacts** — Store personal contacts and view public emergency numbers.
- **Brain Boost Buddy** — Cognitive mini-games: memory matching, math challenges, and pattern recall.

---

## Tech stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (React 19 + Vite 7)
- **Routing:** TanStack Router
- **Data fetching:** TanStack Query
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Backend / Auth / Database:** Lovable Cloud (Supabase) with Row-Level Security on every user-facing table
- **AI:** Lovable AI Gateway for chat, insights, and structured data extraction
- **Icons:** Lucide React

---

## Project structure

```
src/
├── components/          # Shared UI components (AppShell, etc.)
├── hooks/               # React hooks (useUser, etc.)
├── integrations/        # Supabase client and auth middleware
├── lib/                 # AI functions, server helpers, utilities
├── routes/              # TanStack file routes
│   ├── index.tsx        # Public landing page
│   ├── auth.tsx         # Sign-in / sign-up
│   ├── __root.tsx       # Root layout and head metadata
│   └── _authenticated/  # Protected app routes
│       ├── dashboard.tsx
│       ├── voice.tsx
│       ├── track.tsx
│       ├── body.tsx
│       ├── chat.tsx
│       ├── brain.tsx
│       └── profile.tsx
├── router.tsx           # Router configuration
├── start.ts             # Start app configuration
└── styles.css           # Mobile-first design system and theme tokens

supabase/
└── migrations/          # Database schema and RLS policies

public/
├── manifest.json        # PWA manifest
├── sw.js                # Service worker for offline caching
└── icons/               # PWA icons
```

---

## Getting started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Install dependencies

This project uses Bun. If you prefer npm, replace `bun` with `npm` below.

```bash
bun install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add the values provided by Lovable Cloud:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
LOVABLE_API_KEY=your-lovable-api-key
```

> **Important:** Never commit `.env` to Git. It is listed in `.gitignore` by default.

### 4. Run the development server

```bash
bun dev
```

The app will be available at `http://localhost:8080`.

### 5. Build for production

```bash
bun run build
```

---

## PWA install

The app is configured as a Progressive Web App:

- `public/manifest.json` defines the app identity, theme colors, and display mode.
- `public/sw.js` handles basic asset caching and offline fallback.
- On supported mobile browsers, you can add FitMind Care to your home screen for a native-like experience.

---

## Medical disclaimer

FitMind Care is a wellness and health tracking application. It is **not** a substitute for professional medical advice, diagnosis, or treatment. The AI assistant provides general wellness guidance only and never diagnoses conditions or prescribes treatments.

---

## Built with Lovable

This project was built with [Lovable](https://lovable.dev) — the AI app builder.

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/435bd679-1dfa-4ffe-8128-0c36fb3b9292).

- **Ship faster:** describe what you want to build and Lovable handles the code.
- **Stay in sync:** every change made in Lovable is committed straight to this repository.
- **Full ownership:** this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.
