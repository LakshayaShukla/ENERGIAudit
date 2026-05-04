@echo off
title EnergiAudit GitHub Syncer
echo.
echo  ☁️  Syncing EnergiAudit with GitHub...
echo.

:: Check for changes
echo [1/3] Gathering changes...
"C:\Program Files\Git\cmd\git.exe" add .

:: Commit changes with a timestamp
set "timestamp=%date% %time%"
echo [2/3] Packing updates...
"C:\Program Files\Git\cmd\git.exe" commit -m "Update: Syncing local changes on %timestamp%"

:: Push to GitHub
echo [3/3] Sending to GitHub (Live)...
"C:\Program Files\Git\cmd\git.exe" push origin main

echo.
echo ✅ ALL SYNCED! Your GitHub is now up to date.
echo.
pause
