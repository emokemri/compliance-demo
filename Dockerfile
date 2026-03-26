# ── Stage 1: build Next.js frontend ──────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN mkdir -p /frontend/public
RUN npm run build

# ── Stage 2: combined runtime ─────────────────────────────────────────────────
FROM python:3.11-slim

# Install Node.js 20 + supervisord
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
        supervisor \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# ── Backend ───────────────────────────────────────────────────────────────────
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./

# ── Frontend ──────────────────────────────────────────────────────────────────
WORKDIR /app/frontend
COPY --from=frontend-builder /frontend/.next/standalone ./
COPY --from=frontend-builder /frontend/.next/static ./.next/static

# ── Supervisord config ────────────────────────────────────────────────────────
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 3000 8000

ENV NODE_ENV=production

CMD ["supervisord", "-n", "-c", "/etc/supervisord.conf"]
