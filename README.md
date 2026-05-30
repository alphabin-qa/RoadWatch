# RoadWatch — PWA skeleton

Minimal Next.js 14 + Tailwind skeleton for the RoadWatch app. Design style is intentionally sparse — monochrome, thin borders, generous whitespace, OpenAI-style system-sans typography.

## Run

```bash
cd app
npm install
npm run dev
```

Open http://localhost:3000

## Screens

| Route | Purpose |
|---|---|
| `/` | Home + nearby activity |
| `/report` | Camera capture flow (skeleton) |
| `/stretch/demo` | Road attribution + budget + authority |
| `/complaint/demo` | Draft complaint + SLA + file |
| `/dashboard` | Collector / district view |

All screens render placeholder data (`—`). Real data wiring comes later — this is the visual shell only.

## Design tokens

- Background: `#ffffff`
- Ink: `#0d0d0d`
- Muted: `#6e6e80`
- Line: `#ececf1`
- Radius: lg cards, full pills
- Font: system-sans stack (Inter / SF / Segoe fallback)

## PWA

`public/manifest.json` + `public/icon.svg` are wired. Installable from any Chromium/Safari browser once served.
