@echo off
title Make admin
cd /d "%~dp0backend"
echo First register an account on the website (http://localhost:5173/register).
echo.
set /p EMAIL=Type the email you registered with and press Enter: 
node make-admin.js "%EMAIL%"
echo.
pause
