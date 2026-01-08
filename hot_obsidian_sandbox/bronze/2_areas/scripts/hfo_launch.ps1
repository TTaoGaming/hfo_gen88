param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("vitest-root", "vitest-silver", "stryker-root", "stryker-silver", "all")]
    [string]$Task = "all"
)

# HFO Gen 88 Launch Script
# Target: hot_obsidian_sandbox/bronze/2_areas/infra/configs/

$ConfigDir = "hot_obsidian_sandbox/bronze/2_areas/infra/configs"

function Run-Vitest-Root {
    Write-Host ">>> Running Vitest Root Config..." -ForegroundColor Cyan
    npx vitest --config "$ConfigDir/vitest.root.config.ts" --run
}

function Run-Vitest-Silver {
    Write-Host ">>> Running Vitest Silver Config..." -ForegroundColor Cyan
    npx vitest --config "$ConfigDir/vitest.silver.config.ts" --run
}

function Run-Stryker-Root {
    Write-Host ">>> Running Stryker Root Config..." -ForegroundColor Cyan
    npx stryker run "$ConfigDir/stryker.root.config.mjs"
}

function Run-Stryker-Silver {
    Write-Host ">>> Running Stryker Silver Config..." -ForegroundColor Cyan
    npx stryker run "$ConfigDir/stryker.silver.config.mjs"
}

switch ($Task) {
    "vitest-root" { Run-Vitest-Root }
    "vitest-silver" { Run-Vitest-Silver }
    "stryker-root" { Run-Stryker-Root }
    "stryker-silver" { Run-Stryker-Silver }
    "all" {
        Run-Vitest-Root
        Run-Vitest-Silver
        Run-Stryker-Root
        Run-Stryker-Silver
    }
}
