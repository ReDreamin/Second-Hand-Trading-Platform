@echo off
chcp 65001 >nul
title Second-Hand Trading Platform - Backend
echo ========================================
echo   Starting Second-Hand Trading Platform
echo ========================================
echo.

cd /d "%~dp0"
call mvn spring-boot:run -DskipTests

pause
