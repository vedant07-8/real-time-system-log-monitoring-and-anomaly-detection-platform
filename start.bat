@echo off
echo Starting IT System Log Analyzer Backend and Frontend...

start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm run dev"

echo Both services are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
