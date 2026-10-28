<#
.SYNOPSIS
    Script asistido para purga de secretos e índice Git en Birdify 1.0.
.DESCRIPTION
    Realiza desindexación de node_modules/ y prepara comandos para git-filter-repo.
#>

param(
    [switch]$UntrackNodeModulesOnly,
    [switch]$FullHistoryRewrite
)

$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

Write-Host "=== Birdify 1.0 - Limpieza y Seguridad de Git ===" -ForegroundColor Cyan

if ($UntrackNodeModulesOnly -or (-not $FullHistoryRewrite)) {
    Write-Host "[1/2] Desindexando node_modules y bases de datos locales del staging..." -ForegroundColor Yellow
    git rm -r --cached --ignore-unmatch node_modules 2>$null
    git rm --cached --ignore-unmatch BirdifyApp/BirdifyApp.db BirdifyApp.db 2>$null
    Write-Host "Archivos desindexados del tracking de Git (permanecen en disco local si existen)." -ForegroundColor Green
    Write-Host "Puedes hacer commit ahora: git add -A && git commit -m 'chore: consolidar app en raiz y desindexar node_modules'"
}

if ($FullHistoryRewrite) {
    Write-Host "[2/2] Iniciando reescritura de historial completo con git-filter-repo..." -ForegroundColor Yellow
    
    $checkTool = Get-Command git-filter-repo -ErrorAction SilentlyContinue
    if (-not $checkTool) {
        Write-Error "git-filter-repo no está instalado. Ejecuta: pip install git-filter-repo"
        exit 1
    }

    # Purgar archivos sensibles e índice pesado del historial
    git filter-repo --path birdify-local/.env --path BirdifyApp/BirdifyApp.db --path-glob 'node_modules/*' --invert-paths --force
    Write-Host "Historial reescrito con éxito. Recuerda reasociar el remoto origin antes de hacer push force." -ForegroundColor Green
}
