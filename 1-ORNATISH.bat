@echo off
chcp 65001 >nul
title Pizza Cubick - Paketlarni o'rnatish

echo ================================================
echo   1. Backend paketlari o'rnatilmoqda...
echo ================================================
cd /d "%~dp0backend"
call npm install

echo.
echo ================================================
echo   2. Baza jadvallari yaratilmoqda...
echo ================================================
call npx prisma db push

echo.
echo ================================================
echo   3. Pizzalar bazaga yozilmoqda (seed)...
echo ================================================
call npm run db:seed

echo.
echo ================================================
echo   4. Mini App paketlari o'rnatilmoqda...
echo ================================================
cd /d "%~dp0miniapp"
call npm install

echo.
echo ================================================
echo   5. Admin Panel paketlari o'rnatilmoqda...
echo ================================================
cd /d "%~dp0admin"
call npm install

echo.
echo ================================================
echo   TAYYOR! Endi 2-ISHGA-TUSHIRISH.bat ni oching
echo ================================================
pause
