# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start client (Vite) + server (tsx watch) concurrently
pnpm build        # Build client only (tsc + vite bundle → client/dist/)
pnpm start        # Run production server (serves built client as static files)

# Filter to a single workspace
pnpm --filter server dev    # Server only (port 3001)
pnpm --filter client dev    # Client only (Vite dev server)
pnpm --filter server build  # Compile server TypeScript → server/dist/
```

No lint or test scripts are configured.

## Architecture

**Monorepo** — pnpm workspaces with two packages: `client/` and `server/`.

**Purpose** — Personal daily journaling app. Users navigate by date, write entries, save to Google Sheets, and optionally polish text with Claude.

### Client (`client/src/`)
React 18 + TypeScript + Vite. The entire UI is a single page:
- `App.tsx` — root; owns selected date state
- `components/DatePicker.tsx` — prev/next buttons + HTML date input; blocks future dates
- `components/JournalEditor.tsx` — textarea + Save + "Polish with AI" buttons; calls `/api/entries/:date` (GET/PUT) and `/api/polish` (POST)
- `components/StatusBar.tsx` — loading/saving/success/error feedback
- `hooks/useJournalEntry.ts` — fetches and persists entries, manages status state

In dev, Vite proxies `/api/*` to the Express server on port 3001.

### Server (`server/src/`)
Express + TypeScript, ES modules (`"type": "module"`).
- `index.ts` — app setup; mounts routes; in production, serves `client/dist/` as static files with SPA fallback
- `config.ts` — loads `.env` from repo root via dotenv; exports all config values
- `routes/entries.ts` — `GET /api/entries/:date` and `PUT /api/entries/:date` (date format: YYYY-MM-DD)
- `routes/polish.ts` — `POST /api/polish` — calls Claude with the journal text
- `services/sheets.ts` — Google Sheets persistence; one tab per year; columns: Date (A) in M/D/YYYY, Notes (B)
- `services/ai.ts` — Anthropic client factory using `@ai-sdk/anthropic`
- `prompts.ts` — loads system prompts from `server/prompts/*.txt`
- `prompts/polish.txt` — system prompt for the polish feature; includes writer context (Josh McQueen, San Diego)

### Data Storage
Google Sheets is the sole data store. The `sheets.ts` service auto-creates a sheet tab for each year. Date normalization handles both M/D/YYYY and YYYY-MM-DD input formats.

## Environment
`.env` lives at the monorepo root and is loaded by the server. Required variables:
- `ANTHROPIC_API_KEY`
- `CLAUDE_MODEL` (e.g. `claude-sonnet-4-6`)
- `GOOGLE_SHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` (path to service account JSON, relative to root)
- `PORT` (default: 3001)
