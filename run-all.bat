@echo off
title Resume Analyzer - Launcher
echo Starting Backend and Frontend in separate windows...
start "Resume Analyzer - Backend" "%~dp0run-backend.bat"
timeout /t 3 /nobreak >nul
start "Resume Analyzer - Frontend" "%~dp0run-frontend.bat"
echo Done! Backend running on http://localhost:9090 and Frontend on http://localhost:5173
pause
