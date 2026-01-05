# 🛡️ GEN 88 BACKGROUND DAEMON: CANALIZATION ENFORCEMENT
# This script monitors the workspace root and runs the Immune System sweep.

$RootDir = Resolve-Path "$PSScriptRoot\..\..\.."
$InfraDir = Resolve-Path "$PSScriptRoot\..\infra"
$AllowedFiles = @("hot_obsidian_sandbox", "cold_obsidian_sandbox", "AGENTS.md", "llms.txt", "obsidianblackboard.jsonl", ".git", ".gitignore", ".vscode")

Write-Host "🛡️ GEN 88 DAEMON ACTIVE: Monitoring $RootDir" -ForegroundColor Cyan

$lastScream = Get-Date

while ($true) {
    # 1. Root Pollution Check
    $CurrentFiles = Get-ChildItem -Path $RootDir -Name
    foreach ($File in $CurrentFiles) {
        if ($File -match "^ttao-notes-.*\.md$") { continue }
        if ($File -notin $AllowedFiles) {
            Write-Error "😱 ROOT POLLUTION DETECTED: $File"
        }
    }

    # 2. Immune System Sweep (Every 10 minutes)
    if ((Get-Date) -gt $lastScream.AddMinutes(10)) {
        Write-Host "🛡️ RUNNING IMMUNE SYSTEM SWEEP..." -ForegroundColor Yellow
        Push-Location $InfraDir
        npx tsx ../scripts/screamer.ts
        Pop-Location
        $lastScream = Get-Date
    }

    Start-Sleep -Seconds 60
}
