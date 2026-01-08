# ═══════════════════════════════════════════════════════════════════════════════
# 🔴 RED REGNANT MUTATION TESTING - Gen 88 Canalization
# ═══════════════════════════════════════════════════════════════════════════════
# 
# SAFETY TRIPWIRES:
# - Class 1 (Fast): Unit/Property tests = 1 min timeout
# - Class 2 (Slow): Integration tests = 8 min timeout
#
# Usage:
#   .\run_stryker_p4.ps1           # Run Class 1 only (fast, recommended)
#   .\run_stryker_p4.ps1 -Full     # Run both Class 1 and Class 2
#   .\run_stryker_p4.ps1 -Integration  # Run Class 2 only
#
# ═══════════════════════════════════════════════════════════════════════════════

param(
    [switch]$Full,
    [switch]$Integration
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Red
Write-Host "  🔴 RED REGNANT MUTATION TESTING" -ForegroundColor Red
Write-Host "  Gen 88 Canalization | Target: 88%" -ForegroundColor DarkRed
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Red
Write-Host ""

# Clean up any stale Stryker processes
Write-Host "🧹 Cleaning stale processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*stryker*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

if (-not $Integration) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  CLASS 1: Fast Tests (1 min timeout)" -ForegroundColor Cyan
    Write-Host "  Unit tests, property tests, pure functions" -ForegroundColor DarkCyan
    Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    $startTime = Get-Date
    
    try {
        npx stryker run -c stryker.p4.config.mjs
        $exitCode1 = $LASTEXITCODE
    } catch {
        Write-Host "❌ Class 1 failed with error: $_" -ForegroundColor Red
        $exitCode1 = 1
    }
    
    $duration1 = (Get-Date) - $startTime
    Write-Host ""
    Write-Host "⏱️  Class 1 Duration: $($duration1.ToString('mm\:ss'))" -ForegroundColor Gray
    
    if ($exitCode1 -ne 0) {
        Write-Host "⚠️  Class 1 completed with warnings/errors (exit code: $exitCode1)" -ForegroundColor Yellow
    }
}

if ($Full -or $Integration) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host "  CLASS 2: Slow Tests (8 min timeout)" -ForegroundColor Magenta
    Write-Host "  Integration tests with I/O operations" -ForegroundColor DarkMagenta
    Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host ""
    
    $startTime = Get-Date
    
    try {
        npx stryker run -c stryker.p4.integration.config.mjs
        $exitCode2 = $LASTEXITCODE
    } catch {
        Write-Host "❌ Class 2 failed with error: $_" -ForegroundColor Red
        $exitCode2 = 1
    }
    
    $duration2 = (Get-Date) - $startTime
    Write-Host ""
    Write-Host "⏱️  Class 2 Duration: $($duration2.ToString('mm\:ss'))" -ForegroundColor Gray
    
    if ($exitCode2 -ne 0) {
        Write-Host "⚠️  Class 2 completed with warnings/errors (exit code: $exitCode2)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ MUTATION TESTING COMPLETE" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Reports:" -ForegroundColor White
Write-Host "   Class 1: hot_obsidian_sandbox/bronze/infra/reports/mutation/mutation-p4.json" -ForegroundColor Gray
if ($Full -or $Integration) {
    Write-Host "   Class 2: hot_obsidian_sandbox/bronze/infra/reports/mutation/mutation-p4-integration.json" -ForegroundColor Gray
}
Write-Host ""
