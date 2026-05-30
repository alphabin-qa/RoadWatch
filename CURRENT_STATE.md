# RoadWatch — what the application currently does

This file describes the state of the codebase as it stands today, not the full
hackathon blueprint. For the long-term vision (F1–F13, ML, Bhashini, offline
SLM, cross-country, dashboards), see `../project-description/README.md`.

## One-line summary

A Next.js 14 PWA that lets a citizen open a chat, upload or shoot a photo of a
bad road, drop a pin on a map, and get back a Gemini-generated reply plus a
themed "card" (road attribution, budget, officer, draft complaint, tracking,
etc.) — with chats and complaints persisted to Supabase in live mode, or kept
purely client-side in demo mode.

## Tech stack actually wired up

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (app router) + React 18 + TypeScript |
| Styling | Tailwind 3 — warm minimal palette (`paper`, `ink`, `muted`, `line`, `accent`) |
| LLM | Google Generative AI SDK (`gemini-2.5-flash-lite`) for chat + vision |
| DB | Supabase Postgres (anon, open RLS) |
| Storage | Supabase Storage bucket `roadwatch-photos` |
| Maps | Leaflet + OpenStreetMap tiles |
| Geocoding | OSRM `/nearest` (snap to road) + Nominatim reverse-geocode |
| EXIF GPS | `exifr` |
| Tests | Vitest + happy-dom |
| PWA | `public/manifest.json` + icon, no service worker yet |

The blueprint mentions FastAPI, PostGIS, YOLOv8, Gemma-2B, Bhashini, IndicTrans2,
ChromaDB, MapLibre, WhatsApp bot — **none of those are in this codebase**. The
app is Next.js end-to-end, with Gemini doing the LLM/vision work.

## Routes

| Route | What it renders |
|---|---|
| `/` | Citizen chat surface (default). `?chat=<uuid>` hydrates an existing chat. |
| `/complaints` | List of complaints filed by the current browser session (or seeded sample list in demo mode). |
| `/complaints/[id]` | Single complaint detail page. |
| `/admin` | District-style dashboard (KPIs, complaints table, cost heatmap, contractor scorecard). |

There is no `/report`, `/stretch/demo`, or `/complaint/demo` page despite what
the in-app `app/README.md` says — those have been replaced by the chat-centric
flow.

## Two modes: demo vs live

`lib/demoMode.ts` exposes a global flag (toggled from the UI via
`components/DemoToggle.tsx`).

- **Demo mode**: everything reads from `lib/sampleData.ts`. Three seeded
  complaints (CP-18342, CP-18201, CP-17988), four seeded chats, one fixed
  "stretch" (OMR Service Rd, Chennai). No network calls to Supabase. Photo
  uploads stay as in-memory blob URLs. Gemini is still called for the chat
  reply, so an API key is needed even in demo for live replies.
- **Live mode**: chats, messages, complaints, and photo uploads round-trip
  through Supabase via the API routes below.

## The chat flow (the heart of the app)

`components/chat/Chat.tsx` is the orchestrator. The user can either type or
attach an image.

### Text path

1. User types in `Composer`.
2. Optimistic message added; assistant placeholder added.
3. POST `/api/chat` → Gemini with a system prompt that pins it to a single demo
   stretch (OMR Service Rd, Chennai) and forces a strict JSON response of
   `{ reply, card }` where `card` ∈ `attribution | budget | officer | complaint
   | tracking | cost | crash | monsoon | none`.
4. The picked card kind drives which themed React card (`components/chat/cards/*`)
   renders below the assistant message.
5. In live mode both the user message and assistant reply (with `card_kind`)
   get persisted via POST `/api/messages`, after lazily creating a chat row via
   POST `/api/chats`.

If the API call fails, a keyword matcher in `lib/sampleData.ts#pickCard` picks
a card and a canned message is shown.

### Photo path

1. `validateImage` checks size/type.
2. `readGpsFromFile` (`exifr`) attempts to pull GPS out of EXIF.
3. `LocationPicker` opens a Leaflet map. If EXIF gave a pin, it pre-pins;
   otherwise the user can drop a pin or skip.
4. On confirm with a location → POST `/api/locate`:
   - Calls OSRM `nearest` to snap to the road.
   - Calls Nominatim to reverse-geocode the snapped point.
   - Returns `{ display, roadName, address, snapped }`.
   - The chat shows an "attribution" card and persists the resolved address.
5. On confirm with **no location** → POST `/api/identify-road`: Gemini Vision
   reads any signage/script and returns confidence + best-guess
   state/locality. The reply is shown but no attribution is forced.
6. In live mode the file is also POSTed to `/api/upload-photo` which uploads
   to the `roadwatch-photos` Supabase bucket and returns a public URL stored
   on the message row.

## Cards (`components/chat/cards/*`)

All cards currently read from the same hardcoded `stretch` object in
`lib/sampleData.ts` — they do not yet render data resolved from the actual
photo/location.

