# Aapki Awaaz — Civic Complaint Platform

One app, two very different users:

- **A villager who can't read or type** gets a home screen that's almost entirely icons, color, and voice. Tap the big mic, speak in Hindi or English, tap again, and it's sent. No forms, no menus to get lost in.
- **An MP's staffer / analyst** gets a separate, data-dense "Control Room" — dark UI, live-updating priority rankings, adjustable weighting sliders, hotspot list — reached from a small gear icon, never forced on the villager.

## Run it

```bash
npm install
cp .env.local.example .env.local   # point this at your FastAPI backend
npm run dev
```

Open http://localhost:3000. `NEXT_PUBLIC_API_BASE_URL` should point at the FastAPI service that exposes `/api/submissions`, `/api/hotspots`, and `/api/prioritize` (the backend you shared). If the backend isn't running, the app quietly falls back to local demo data so the UI is still fully explorable.

## Structure

```
app/
  (simple)/            # villager-facing pages, share the bottom nav + light theme
    page.tsx           # home — big mic, category tiles
    report/page.tsx    # record / photo / type -> review -> send flow
    track/page.tsx     # "My Reports" as big color-coded cards
  power/page.tsx        # MP control room — dark, dense, keyboard/mouse friendly
lib/
  api.ts               # talks to the FastAPI backend, with offline demo fallback
  categoryMeta.ts       # solid color + icon per sector (Water, Roads, ...)
  useVoiceCapture.ts     # wraps the Web Speech API for hands-free input
  i18n/                 # Hindi/English strings + a LanguageContext with speech-synthesis playback
components/            # shared UI: MicButton, CategoryTile, BottomNav, LanguageToggle
components/power/       # WeightSliders, PriorityTable, HotspotList for the dashboard
```

## Design notes

- **Palette is solid, not gradient**: marigold `#FFB627`, deep indigo `#1B3A6B`, peacock `#0B6E4F`, clay `#C1440E`, asphalt `#4B4640`, cobalt `#2F6690` on a warm paper background `#F7F4EC`. Each civic category owns one color everywhere in the app (Water is always peacock, Electricity always marigold, etc.) so a non-reader can learn "the green one is water" in one use.
- **Typography**: Baloo 2 (a rounded, high-legibility display face that also covers Devanagari) for anything a villager reads, Inter for body copy and the dashboard, JetBrains Mono for the dashboard's numbers/scores.
- **Signature element**: the oversized mic button with a hard offset shadow and pulsing rings when listening — it's the one interaction a non-literate user needs to understand, so it's the biggest, boldest thing on screen.
- Everything in the villager-facing flow also has a speaker icon that reads text aloud (`speechSynthesis`), and voice input uses the browser's built-in speech recognition (Chrome/Edge/Android WebView support it natively).
- The Control Room is a completely different visual register on purpose — dark, monospace, sliders — because that audience wants density and speed, not hand-holding.

## Known limitations to wire up for production

- Voice input transcribes in the browser (Web Speech API) rather than sending raw audio to the backend, to match the FastAPI contract which expects `text_prompt` as form text. If you'd rather send raw audio to Gemini directly, add an `/api/submissions/audio` endpoint and swap `useVoiceCapture` for `MediaRecorder`.
- `/api/submissions` in the given backend only accepts POST; the frontend's "Track" and "Control Room" pages call `GET /api/submissions` to list reports — add that route to the FastAPI app (return `active_submissions`).
- Map hotspots are shown as a ranked list rather than a literal map; swap in Leaflet/Mapbox in `HotspotList` if you want pins.
