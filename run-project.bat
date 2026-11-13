@echo off
title CarePoint Hospital Management System Launcher
echo =========================================================================
echo   [HMS] Starting CarePoint Hospital Management System
echo =========================================================================

set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"

echo [1/3] Starting Backend API Server (Port 5000)...
start "HMS Backend - Port 5000" cmd /k "cd /d ""%~dp0backend"" && node server.js"

ping 127.0.0.1 -n 4 >nul

echo [2/3] Starting Frontend React Application (Port 5173)...
start "HMS Frontend - Port 5173" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

ping 127.0.0.1 -n 5 >nul

echo [3/3] Opening Hospital Portal in your web browser...
start http://localhost:5173

echo =========================================================================
echo   CarePoint Hospital Management System is now LIVE!
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:5000
echo =========================================================================
