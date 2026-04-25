@echo off
title VedhaEduSpark - Starting Servers
echo.
echo  =======================================
echo   VedhaEduSpark - CSE Learning Platform
echo  =======================================
echo.

echo [1/2] Starting Backend Server...
cd /d "%~dp0server"
start "VES-Backend" cmd /k "node server.js"

echo [2/2] Starting Frontend Server...
cd /d "%~dp0client"
start "VES-Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo  Both servers are starting!
echo.
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:5000
echo.
echo  Admin Login:
echo    Email: admin@vedhaeduspark.com
echo    Pass:  admin123
echo ========================================
echo.
timeout /t 5 /nobreak > nul
start http://localhost:5173
