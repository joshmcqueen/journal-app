# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start client (Vite) + server (tsx watch) concurrently
pnpm build        # Build client only (tsc + vite bundle → client/dist/)
pnpm start        # Run production server (serves built client as static files)

# Filter to a single workspace
pnpm --filter server dev    # Server only (port 3000)
pnpm --filter client dev    # Client only (Vite dev server)
pnpm --filter server build  # Compile server TypeScript → server/dist/
```

No lint or test scripts are configured.

## Architecture

**Monorepo** — pnpm workspaces with two packages: `client/` and `server/`.

**Purpose** — Personal daily journaling app. Users navigate a calendar, write entries, save to Google Sheets, and optionally polish text with Claude.

### Client (`client/src/`)
React 18 + TypeScript + Vite. No UI framework — vanilla CSS with a dark warm theme (Cormorant Garamond/Lora fonts, gold accents).

`App.tsx` owns two views: `'calendar'` and `'editor'`. The calendar is the landing page.

- `components/CalendarView.tsx` — 7-column month grid; dot indicators for days with entries; today highlight; prev/next month nav (future months disabled); uses `useMonthEntries`
- `components/JournalEditor.tsx` — textarea + Save + "Polish with AI" buttons; calls `/api/entries/:date` (GET/PUT) and `/api/polish` (POST)
- `components/DatePicker.tsx` — prev/next buttons + HTML date input; blocks future dates
- `components/StatusBar.tsx` — loading/saving/success/error feedback
- `hooks/useJournalEntry.ts` — fetches and persists a single entry, manages status state
- `hooks/useMonthEntries.ts` — fetches `GET /api/entries/month/:yearMonth`; returns the set of dates that have entries (no content)

In dev, Vite proxies `/api/*` to the Express server on port 3000.

### Server (`server/src/`)
Express + TypeScript, ES modules (`"type": "module"`).
- `index.ts` — app setup; mounts routes; in production, serves `client/dist/` as static files with SPA fallback
- `config.ts` — loads `.env` from repo root via dotenv; exports all config values
- `routes/entries.ts` — `GET /api/entries/:date`, `GET /api/entries/month/:yearMonth`, and `PUT /api/entries/:date`
- `routes/polish.ts` — `POST /api/polish` — calls Claude with the journal text; returns `{ text }`
- `services/sheets.ts` — Google Sheets persistence; one tab per year; columns: Date (A) in M/D/YYYY, Notes (B); `getMonthEntries` returns only dates (no content) for calendar dot indicators
- `services/ai.ts` — Anthropic client factory using `@ai-sdk/anthropic`
- `prompts.ts` — loads system prompts from `server/prompts/*.txt` at startup
- `prompts/polish.txt` — system prompt for the polish feature; includes writer context (Josh McQueen, wife Jenn, dog Rossi, San Diego)

### Data Storage
Google Sheets is the sole data store. The `sheets.ts` service auto-creates a sheet tab for each year. Date normalization handles M/D/YYYY, MM/DD/YYYY, and YYYY-MM-DD input formats. New entries append in M/D/YYYY format; existing entries update in-place.

## Deployment
Docker multi-stage build (builder → Node 20 Alpine runtime). Deployed via Dokploy — push to Git, Dokploy builds the image and maps port 3000. No `.env` file in production; env vars set in the Dokploy UI.

```bash
# Local Docker build test
docker build -t journal-app .
docker run -p 3000:3000 --env-file .env journal-app
```

## Environment
`.env` lives at the monorepo root and is loaded by the server. Required variables:
- `ANTHROPIC_API_KEY`
- `CLAUDE_MODEL` (e.g. `claude-sonnet-4-6`)
- `GOOGLE_SHEET_ID`
- `GOOGLE_CREDENTIALS_JSON` (full service account JSON, minified: `cat key.json | jq -c .`)
- `PORT` (default: 3000)
