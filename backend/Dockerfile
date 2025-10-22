# -------------------------------------------------------------------
# Express Backend Multi-Stage Dockerfile (Optimized for Production)
# Builds TypeScript and uses a small runtime image.
# -------------------------------------------------------------------

# STAGE 1: Builder (Build & Compile)
FROM node:20-alpine AS builder
WORKDIR /app

# Install system dependencies required by Prisma/Node binaries (e.g., OpenSSL)
RUN apk update && apk add --no-cache openssl bash curl

# Copy package files for dependency caching
COPY package.json package-lock.json ./
RUN npm install

# --- MANDATORY PRISMA STEP ---
# Explicitly generate the Prisma Client for the production environment
RUN npx prisma generate
# -----------------------------

# Copy source code and the startup script
COPY . .
COPY startup.sh ./startup.sh

# Run TypeScript compilation: creates dist/server.js
RUN npm run build

# -------------------------------------------------------------------
# STAGE 2: Runner (Production)
# Runs the compiled JavaScript with a lean Node runtime and non-root user.
# -------------------------------------------------------------------
FROM node:20-slim AS runner

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

# Security: Create and use a non-root user
RUN groupadd --system nodeuser && useradd --system --gid nodeuser nodeuser
USER nodeuser
WORKDIR /app

# Copy essential runtime files from the builder stage
# 1. Compiled JavaScript code
COPY --from=builder /app/dist ./dist

# 2. Node modules (includes Prisma Client)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 3. Startup script and configuration files
COPY --from=builder /app/startup.sh ./startup.sh
RUN chmod +x ./startup.sh # Make the script executable
COPY --from=builder /app/prisma ./prisma

# Run the startup script when the container launches
CMD ["./startup.sh"]