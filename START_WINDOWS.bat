@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ================================================
echo       VEXUS AI Prompt Vault Pro - Launcher
echo ================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed.
  echo Install Node.js 20 LTS, then run this file again.
  echo.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm was not found. Reinstall Node.js 20 LTS.
  pause
  exit /b 1
)

echo [1/4] Checking environment...
if not exist ".env" (
  copy /Y ".env.example" ".env" >nul
  powershell -NoProfile -Command "$s=[guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N'); (Get-Content .env) -replace '^JWT_SECRET=.*$','JWT_SECRET='+$s | Set-Content .env"
  echo Created .env with a random JWT secret.
)

echo [2/4] Installing dependencies (first run only)...
npm install
if errorlevel 1 (
  echo.
  echo [ERROR] npm install failed.
  pause
  exit /b 1
)

echo [3/4] Creating/updating database and demo data...
node backend\seed.js
if errorlevel 1 (
  echo [WARNING] Seed step returned an error. The server may still start.
)

echo [4/4] Starting VEXUS...
echo.
echo Open your browser at: http://localhost:8787
start "" http://localhost:8787
npm start

endlocal
