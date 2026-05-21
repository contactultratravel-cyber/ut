@echo off
chcp 65001 >nul
title Ultra Travel - Lanceur

:: ─── Vérifier Node.js ────────────────────────────────────────
node --version >nul 2>&1
if %errorlevel% neq 0 (
    cls
    echo.
    echo  Node.js n'est pas installe !
    echo  Va sur https://nodejs.org et installe-le, puis relance.
    pause
    exit
)

:: ─── Créer .env si absent ────────────────────────────────────
if not exist "%~dp0backend\.env" (
    if exist "%~dp0backend\.env.example" (
        copy "%~dp0backend\.env.example" "%~dp0backend\.env" >nul
    )
)

:: ─── Installer dépendances si besoin ─────────────────────────
if not exist "%~dp0backend\node_modules\express" (
    echo Installation backend en cours...
    cd /d "%~dp0backend"
    call npm install
)

if not exist "%~dp0frontend\node_modules\react" (
    echo Installation frontend en cours...
    cd /d "%~dp0frontend"
    call npm install
)

:: ─── Tuer les anciens processus sur les ports 4000 et 5173 ────
for /f "tokens=5" %%a in ('netstat -aon ^| find ":4000 "') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173 "') do taskkill /f /pid %%a >nul 2>&1

:: ─── Lancer Backend ───────────────────────────────────────────
cd /d "%~dp0backend"
start "Backend - Ultra Travel" cmd /k "title Backend - Ultra Travel && npm run dev"

:: ─── Attendre que le backend soit prêt ────────────────────────
echo Demarrage du backend...
timeout /t 5 /nobreak >nul

:: ─── Lancer Frontend ──────────────────────────────────────────
cd /d "%~dp0frontend"
start "Frontend - Ultra Travel" cmd /k "title Frontend - Ultra Travel && npm run dev"

:: ─── Attendre que le frontend soit prêt ───────────────────────
echo Demarrage du frontend...
timeout /t 8 /nobreak >nul

:: ─── Ouvrir le navigateur ─────────────────────────────────────
start http://localhost:5173

cls
echo.
echo  ============================================================
echo   APPLICATION EN MARCHE !
echo  ============================================================
echo.
echo   Lien :      http://localhost:5173
echo.
echo   Email    :  admin@ultratravel.com
echo   Password :  Admin@1234
echo.
echo  ============================================================
echo.
echo  IMPORTANT : Ne ferme PAS les fenetres "Backend" et "Frontend"
echo  Cette fenetre peut etre fermee.
echo.
pause >nul
