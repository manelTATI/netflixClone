# ==========================================
# Stage 1: Build Frontend (React + Vite)
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Backend Production Dependencies
# ==========================================
FROM node:20-alpine AS backend-deps
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

# ==========================================
# Stage 3: Secure Production Runner
# ==========================================
FROM node:20-alpine AS runner

# Install dumb-init for proper process signal handling
RUN apk add --no-cache dumb-init

# Security: Set production environment
ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app

# Ensure non-root ownership
RUN chown -R node:node /app

# Switch to non-root user for maximum container security
USER node

# Copy backend dependencies and source code
COPY --chown=node:node --from=backend-deps /app/backend/node_modules /app/backend/node_modules
COPY --chown=node:node backend/ /app/backend/

# Copy compiled frontend assets
COPY --chown=node:node --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 5000

WORKDIR /app/backend

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
