#!/bin/sh
set -e # Set -e option to exit the script if any command fails

echo "🗃️ Running database migrations..."

npx prisma migrate deploy

# Check the exit status of the migration command (0 means success)
if [ $? -ne 0 ]; then
    echo "❌ Database migration failed! Review connection or migration files."
    # If migration fails, the container deployment should halt.
    exit 1
fi
echo "✅ Database migrations completed successfully."


echo "🚀 Starting Node.js server..."

exec node dist/server.js