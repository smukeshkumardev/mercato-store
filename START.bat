@echo off
title Mercato Store Launcher
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Opening the download page.
  echo Install the LTS version, then double-click START.bat again.
  start https://nodejs.org
  pause
  exit /b
)

if not exist "backend\.env" (
  copy "backend\.env.example" "backend\.env" >nul
  echo.
  echo Notepad will open the BACKEND settings.
  echo Change DB_PASS to your MySQL password. Paste your Stripe sk_test key. Then SAVE and CLOSE Notepad.
  pause
  notepad "backend\.env"
)

if not exist "frontend\.env" (
  copy "frontend\.env.example" "frontend\.env" >nul
  echo.
  echo Notepad will open the FRONTEND settings.
  echo Paste your Stripe pk_test key after the = sign. Then SAVE and CLOSE Notepad.
  pause
  notepad "frontend\.env"
)

if not exist "backend\node_modules" (
  echo.
  echo Installing backend packages. This is needed only the first time, please wait...
  pushd backend
  call npm install
  popd
)

if not exist "frontend\node_modules" (
  echo.
  echo Installing frontend packages. This is needed only the first time, please wait...
  pushd frontend
  call npm install
  popd
)

echo.
echo Starting the store. Two black windows will open. Keep them open while you use the site.
start "Mercato BACKEND" /d "%~dp0backend" cmd /k npm run dev
start "Mercato FRONTEND" /d "%~dp0frontend" cmd /k npm run dev

timeout /t 10 >nul
start http://localhost:5173
exit /b
