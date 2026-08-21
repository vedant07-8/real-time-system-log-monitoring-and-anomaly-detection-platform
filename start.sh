#!/bin/bash

echo "========================================"
echo " IT System Log Analyzer - SIH1408"
echo "========================================"
echo ""

# Start backend in background
echo "Starting Backend Server..."
cd backend
python main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 3

# Start frontend
echo "Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo " Servers Starting..."
echo "========================================"
echo ""
echo " Backend:  http://localhost:8000"
echo " Frontend: http://localhost:3000"
echo ""
echo " Open http://localhost:3000 in your browser"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