- **AttributionCard** — road class, last relay date, contractor, DLP status.
- **BudgetCard** — sanctioned vs spent, ₹/km vs norm flag, tender ID.
- **OfficerCard** — current responsible officer + escalation ladder.
- **ComplaintCard** — multilingual draft (en/hi/ta), citation chips
  (IRC SP-16, MoRTH 5.3, DLP), "File" button which fires a
  `rw:filed-complaint` window event. The chat listens and appends a
  `tracking` card. **Today this only updates the UI** — it does not call any
  CPGRAMS API, does not insert a row into the `complaints` table, and does
  not generate a `CP-####` ID.
- **TrackingCard** — fake timeline + SLA timer + escalation visualisation.
- **CrashCard** — fatalities/injuries from the seeded `stretch.crashes` object.
- **CostCard** — fuel L/day, CO₂ kg, noise events, ₹/day cost-of-inaction
  (all hardcoded).
- **MonsoonCard** — current pothole dimensions vs forecast (hardcoded).

## API routes (`app/api/*`)

| Route | Method | What it does |
|---|---|---|
| `/api/chat` | POST | Gemini text chat, returns `{reply, card}` JSON. |
| `/api/identify-road` | POST | Gemini Vision over a base64 photo, returns visible-clue based location guess. |
| `/api/locate` | POST | OSRM snap-to-road + Nominatim reverse geocode. |
| `/api/upload-photo` | POST | Multipart upload → Supabase Storage, returns public URL. |
| `/api/chats` | GET/POST | List chats by `session_id`; create a chat row. |
| `/api/messages` | GET/POST | List messages by `chat_id`; insert a message. |
| `/api/complaints` | GET (also `?all=1` for admin) / POST | List session complaints or all complaints; (insert path exists for future). |
| `/api/complaints/[id]` | GET | Single complaint. |
| `/api/match-contractor` | POST | Best-effort contractor / contract / officer lookup from city + state + road name + road class against seeded Supabase rows. |

## Database schema (`db/schema.sql`)

Idempotent SQL applied via the Supabase SQL editor. Tables:

- `chats`, `messages` — anonymous browser-session-keyed chat history.
- `contractors`, `contracts`, `officers` — seeded with ~6 SEED contractors
  across Chennai/Surat/Ahmedabad and a 5-rank officer ladder per city. One
  contract has a real-looking pattern (`omr|service`) so the OMR demo lights
  up via `/api/match-contractor`.
- `complaints`, `complaint_photos`, `complaint_events` — citizen complaint
  schema with snapped lat/lng, enriched address, attributed contractor /
  contract, escalation rank, SLA, timeline events. **Insertion code is not
  fully wired in the chat flow yet** — the schema is there ahead of the UI.
- Storage bucket `roadwatch-photos` (public read, anon insert).
- RLS enabled but with fully open anon policies (hackathon grade).

## Internationalisation

`lib/i18n.ts` carries strings for **English, Hindi, and Tamil** only (the
blueprint promises seven). The locale is held in component state on each
page; `LanguageSwitcher` updates it. The Gemini system prompt instructs the
model to reply in the user's last-message language regardless.

## Admin (`/admin`)

`AdminCommandBar` plus four widgets in `components/admin/Widgets.tsx`:

- `KPIRow` — open complaints, SLA breaches, ₹ cost-of-inaction, top
  contractor. Demo numbers are hardcoded; live mode pulls counts from
  `/api/complaints?all=1`.
- `ComplaintsTable` — first 8 complaints from the API.
- `CostHeatmap` — illustrative SVG only.
- `ContractorScorecard` — illustrative table only.

## What is NOT yet built (vs the blueprint)

For honesty about scope — none of the following are implemented:

- Offline / PWA service worker, on-device SLM, district-cache.
- YOLOv8 defect classifier or any vision model beyond Gemini's reading of
  signage in `/api/identify-road`.
- Real CPGRAMS / Rajmargayatra / e-MARG submission. The "File" button is UI
  only and does not insert into the `complaints` table.
- Bhashini ASR/TTS or IndicTrans2 — no voice input/output.
- Auto-escalation timer/cron. Escalation ladders render but don't tick.
- Real crash data (iRAD/NCRB), real blackspot data, real RSAs.
- Monsoon / degradation ML model (F12) — the monsoon card shows a static
  before/after.
- Hidden-cost calculator (F13) is a static card, not a model output.
- Cross-country (Nepal/Bangladesh/Sri Lanka) stub.
- WhatsApp bot.
- 4 of the 7 promised languages (Telugu, Kannada, Marathi, Bengali).

## How to run

```bash
cd app
npm install
# .env.local needs:
#   GEMINI_API_KEY=...
#   NEXT_PUBLIC_SUPABASE_URL=...
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
#   SUPABASE_SERVICE_ROLE_KEY=...   (server-side admin client)
npm run dev      # http://localhost:3000
npm test         # vitest run
```

In demo mode the Supabase env vars are unused; only `GEMINI_API_KEY` matters
for live chat replies.
