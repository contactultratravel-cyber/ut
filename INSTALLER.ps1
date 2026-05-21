# ============================================================
#  Ultra Travel — Script d'installation complète (Windows 11)
#  Lance ce script une seule fois, il installe tout.
# ============================================================

$ErrorActionPreference = "Stop"
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Step($msg) {
    Write-Host ""
    Write-Host "  ► $msg" -ForegroundColor Cyan
}
function Write-OK($msg) {
    Write-Host "  ✓ $msg" -ForegroundColor Green
}
function Write-Warn($msg) {
    Write-Host "  ! $msg" -ForegroundColor Yellow
}

Clear-Host
Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "  ║    ULTRA TRAVEL — Installation complète      ║" -ForegroundColor Blue
Write-Host "  ╚══════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""
Write-Host "  Ce script va installer automatiquement :" -ForegroundColor White
Write-Host "    - Node.js (moteur JavaScript)" -ForegroundColor Gray
Write-Host "    - PostgreSQL (base de données)" -ForegroundColor Gray
Write-Host "    - Toutes les dépendances du projet" -ForegroundColor Gray
Write-Host ""
Write-Host "  DURÉE ESTIMÉE : 5 à 10 minutes selon ta connexion" -ForegroundColor Yellow
Write-Host ""
Read-Host "  Appuie sur ENTRÉE pour commencer"

# ─── 1. Vérifier winget ──────────────────────────────────────
Write-Step "Vérification du gestionnaire de paquets Windows..."
try {
    winget --version | Out-Null
    Write-OK "winget disponible"
} catch {
    Write-Warn "winget non disponible. Installe manuellement Node.js depuis https://nodejs.org"
    Write-Host ""
    Write-Host "  Après installation de Node.js, relance LANCER.bat" -ForegroundColor Yellow
    Read-Host "  Appuie sur ENTRÉE pour ouvrir le site Node.js..."
    Start-Process "https://nodejs.org/en/download"
    exit
}

# ─── 2. Node.js ──────────────────────────────────────────────
Write-Step "Vérification de Node.js..."
$nodeInstalled = $false
try {
    $v = node --version
    Write-OK "Node.js déjà installé ($v)"
    $nodeInstalled = $true
} catch { }

if (-not $nodeInstalled) {
    Write-Step "Installation de Node.js LTS..."
    winget install -e --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    $env:PATH += ";C:\Program Files\nodejs"
    Write-OK "Node.js installé"
}

# ─── 3. PostgreSQL ───────────────────────────────────────────
Write-Step "Vérification de PostgreSQL..."
$pgInstalled = $false
$pgBin = "C:\Program Files\PostgreSQL\16\bin"
$pgBin15 = "C:\Program Files\PostgreSQL\15\bin"

if (Test-Path "$pgBin\psql.exe") {
    Write-OK "PostgreSQL 16 déjà installé"
    $pgInstalled = $true
    $env:PATH += ";$pgBin"
} elseif (Test-Path "$pgBin15\psql.exe") {
    Write-OK "PostgreSQL 15 déjà installé"
    $pgInstalled = $true
    $env:PATH += ";$pgBin15"
}

if (-not $pgInstalled) {
    Write-Step "Installation de PostgreSQL 16..."
    winget install -e --id PostgreSQL.PostgreSQL.16 --silent --accept-package-agreements --accept-source-agreements
    $env:PATH += ";$pgBin"
    Write-OK "PostgreSQL installé"
    Start-Sleep -Seconds 5
}

# ─── 4. Créer la base de données ─────────────────────────────
Write-Step "Configuration de la base de données..."

$pgPassword = "ultratravel_secret"
$env:PGPASSWORD = "postgres"

# Tenter de créer l'utilisateur et la base
$sqlSetup = @"
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ultratravel') THEN
    CREATE USER ultratravel WITH PASSWORD '$pgPassword';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE ultratravel_db OWNER ultratravel'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ultratravel_db')\gexec
"@

try {
    $sqlSetup | & "$pgBin\psql.exe" -U postgres -q 2>$null
    Write-OK "Utilisateur et base créés"
} catch {
    Write-Warn "Impossible de créer la base automatiquement."
    Write-Host ""
    Write-Host "  Fais ces étapes manuellement :" -ForegroundColor Yellow
    Write-Host "  1. Ouvre pgAdmin (installé avec PostgreSQL)" -ForegroundColor White
    Write-Host "  2. Connecte-toi avec le mot de passe postgres" -ForegroundColor White
    Write-Host "  3. Crée un utilisateur 'ultratravel' avec mot de passe 'ultratravel_secret'" -ForegroundColor White
    Write-Host "  4. Crée une base 'ultratravel_db' appartenant à 'ultratravel'" -ForegroundColor White
    Write-Host ""
    Read-Host "  Appuie sur ENTRÉE quand c'est fait..."
}

# Appliquer le schéma
Write-Step "Application du schéma de base de données..."
$env:PGPASSWORD = $pgPassword
try {
    & "$pgBin\psql.exe" -U ultratravel -d ultratravel_db -f "$projectDir\database\schema.sql" -q 2>$null
    & "$pgBin\psql.exe" -U ultratravel -d ultratravel_db -f "$projectDir\database\seed.sql" -q 2>$null
    Write-OK "Schéma et données initiales créés"
} catch {
    Write-Warn "Schéma peut-être déjà appliqué (normal si déjà installé)"
}

# ─── 5. Fichier .env ─────────────────────────────────────────
Write-Step "Configuration de l'environnement backend..."
$envFile = "$projectDir\backend\.env"
if (-not (Test-Path $envFile)) {
    $envContent = @"
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://ultratravel:ultratravel_secret@localhost:5432/ultratravel_db
JWT_SECRET=UltraTravel_SuperSecret_2024_ChangeMeInProd!
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
"@
    $envContent | Out-File -FilePath $envFile -Encoding utf8
    Write-OK "Fichier .env créé"
} else {
    Write-OK "Fichier .env existe déjà"
}

# ─── 6. Installer dépendances ────────────────────────────────
Write-Step "Installation des dépendances backend..."
Set-Location "$projectDir\backend"
& npm install --silent
Write-OK "Backend prêt"

Write-Step "Installation des dépendances frontend..."
Set-Location "$projectDir\frontend"
& npm install --silent
Write-OK "Frontend prêt"

# ─── 7. Lancement ────────────────────────────────────────────
Write-Step "Démarrage de l'application..."
Set-Location $projectDir

Start-Process cmd -ArgumentList "/k cd /d `"$projectDir\backend`" && npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 4
Start-Process cmd -ArgumentList "/k cd /d `"$projectDir\frontend`" && npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 6

Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║  INSTALLATION TERMINÉE ! App en marche.      ║" -ForegroundColor Green
Write-Host "  ║                                              ║" -ForegroundColor Green
Write-Host "  ║  Ouvre :  http://localhost:5173              ║" -ForegroundColor Green
Write-Host "  ║                                              ║" -ForegroundColor Green
Write-Host "  ║  Email    : admin@ultratravel.com            ║" -ForegroundColor Green
Write-Host "  ║  Password : Admin@1234                       ║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  La prochaine fois, utilise juste LANCER.bat" -ForegroundColor Yellow
Write-Host ""
Read-Host "  Appuie sur ENTRÉE pour fermer"
