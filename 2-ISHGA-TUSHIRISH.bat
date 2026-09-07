@echo off
chcp 65001 >nul
title Pizza Cubick - Ishga tushirish

echo Backend ishga tushirilmoqda (port 4000)...
start "BACKEND (bot + api)" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 5 >nul

echo Mini App ishga tushirilmoqda (port 5173)...
start "MINI APP" cmd /k "cd /d %~dp0miniapp && npm run dev"

timeout /t 2 >nul

echo Admin Panel ishga tushirilmoqda (port 5174)...
start "ADMIN PANEL" cmd /k "cd /d %~dp0admin && npm run dev"

timeout /t 4 >nul

echo Cloudflare tunnel ochilmoqda va botga ulanmoqda...
start "TUNNEL (Telegram)" cmd /k "cd /d %~dp0 && node tunnel.js"

timeout /t 6 >nul

start http://localhost:5174

echo.
echo ================================================
echo   Mini App     : http://localhost:5173
echo   Admin Panel  : http://localhost:5174
echo   Backend API  : http://localhost:4000
echo   Telegram     : TUNNEL oynasiga qarang
echo ================================================
echo.
echo Ochilgan 4 ta oynani YOPMANG - dastur o'sha yerda ishlaydi.
echo Tunnel manzili botga AVTOMATIK ulanadi, hech narsa yozish shart emas.
echo To'xtatish uchun 3-TOXTATISH.bat faylini oching.
pause
