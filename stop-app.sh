#!/bin/bash

# Script to stop both backend and frontend components

echo "Stopping Bunubon application..."

# Read PIDs from files if they exist
if [[ -f backend.pid ]] && [[ -f frontend.pid ]]; then
    BACKEND_PID=$(cat backend.pid)
    FRONTEND_PID=$(cat frontend.pid)
    
    # Kill the processes
    echo "Stopping backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null
    
    echo "Stopping frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null
    
    # Remove PID files
    rm -f backend.pid frontend.pid
    
    echo "Applications stopped successfully!"
else
    echo "PID files not found. Attempting to stop processes by name..."
    
    # Try to kill processes by name
    pkill -f "node.*server.js" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    
    # Remove PID files if they exist
    rm -f backend.pid frontend.pid
    
    echo "Attempted to stop processes by name."
fi