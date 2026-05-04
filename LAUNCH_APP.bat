@echo off
title EnergiAudit Magic Launcher
echo.
echo  ███████╗███╗   ██╗███████╗██████╗  ██████╗ ██╗ █████╗ 
echo  ██╔════╝████╗  ██║██╔════╝██╔══██╗██╔════╝ ██║██╔══██╗
echo  █████╗  ██╔██╗ ██║█████╗  ██████╔╝██║  ███╗██║███████║
echo  ██╔══╝  ██║╚██╗██║██╔══╝  ██╔══██╗██║   ██║██║██╔══██║
echo  ███████╗██║ ╚████║███████╗██║  ██║╚██████╔╝██║██║  ██║
echo  ╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝╚═╝  ╚═╝
echo.
echo 🚀 Starting EnergiAudit Intelligence Platform...
echo.

:: Start Backend
echo [1/3] Launching Energy Intelligence API...
start "EnergiAudit Backend" cmd /c "cd backend && venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: Start Frontend
echo [2/3] Launching Dashboard Interface...
start "EnergiAudit Frontend" cmd /c "cd frontend && npm run dev"

:: Wait for servers to warm up
echo [3/3] Waiting for systems to initialize...
timeout /t 8 /nobreak > nul

:: Open Browser
echo 🌐 Opening EnergiAudit in your browser...
start http://localhost:5173

echo.
echo ✅ ALL SYSTEMS GO!
echo.
echo 💡 Keep the two terminal windows open while using the app.
echo 💡 Press any key to close this launcher (it won't stop the app).
pause > nul
