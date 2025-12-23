@echo off
REM Start both backend and frontend servers

echo ====================================
echo Starting Mini Supermarket System
echo ====================================

REM Check if in correct directory
if not exist "package.json" (
    echo Error: package.json not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo.
echo [1/3] Installing dependencies...
call npm install

echo.
echo [2/3] Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm run dev"

echo.
echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Starting Frontend Server...
start "Frontend Client" cmd /k "cd client && npm run dev"

echo.
echo ====================================
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ====================================
echo.
echo Press any key to close this window...
pause >nul
