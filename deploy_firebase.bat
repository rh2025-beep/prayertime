@echo off
echo =========================================
echo   Deploying to Firebase Hosting...
echo =========================================
echo.
cd /d "C:\antigravity\Prayer time project"

echo Step 1: Building production web assets (Vite)...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Error building web assets!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Step 2: Deploying to Firebase Hosting...
call npx -p firebase-tools firebase deploy --only hosting
if %ERRORLEVEL% NEQ 0 (
    echo Error deploying to Firebase Hosting!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo =========================================
echo SUCCESS! Your app is live on Firebase!
echo =========================================
pause
