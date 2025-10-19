#!/bin/bash

# Start backend in background
cd backend && npm run dev &
BACKEND_PID=$!

# Start frontend in background
cd frontend && npm run dev &
FRONTEND_PID=$!

# Trap to kill both processes on exit
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

# Wait for both processes
wait
