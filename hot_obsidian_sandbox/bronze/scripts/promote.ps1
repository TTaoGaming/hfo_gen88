# 🛡️ GEN 88 PROMOTION GATE: BRONZE -> SILVER
# This script enforces the "No Theater" rule by requiring TDD and Mutation Testing.

$InfraDir = Resolve-Path "$PSScriptRoot\..\infra"

Write-Host "🚀 INITIATING PROMOTION GATE: BRONZE -> SILVER" -ForegroundColor Cyan

Push-Location $InfraDir

# 1. Run Vitest
Write-Host "🧪 RUNNING UNIT TESTS..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ UNIT TESTS FAILED. PROMOTION ABORTED."
    Pop-Location
    exit 1
}

# 2. Run Stryker (Mutation Testing)
Write-Host "🧬 RUNNING MUTATION TESTING..." -ForegroundColor Yellow
npm run stryker
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ MUTATION TESTING FAILED. PROMOTION ABORTED."
    Pop-Location
    exit 1
}

# 3. Run Screamer
Write-Host "🛡️ RUNNING IMMUNE SYSTEM SWEEP..." -ForegroundColor Yellow
npx tsx ../scripts/screamer.ts
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ IMMUNE SYSTEM VIOLATIONS FOUND. PROMOTION ABORTED."
    Pop-Location
    exit 1
}

Pop-Location

Write-Host "✅ ALL GATES PASSED. READY FOR PROMOTION." -ForegroundColor Green
