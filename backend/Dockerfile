# STAGE 1: Builder (Build & Compile)
FROM node:20-alpine AS builder
WORKDIR /app

# Install system dependencies required by Prisma/Node binaries (e.g., OpenSSL)
RUN apk update && apk add --no-cache openssl bash curl

# Copy package files for dependency caching
COPY package.json package-lock.json ./
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma/ 
# -----------------------------------------------------------

# Explicitly generate the Prisma Client for the production environment
RUN npx prisma generate
# -----------------------------

# Copy source code and the startup script
COPY . .
COPY startup.sh ./startup.sh

# Run TypeScript compilation: creates dist/server.js
RUN npm run build

# STAGE 2: Runner (Production)
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
COPY --from=builder /app/dist ./dist

# 2. Node modules (includes Prisma Client)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 3. Startup script and configuration files
COPY --from=builder /app/startup.sh ./startup.sh
RUN chmod +x ./startup.sh # Make the script executable

# 4. Copy the Prisma schema (needed if using migrations/studio/etc in the container)
COPY --from=builder /app/prisma ./prisma 

# Run the startup script when the container launches
CMD ["./startup.sh"]
