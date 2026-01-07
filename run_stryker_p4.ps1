$p = Start-Process cmd -ArgumentList "/c", "npx stryker run -c stryker.p4.config.mjs" -NoNewWindow -PassThru
if (-not $p.WaitForExit(480000)) {
    Write-Host "--- WATCHDOG: 8 MINUTE TIMEOUT REACHED ---"
    Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "--- STRYKER FINISHED ---"
}
