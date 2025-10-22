FROM node:20-alpine AS builder
WORKDIR /app

# Install system dependencies required by Prisma/Node binaries (e.g., OpenSSL, Bash)
RUN apk update && apk add --no-cache openssl bash curl

# Copy package files for dependency caching
COPY package.json package-lock.json ./
RUN npm install

# Copy Prisma files (schema.prisma and the local migrations folder)
COPY prisma ./prisma/ 

# --- MANDATORY PRISMA STEP (Cross-Compilation Fix) ---
RUN npx prisma generate

# Copy source code and the startup script
COPY . .
COPY startup.sh ./startup.sh

# Run TypeScript compilation: creates dist/server.js
RUN npm run build

# ==============================================================================
# STAGE 2: Runner (Production)
FROM node:20-slim AS runner

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Security: Create the non-root user
RUN groupadd --system nodeuser && useradd --system --gid nodeuser nodeuser

# FIX: Install CA certificates to prevent SSL/TLS handshake failures (P1001/P5000 errors)
RUN apt-get update && apt-get install -y ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Copy essential runtime files from the builder stage
COPY --from=builder /app/dist ./dist

# 2. Node modules (includes Prisma Client and engine binaries)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 3. Startup script
COPY --from=builder /app/startup.sh ./startup.sh

# 4. Copy the entire Prisma directory (schema + migrations folder)
COPY --from=builder /app/prisma ./prisma 

# Run chmod/chown as root (default user) to ensure permissions are set correctly
RUN chmod +x ./startup.sh
RUN chown -R nodeuser:nodeuser /app

# Switch to the non-root user for security
USER nodeuser

# Run the startup script when the container launches
CMD ["./startup.sh"]

