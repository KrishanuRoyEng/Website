# STAGE 1: Builder (Build & Compile)
FROM node:20-alpine AS builder
WORKDIR /app

# Install system dependencies required by Prisma/Node binaries (e.g., OpenSSL)
RUN apk update && apk add --no-cache openssl bash curl

# Copy package files for dependency caching
COPY package.json package-lock.json ./
RUN npm install

# Copy the Prisma schema before generating the client
COPY prisma ./prisma/ 

# Explicitly generate the Prisma Client for the production environment
RUN npx prisma generate

# Copy source code and the startup script
COPY . .
COPY startup.sh ./startup.sh

# Run TypeScript compilation: creates dist/server.js
RUN npm run build

FROM node:20-slim AS runner

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Security setup: Create user/group (still running as root)
RUN groupadd --system nodeuser && useradd --system --gid nodeuser nodeuser
WORKDIR /app


# 1. Compiled JavaScript code
COPY --from=builder /app/dist ./dist

# 2. Node modules (includes Prisma Client)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 3. Startup script and configuration files
COPY --from=builder /app/startup.sh ./startup.sh
# Run chmod while running as 'root' to ensure success
RUN chmod +x ./startup.sh

# 4. Copy the Prisma schema (needed if using migrations/studio/etc in the container)
COPY --from=builder /app/prisma ./prisma 

# SECURITY STEP: Change ownership of the app directory and then switch user
# This section MUST run as root (which is the default until USER is called).
RUN chown -R nodeuser:nodeuser /app
USER nodeuser

# Run the startup script when the container launches
CMD ["./startup.sh"]
