# FitMind Companion

FitMind Care — Mobile-First Rebuild Prompt

Paste this into Lovable (or your AI app builder of choice) to rebuild FitMind Care as a mobile-first, installable web app.

Prompt

Build FitMind Care, a mobile-first AI health companion web app. This is a rebuild of an existing project — prioritize a clean, touch-friendly mobile experience first, with the desktop layout as a secondary responsive breakpoint (not the other way around).

Core Concept

A comprehensive health companion that helps users monitor and improve physical and mental well-being through voice logging, symptom tracking, mood monitoring, nutrition logging, cognitive training, and real-time AI insights — all in one unified, privacy-first platform.

Mobile-First Requirements (non-negotiable)

Design for a 375–430px viewport first, then scale up. No horizontal scrolling anywhere.

Bottom tab navigation (not a sidebar) for the core sections: Dashboard, Voice Log, Track, Chat, Profile. Sidebar nav only appears at desktop breakpoints (≥1024px).

Minimum 44×44px touch targets on every interactive element.

Sticky bottom "record" button for voice logging, reachable with one thumb.

Forms use large inputs, native mobile keyboards (numeric for numbers, etc.), and avoid multi-column layouts on small screens.

Respect safe-area insets (notch/home-indicator) using env(safe-area-inset-*).

Make it installable as a PWA: manifest.json, app icons, offline fallback page, and a service worker for basic asset caching.

Test tap states/hover states don't rely on hover-only interactions (no hover-to-reveal menus).

Use skeleton loaders instead of spinners for perceived performance on slower mobile connections.

Key Features

1. Interactive Body Dashboard Visual body model (Heart, Lungs, Stomach, Head, Eyes) — tap a region to see key metrics (heart rate, BMI, blood oxygen, sleep) and AI-generated suggestions for that area. Triggers a nearby-care map when readings cross emergency thresholds.

2. Voice Health Logger Record a voice note describing how you feel. Upload audio to an edge function, transcribe with Whisper, extract structured health data with AI, and store the transcription + extracted data + AI response. Show a searchable history of past logs.

3. Symptoms Tracker Log symptoms with severity, body area, duration, and notes. History view surfaces commonly recurring symptoms and patterns over time.

4. Mood & Mental Health Tracker Log mood, mood score, energy, stress, anxiety, sleep quality, activities, and triggers. Trend view + daily check-in habit loop.

5. Nutrition Tracker Log meals with type, food items, calories, and notes. Daily view for calorie awareness and eating pattern habits.

6. Brain Boost Buddy Cognitive mini-games: Memory Game, Math Challenge, Pattern Game. Progress tracker across sessions.

7. AI Health Chat Conversational assistant for general wellness questions. Persists chat history. Empathetic tone; never diagnoses or prescribes — always general wellness guidance with a clear disclaimer.

8. Medical Report Upload Upload a CSV medical report, parse sections/metrics/values/units, store extracted metrics, and generate AI insights from them. Validate file type and required fields with clear inline errors.

9. Emergency Contacts Store personal emergency contacts (name, phone, relationship) plus a built-in list of public emergency numbers. Integrated with the body dashboard's emergency detection.

10. Unified Dashboard One home screen aggregating recent voice logs, symptoms, mood entries, and AI insights — the first thing a user sees after login, optimized for a quick mobile glance.

Tech Stack

Frontend: React 18 + TypeScript + Vite, React Router, TanStack Query for data fetching/caching

Styling: Tailwind CSS + shadcn/ui components, mobile-first utility classes, Recharts for trend charts (responsive containers)

Forms: React Hook Form + Zod validation

Backend: Supabase — Postgres, Auth, Edge Functions, Row-Level Security on every table

AI: LLM gateway (Gemini or similar) for chat/insights/data extraction; Whisper for voice transcription

Maps: Google Maps JS API for nearby emergency care

PWA: manifest.json + service worker for installability and basic offline support

Database Tables (with RLS on all)

profiles, voice_logs, symptoms, mood_entries, nutrition_entries, health_metrics, health_insights, chat_messages, emergency_contacts — all keyed to auth.users via user_id, indexed on user_id and created_at.

Edge Functions

voice-to-health-data — transcribe audio (Whisper) + extract structured health data

health-agent — analyze biometrics/history, return suggestions and risk flags

chat — power the AI health assistant

mcp-biometric-sync — placeholder for future wearable integrations (Fitbit, Apple Health, Garmin)

Security & Privacy

Supabase Auth for sessions/sign-up/sign-in

RLS on every user-facing table — users only ever see their own data

Data stored only when explicitly logged or uploaded by the user

AI assistant gives general wellness info only, never diagnosis or prescriptions — show this disclaimer clearly in the chat UI

Visual Identity

Clean, calming, health-app aesthetic — avoid a clinical/cold look. Suggest a soft, rounded design language with a primary accent color (teal/blue-green range reads as "health/calm"), generous whitespace, and clear data visualization for trends. Dark mode supported via a toggle.

Build Order (recommended)

Auth + profile creation

Bottom nav shell + unified dashboard (empty states)

Symptom, mood, nutrition trackers (simplest data-in/data-out loop)

Voice logger + transcription pipeline

Body dashboard with AI suggestions

AI chat

Medical report upload/parsing

Emergency contacts + emergency detection

Brain Boost Buddy games

PWA polish (manifest, icons, offline page, install prompt)

Disclaimer to include in-app: FitMind Care is a wellness and health tracking application, not a substitute for professional medical advice, diagnosis, or treatment.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/435bd679-1dfa-4ffe-8128-0c36fb3b9292).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
