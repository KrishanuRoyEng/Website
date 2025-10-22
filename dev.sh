#!/bin/bash

# --- Configuration ---
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"

# --- Functions ---

# Function to safely kill background processes
cleanup() {
    echo -e "\n\n👋 Shutting down processes..."
    # Check if PIDs are set and kill them
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null
    fi
    wait # Wait for all background processes to terminate
    echo "✅ Cleanup complete."
}

# Trap to call the cleanup function on script exit (Ctrl+C, etc.)
trap cleanup EXIT

# Function to check for dependencies before starting
check_deps() {
    for dir in "$BACKEND_DIR" "$FRONTEND_DIR"; do
        if [ ! -d "$dir/node_modules" ]; then
            echo "⚠️ '$dir/node_modules' not found. Installing dependencies..."
            (cd "$dir" && npm install)
            if [ $? -ne 0 ]; then
                echo "❌ Failed to install dependencies for '$dir'."
                exit 1
            fi
        fi
    done
}

# --- Main Execution ---

echo "🚀 Starting development environment..."

# 1. Check Dependencies
check_deps

# 2. Start Backend
echo "Starting backend in '$BACKEND_DIR'..."
(cd "$BACKEND_DIR" && npm run dev) &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# 3. Start Frontend
echo "Starting frontend in '$FRONTEND_DIR'..."
(cd "$FRONTEND_DIR" && npm run dev) &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo "✨ Both services are running. Press Ctrl+C to stop."

# 4. Wait for any process to exit
# If one fails, the script will exit and trigger the trap to clean up the other.
wait -n

echo "🛑 One service exited. Shutting down all services."

# The EXIT trap will handle the cleanup here.