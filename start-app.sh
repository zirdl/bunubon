#!/bin/bash

# Script to start both backend and frontend components in the background
# Makes the application accessible from other devices on the same network

echo "Starting Bunubon application (accessible from other devices)..."

# Function to clean up PID files on exit
cleanup() {
    rm -f backend.pid frontend.pid
}

# Set trap to clean up PID files on exit
trap cleanup EXIT

# Start backend server in background (already listening on all interfaces via server.js)
echo "Starting backend server (port 5000, accessible from other devices)..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for the backend to start
sleep 2

# Start frontend server in background (already configured in vite.config.ts to listen on 0.0.0.0)
echo "Starting frontend server (port 5173, accessible from other devices)..."
cd ../
HOST=0.0.0.0 npm run dev &
FRONTEND_PID=$!

# Get the local IP address for display
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "Applications started successfully!"
echo "=================================="
echo "Backend:  http://localhost:5000 (PID: $BACKEND_PID)"
echo "Frontend: http://localhost:5173 (PID: $FRONTEND_PID)"
echo ""
if [ ! -z "$LOCAL_IP" ]; then
    echo "From other devices on the same network:"
    echo "  Backend:  http://$LOCAL_IP:5000"
    echo "  Frontend: http://$LOCAL_IP:5173"
    echo ""
fi
echo "API requests from frontend will be proxied to backend automatically."
echo ""

# Save PIDs to files for later stopping if needed
echo "$BACKEND_PID" > backend.pid
echo "$FRONTEND_PID" > frontend.pid

echo "PID files created: backend.pid and frontend.pid"
echo ""
echo "To stop the applications, run one of the following commands:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo "  kill \$(cat backend.pid) \$(cat frontend.pid)"
echo "  Or simply run: pkill -f 'node server.js\\|vite'"