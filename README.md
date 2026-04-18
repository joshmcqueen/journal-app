# Journal App

Personal daily journaling app. Write entries by date, save to Google Sheets, optionally polish text with Claude.

## Setup

```bash
cp .env.example .env   # then fill in your values (see below)
pnpm install
pnpm dev               # client (Vite :5173) + server (Express :3000)
```

## Environment variables

Copy `.env.example` to `.env` and fill in each value.

### Google credentials

The app uses a Google service account to read/write Sheets. Store the entire key JSON as a single minified env var — no file needed at runtime:

```bash
# Run once from the repo root
cat your-service-account.json | jq -c . | pbcopy
```

`jq -c .` minifies the JSON and handles newline escaping in the private key correctly.

## Docker

Build:

```bash
docker build -t journal-app .
```

Run locally (uses `.env` as the single source of truth):

```bash
docker run --env-file .env -p 3000:3000 journal-app
# opens at http://localhost:3000
```

## Deploying to Dokploy

1. Push to Git — Dokploy detects the `Dockerfile` automatically.
2. Create a new app in Dokploy pointing to the repo.
3. Add environment variables in the Dokploy UI — copy values from your `.env`:
   - `ANTHROPIC_API_KEY`
   - `CLAUDE_MODEL`
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_CREDENTIALS_JSON` — paste the full minified JSON string
4. Map container port `3000` to your domain. Traefik handles SSL.
5. Deploy.
