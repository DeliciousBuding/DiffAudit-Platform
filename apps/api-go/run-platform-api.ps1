param(
    [string]$ListenHost = "127.0.0.1",
    [string]$ListenPort = "8780",
    [string]$PublicDataDir,
    [Alias("ControlAPIBaseURL")]
    [string]$RuntimeBaseURL = "",
    [bool]$DemoMode = $true
)

$ErrorActionPreference = "Stop"

$serviceRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not $PublicDataDir) {
    $PublicDataDir = Join-Path $serviceRoot "data\public"
}

$existing = Get-NetTCPConnection -LocalPort ([int]$ListenPort) -ErrorAction SilentlyContinue |
    Where-Object { $_.State -eq "Listen" }

if ($existing) {
    $owners = $existing | Select-Object -ExpandProperty OwningProcess -Unique
    Write-Host "Port $ListenPort is already in use by process id(s): $($owners -join ', ')." -ForegroundColor Yellow
    Write-Host "Use -ListenPort to start the gateway on another port, or stop the existing process intentionally." -ForegroundColor Yellow
    exit 1
}

Push-Location $serviceRoot
try {
    go run ./cmd/platform-api `
        --host $ListenHost `
        --port $ListenPort `
        --public-data-dir $PublicDataDir `
        --runtime-base-url $RuntimeBaseURL `
        --demo-mode $DemoMode
}
finally {
    Pop-Location
}
