#!/bin/bash

# Script to restart both backend and frontend components

echo "Restarting Bunubon application..."

# Stop existing processes
./stop-app.sh

# Wait a moment for processes to terminate
sleep 2

# Start the applications
./start-app.sh