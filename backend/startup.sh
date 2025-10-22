#!/bin/sh
set -e # Set -e option to exit the script if any command fails

# 1. Run database migrations
echo "🗃️ Running database migrations..."
npx prisma migrate deploy

# 2. Start the application
echo "🚀 Starting Node.js server..."
node dist/server.js