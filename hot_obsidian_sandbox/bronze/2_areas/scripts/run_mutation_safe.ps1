# HFO Gen 88 - Safe Mutation Testing Script
# Guards against freezing with timeouts and sequential execution

param(
    [string]$Commander = "all",
    [int]$TimeoutMinutes = 5
)

$ErrorActionPreference = "Continue"
$commanders = @("p0", "p1", "p2", "p3", "p6", "p7")
$results = @{}
$configBase = "hot_obsidian_sandbox/bronze/infra/stryker"

function Run-MutationTest {
    param([string]$Port)
    
    $configFile = "$configBase/stryker.$Port.config.mjs"
    if (-not (Test-Path $configFile)) {
        Write-Host "[$Port] Config not found: $configFile" -ForegroundColor Yellow
        return @{ Port = $Port; Status = "SKIPPED"; Score = "N/A" }
    }
    
    Write-Host "`n[$Port] Starting (timeout: ${TimeoutMinutes}m)..." -ForegroundColor Cyan
    $startTime = Get-Date
    
    try {
        $job = Start-Job -ScriptBlock {
            param($config)
            Set-Location $using:PWD
            npx stryker run $config 2>&1
        } -ArgumentList $configFile
        
        $completed = Wait-Job $job -Timeout ($TimeoutMinutes * 60)
        
        if ($null -eq $completed) {
            Write-Host "[$Port] TIMEOUT!" -ForegroundColor Red
            Stop-Job $job; Remove-Job $job -Force
            return @{ Port = $Port; Status = "TIMEOUT"; Score = "N/A" }
        }
        
        $output = Receive-Job $job; Remove-Job $job
        $scoreMatch = $output | Select-String -Pattern "Mutation score:\s*(\d+\.?\d*)%"
        
        if ($scoreMatch) {
            $score = $scoreMatch.Matches[0].Groups[1].Value
            $status = if ([double]$score -ge 80) { "PASS" } else { "FAIL" }
            Write-Host "[$Port] $score% - $status" -ForegroundColor $(if ($status -eq "PASS") { "Green" } else { "Red" })
            return @{ Port = $Port; Status = $status; Score = "$score%" }
        }
        return @{ Port = $Port; Status = "UNKNOWN"; Score = "N/A" }
    }
    catch {
        Write-Host "[$Port] ERROR: $_" -ForegroundColor Red
        return @{ Port = $Port; Status = "ERROR"; Score = "N/A" }
    }
}

# Clean stale temps
Get-ChildItem -Path . -Filter ".stryker-tmp*" -Directory | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

if ($Commander -eq "all") {
    foreach ($cmd in $commanders) { $results[$cmd] = Run-MutationTest -Port $cmd }
} else {
    $results[$Commander] = Run-MutationTest -Port $Commander
}

# Summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
foreach ($key in $results.Keys | Sort-Object) {
    $r = $results[$key]
    $color = switch ($r.Status) { "PASS" { "Green" } "FAIL" { "Red" } default { "Yellow" } }
    Write-Host "$($r.Port.ToUpper()): $($r.Status) $($r.Score)" -ForegroundColor $color
}
