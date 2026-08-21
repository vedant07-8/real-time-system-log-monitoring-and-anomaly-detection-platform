@echo off
echo ========================================
echo  IT System Log Analyzer - SIH1408
echo ========================================
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd backend && python main.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo  Servers Starting...
echo ========================================
echo.
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:3000
echo.
echo  Open http://localhost:3000 in your browser
echo ========================================
echo.
pause
