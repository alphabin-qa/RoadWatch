<div align="center">

![RoadWatch](public/og.png)

# RoadWatch

### AI road-accountability chatbot for citizens

*Snap a pothole. Get the contractor, the budget, the responsible officer, the warranty - and file the complaint. In one chat.*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-149eca?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-8e75ff?logo=google)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e?logo=supabase)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6c47ff?logo=clerk)](https://clerk.com/)
[![PWA](https://img.shields.io/badge/PWA-offline%20ready-5a0fc8)](#-what-we-took-care-of-engineering-quality)

</div>

---

## 📌 The problem

In India, a citizen who hits a dangerous pothole has **no idea who is accountable**.
Which contractor laid this road? Was it within warranty? How much public money was
sanctioned vs spent? Who is the officer responsible, and what is their SLA? Filing a
complaint means navigating CPGRAMS forms in English, with no follow-up and no teeth.

The accountability data *exists* - in tender records, contractor licences, DLP
(Defect Liability Period) clauses, and officer ledgers - but it is **scattered, opaque,
and never put in front of the person standing next to the pothole.**

## 💡 What RoadWatch does

RoadWatch collapses that entire accountability chain into a **single conversational
flow**, in the citizen's own language:

> 📸 *Citizen uploads / shoots a photo of a bad road* →
> 📍 *App snaps it to the exact road via GPS + EXIF* →
> 🧠 *AI builds a "dossier": contractor, tender, budget vs norm, warranty status, responsible officer* →
> 📝 *AI drafts a complaint citing the actual engineering clauses (IRC / MoRTH / DLP)* →
> 🚦 *Files it, tracks the SLA, and auto-escalates up the officer ladder if breached.*

Everything is rendered as **themed, glanceable cards** inside the chat - not walls of
text - so a non-technical citizen understands *exactly* who is accountable and what
happens next.

---

## ✨ Key features

### 👤 For the citizen
- **Chat-first interface** - ask about any road in plain English, हिंदी, or தமிழ்.
- **Photo → road attribution** - upload a photo or capture live; we read EXIF GPS,
  snap to the nearest road (OSRM), and reverse-geocode it (Nominatim). No GPS? Gemini
  Vision reads signage/script to guess the locality.
- **Live GPS report flow** with a transparent **reasoning trace** - the app *shows its
  work* as it resolves your road, builds the dossier, and finds the contractor.
- **Accountability dossier cards**:
  - 🏗️ **Attribution** - road class, last relaying date, contractor, DLP/warranty status
  - 💰 **Budget** - sanctioned vs spent, ₹/km vs MoRTH norm, tender ID
  - 👔 **Officer** - the responsible officer + the full escalation ladder
  - 📋 **Complaint** - multilingual AI draft citing IRC SP-16 / MoRTH 5.3 / DLP clauses
  - 🚦 **Tracking** - ticket, SLA timer, escalation path, timeline
  - 📉 **True cost** - fuel, CO₂, time, and ₹/day cost-of-inaction for the stretch
  - 🩸 **Crash history** & 🌧️ **Monsoon forecast** for the stretch
- **Complaint filing** routed to **CPGRAMS** with a 30-day SLA and auto-escalation framing.
- **Offline-ready PWA** - installable, works with no network, queues complaints, and
  caches district road data for lookups in low-connectivity areas.

### 🏛️ For the administrator (`/admin`)
- District-style command dashboard: **open complaints, SLA breaches, ₹ cost-of-inaction,
  top contractor**, a complaints table, a defect cost heatmap, and a contractor scorecard.

### 🌐 Cross-cutting
- **Tri-lingual** UI (English / Hindi / Tamil) with the LLM replying in the user's language.
- **Secure auth** via Clerk - protected routes, hosted sign-in/sign-up.
- **Demo mode ↔ Live mode** toggle (see below).

---

## 🏗️ Architecture

```
                         ┌──────────────────────────────────────────────┐
                         │           Browser  (PWA, installable)         │
                         │                                              │
   📸 photo / 💬 text →  │   Next.js 14 App Router  +  React 18  +  TS   │
                         │   Tailwind UI · Leaflet map · i18n (en/hi/ta) │
                         │   Service Worker · IndexedDB (offline cache + │
                         │   complaint queue)                            │
                         └───────────────┬──────────────────────────────┘
                                         │  Clerk auth (middleware-guarded)
                         ┌───────────────▼──────────────────────────────┐
                         │        Next.js API routes  (/app/api/*)       │
                         │                                              │
                         │  /chat · /identify-road   →  Google Gemini   │
                         │  /locate                  →  OSRM + Nominatim │
                         │  /match-contractor        →  contractor DB    │
                         │  /chats /messages         →  chat history     │
                         │  /complaints /upload-photo→  complaints + img │
                         │  /district                →  offline cache feed│
                         └───────────────┬──────────────────────────────┘
                                         │
              ┌──────────────────────────┼───────────────────────────┐
              ▼                          ▼                           ▼
     🤖 Google Gemini         🗄️ Supabase Postgres          🗺️ OSRM + Nominatim
     (2.5 Flash, text+vision)  + Storage bucket               (snap-to-road +
                               (chats, complaints,             reverse geocode)
                                contractors, officers)

   Optional: set NEXT_PUBLIC_AI_BACKEND_URL to route /chat + /identify-road to an
   external FastAPI service instead of the in-app Gemini routes (graceful fallback).
```

---

## 🧰 Tech stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) · React 18 · TypeScript 5.5 |
| **Styling** | Tailwind CSS 3 - warm-minimal design system (`paper` / `ink` / `muted` / `line` / `accent`) |
| **AI / LLM** | Google Generative AI - **Gemini 2.5 Flash** for chat **and** vision |
| **Auth** | **Clerk** (`@clerk/nextjs`) - middleware-protected routes |
| **Database** | **Supabase** Postgres (RLS enabled) + Supabase Storage (`roadwatch-photos`) |
| **Maps** | Leaflet + OpenStreetMap tiles |
| **Geo** | OSRM `/nearest` (snap-to-road) · Nominatim (reverse geocode) |
| **EXIF GPS** | `exifr` |
| **Offline / PWA** | Service Worker + IndexedDB (district cache + offline complaint queue) |
| **Testing** | Vitest + happy-dom |
| **Deploy** | Vercel |

---

## 🔬 How the "magic" works

### 1 - Photo → exact road
`exifr` pulls GPS from the photo's EXIF → if found, the **Leaflet `LocationPicker`**
pre-pins it (user can adjust or skip) → `/api/locate` calls **OSRM** to snap the point
to the nearest road centreline, then **Nominatim** to reverse-geocode a human address.
No EXIF and no pin? `/api/identify-road` sends the image to **Gemini Vision**, which
reads signage and script to return a confidence-scored locality guess.

### 2 - Reasoning trace + dossier
The live report flow streams a **step-by-step reasoning trace** ("locating… snapping to
road… matching contractor…") so the citizen sees the system *think*. It resolves to a
**contractor dossier** (`lib/dossier.ts`) - road class, tender, contractor, sanctioned
vs spent, ₹/km vs norm flag, DLP status, responsible officer + escalation ladder.

### 3 - Conversational LLM with structured cards
`/api/chat` calls Gemini with a system prompt that forces a **strict JSON** response of
`{ reply, card }`, where `card ∈ attribution | budget | officer | complaint | tracking |
cost | crash | monsoon | none`. The card kind deterministically selects which themed
React card renders below the message - so the LLM drives *content*, not layout.
If the model call fails, a **keyword matcher fallback** still picks a sensible card.

### 4 - Complaint, SLA & escalation
The complaint card produces a **multilingual draft** with **engineering-clause citations**
(IRC SP-16, MoRTH 5.3, DLP). Filing routes to CPGRAMS framing, opens a tracking card with
an **SLA timer and escalation ladder**, and - offline - the complaint is **queued in
IndexedDB and flushed when connectivity returns.**

---

## 🛡️ What we took care of (engineering quality)

This is where RoadWatch goes beyond a demo:

- **🌍 Internationalisation** - full UI string catalogue for **English / Hindi / Tamil**
  (`lib/i18n.ts`); the LLM is instructed to answer in the user's language.
- **📶 Offline-first PWA** - installable manifest + service worker (`public/sw.js`) caches
  the app shell; **IndexedDB** caches district road data for offline lookups and **queues
  complaints** filed with no network, auto-syncing on reconnect.
- **🔀 Demo mode ↔ Live mode** - a single toggle. **Demo** runs entirely client-side from
  seeded sample data (zero DB writes - safe for a stage demo). **Live** persists chats,
  messages, complaints and photo uploads to Supabase.
- **🔐 Authentication** - Clerk-guarded routes via `middleware.ts`; hosted, themed
  sign-in / sign-up pages with a split brand layout.
- **🧯 Graceful degradation** - every external dependency has a fallback: Gemini failure →
  keyword card matcher; no GPS → vision-based guess; offline → IndexedDB queue; no AI
  backend → in-app Gemini routes.
- **♿ Accessibility & responsiveness** - semantic roles, `aria-*` on interactive controls,
  keyboard-dismissable menus/modals, and a mobile-first responsive layout throughout.
- **🔏 Security posture** - secrets are server-only and **never committed** (`.env*`,
  `.vercel/` git-ignored); Supabase **RLS is enabled**; service keys live exclusively in
  server-side API routes.
- **✅ Tests** - Vitest unit suites for the trickiest logic: dossier resolution, EXIF
  location parsing, image validation, and location lookup.
- **🧩 Clean separation** - pure logic in `lib/`, presentational cards in
  `components/chat/cards/`, network behind `/app/api/*`, so each piece is independently
  testable.

---

## 📁 Project structure

```
app/                          ← repository root (Next.js App Router)
├── app/
│   ├── page.tsx              # citizen chat surface (default route)
│   ├── admin/                # district dashboard
│   ├── complaints/           # complaint list + detail
│   ├── sign-in/ · sign-up/   # Clerk auth pages
│   └── api/                  # 9 server routes (see below)
├── components/
│   ├── chat/                 # Chat orchestrator, Composer, Message, ReasoningTrace
│   │   └── cards/            # 9 themed accountability cards
│   ├── admin/                # command bar + dashboard widgets
│   ├── CameraModal · LocationPicker · GpsModal · DemoToggle · LanguageSwitcher …
├── lib/
│   ├── dossier.ts            # contractor dossier resolver  (+ test)
│   ├── exifLocation.ts       # EXIF GPS extraction          (+ test)
│   ├── imageValidation.ts    # upload guards                (+ test)
│   ├── locationLookup.ts     # OSRM/Nominatim resolve       (+ test)
│   ├── offlineCache.ts · offlineQueue.ts · idb.ts   # PWA offline layer
│   ├── aiBackend.ts          # optional FastAPI backend switch
│   ├── i18n.ts               # en / hi / ta string catalogue
│   ├── sampleData.ts         # demo-mode seed data
│   └── supabase*.ts · geo.ts · types.ts · format.ts …
├── db/schema.sql             # idempotent Postgres schema + seed
├── scripts/seed.mjs          # data seeder
├── public/                   # manifest, service worker, icons, hero imagery
└── middleware.ts             # Clerk route protection
```

### API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/chat` | POST | Gemini text chat → `{ reply, card }` JSON |
| `/api/identify-road` | POST | Gemini Vision over a photo → locality guess |
| `/api/locate` | POST | OSRM snap-to-road + Nominatim reverse-geocode |
| `/api/match-contractor` | POST | Contractor / contract / officer lookup |
| `/api/district` | GET | District road data (feeds the offline cache) |
| `/api/upload-photo` | POST | Photo → Supabase Storage, returns public URL |
| `/api/chats` | GET/POST | List / create chat sessions |
| `/api/messages` | GET/POST | List / insert chat messages |
| `/api/complaints` `[/id]` | GET/POST | Complaint list (+ admin `?all=1`) & detail |

### Data model (`db/schema.sql`)
`chats` · `messages` · `contractors` · `contracts` · `officers` ·
`complaints` · `complaint_photos` · `complaint_events` - with RLS enabled and a public
`roadwatch-photos` storage bucket.

---

## 🚀 Getting started

```bash
cd app
npm install

# create .env.local with the values below
npm run dev          # → http://localhost:3000

npm test             # run the Vitest suites
npm run build        # production build
```

### Environment variables (`.env.local`)

```bash
# AI - Google Gemini (server-side)
GEMINI_API_KEY=

# Optional: route /chat + /identify-road to an external FastAPI backend.
# Leave empty to use the in-app Gemini routes.
NEXT_PUBLIC_AI_BACKEND_URL=

# Supabase (live mode)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_SECRET_KEY=

# Clerk auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

> In **demo mode** the Supabase variables are unused - only `GEMINI_API_KEY` is needed
> for live chat replies. Apply `db/schema.sql` in the Supabase SQL editor to enable
> live mode.

---

## 🧭 Demo data & honesty

We are deliberately transparent about what is **production-wired** vs **demo-staged**, so
the jury can trust every claim:

- **Real & wired:** photo → EXIF GPS → OSRM snap → Nominatim address; Gemini chat &
  vision; Supabase persistence (live mode); Clerk auth; offline queue/cache; i18n.
- **Deterministic demo:** to keep the stage narrative stable and verifiable, any uploaded
  photo resolves to one canonical contractor dossier (OMR Service Rd, Chennai) - **but the
  GPS coordinates shown are the device's real, live coordinates.** Budget / crash / monsoon
  / cost figures on the cards are seeded illustrative data.

This honesty is baked into the repo (`CURRENT_STATE.md` documents exact scope).

## 🛣️ Roadmap

- Real CPGRAMS / e-MARG submission API + live `CP-####` ticket generation
- YOLOv8 defect classifier (severity from the photo)
- Live tender/DLP ingestion so every road resolves to *its own* dossier
- Auto-escalation cron that actually ticks the SLA ladder
- Voice in/out (Bhashini ASR/TTS) + 4 more Indian languages
- Real crash data (iRAD/NCRB) and blackspot overlays

---

<div align="center">

**RoadWatch** - putting the accountability chain in the hands of the citizen next to the pothole.

</div>
