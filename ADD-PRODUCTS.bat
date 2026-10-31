@echo off
title Add 660 products
cd /d "%~dp0backend"
echo This adds 6 categories and 660 products (prices in rupees).
echo Products that already have orders are kept. Others are replaced.
echo.
pause
node seed.js --fresh
echo.
pause
