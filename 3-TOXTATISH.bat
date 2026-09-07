@echo off
chcp 65001 >nul
title Pizza Cubick - To'xtatish

echo Barcha jarayonlar to'xtatilmoqda...

taskkill /F /IM node.exe        >nul 2>&1
taskkill /F /IM cloudflared.exe >nul 2>&1
taskkill /F /IM ngrok.exe       >nul 2>&1

echo.
echo Tayyor. Backend, Mini App, Admin Panel va tunnel to'xtatildi.
timeout /t 3 >nul
