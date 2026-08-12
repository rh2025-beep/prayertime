@echo off
setlocal enabledelayedexpansion
echo =========================================
echo   Building Prayer Time App APK...
echo =========================================
echo.

:: Detect JAVA_HOME if missing
if "%JAVA_HOME%"=="" (
    echo Searching for Java / Android Studio JDK on your system...
    
    if exist "C:\Program Files\Android\Android Studio\jbr" (
        set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    ) else if exist "C:\Program Files\Android\Android Studio\jre" (
        set "JAVA_HOME=C:\Program Files\Android\Android Studio\jre"
    ) else (
        for /d %%d in ("C:\Program Files\Java\jdk*") do set "JAVA_HOME=%%d"
        if "!JAVA_HOME!"=="" (
            for /d %%d in ("C:\Program Files\Eclipse Adoptium\jdk*") do set "JAVA_HOME=%%d"
        )
        if "!JAVA_HOME!"=="" (
            for /d %%d in ("C:\Program Files\Microsoft\jdk*") do set "JAVA_HOME=%%d"
        )
        if "!JAVA_HOME!"=="" (
            for /d %%d in ("C:\Program Files\Amazon Corretto\jdk*") do set "JAVA_HOME=%%d"
        )
    )
)

if not "!JAVA_HOME!"=="" (
    echo Found Java at: !JAVA_HOME!
    set "PATH=!JAVA_HOME!\bin;!PATH!"
) else (
    echo ERROR: Could not automatically locate JDK or Android Studio JBR.
    echo Please install JDK 17 / Android Studio or set JAVA_HOME.
    pause
    exit /b 1
)

echo.
cd /d "C:\antigravity\Prayer time project"
echo Step 1: Building Vite assets ^& Syncing Capacitor...
call npm run sync
if %ERRORLEVEL% NEQ 0 (
    echo Error during npm run sync!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Step 2: Building Android APK with Gradle...
cd /d "C:\antigravity\Prayer time project\android"
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo Error during Gradle APK build!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo =========================================
echo SUCCESS! APK successfully generated at:
echo %CD%\app\build\outputs\apk\debug\app-debug.apk
echo =========================================
pause
