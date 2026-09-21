@echo off
title Snakes ^& Ladders Server
cd /d "%~dp0"

echo ========================================================
echo         Starting Snakes ^& Ladders Server
echo ========================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo [INFO] Dependencies not found. Running npm install...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

echo [INFO] Server launching at http://localhost:3000
echo [INFO] Press Ctrl+C to stop the server.
echo.

:: Open default browser to the game after a short pause
start "" http://localhost:3000

:: Start server
node server.js

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server stopped with error.
    pause
)
