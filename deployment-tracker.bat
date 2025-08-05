@echo off
chcp 65001 >nul
title Zinga Linga Deployment Tracker

echo.
echo 🚀 مرحباً بك في متتبع نشر Zinga Linga
echo ====================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً
    echo 🔗 https://nodejs.org/
    pause
    exit /b 1
)

REM Check if deployment-tracker.js exists
if not exist "deployment-tracker.js" (
    echo ❌ ملف deployment-tracker.js غير موجود
    echo 📁 تأكد من وجودك في مجلد المشروع الصحيح
    pause
    exit /b 1
)

echo 🔄 تشغيل متتبع النشر...
echo.

REM Run the deployment tracker
node deployment-tracker.js

echo.
echo 👋 شكراً لاستخدام متتبع النشر!
pause