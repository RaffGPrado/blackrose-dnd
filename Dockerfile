# ─── Stage 1: Build Frontend SPA ──────────────────────────────────────────────
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ─── Stage 2: Production Server (API + WebSocket + SPA) ───────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

ENV NODE_ENV=production
ENV PORT=4000
ENV CARDS_PATH=/app/reference_data/magic_cards

COPY backend/ ./

# Copy compiled frontend from builder into /app/frontend/dist
# (backend/src/index.ts resolves ../../frontend/dist from backend/src)
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Ensure database directory exists
RUN mkdir -p /app/backend/data

# HTTP & WebSocket port
EXPOSE 4000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Start the full-stack server using tsx with native SQLite
CMD ["npm", "run", "start"]
