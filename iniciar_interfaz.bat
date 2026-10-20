@echo off
title WakeDrive - Asistente Anti-Somnolencia al Volante
cd /d "%~dp0"
echo ========================================================
echo   Iniciando WakeDrive HUD para Arduino...
echo ========================================================
echo Abriendo servidor local en http://localhost:8080 ...
echo Abre tu navegador Google Chrome o Microsoft Edge.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
