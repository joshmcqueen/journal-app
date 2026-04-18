# syntax=docker/dockerfile:1

# ── Builder ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable

# Install deps first (layer-cached until manifests change)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN pnpm install --frozen-lockfile

# Build client (React/Vite → client/dist/)
COPY client/ ./client/
RUN pnpm --filter client build

# Build server (tsc → server/dist/)
COPY server/ ./server/
RUN pnpm --filter server build

# Extract production-only deps for server using pnpm deploy
RUN pnpm --filter server deploy --prod --legacy /deploy

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Production server deps (flat node_modules, no dev tools)
COPY --from=builder /deploy/node_modules ./server/node_modules

# Compiled server
COPY --from=builder /app/server/dist ./server/dist

# Runtime prompt files (loaded from ../prompts relative to server/dist/)
COPY server/prompts ./server/prompts

# Built client (served as static files by Express)
COPY --from=builder /app/client/dist ./client/dist

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

CMD ["/docker-entrypoint.sh"]
