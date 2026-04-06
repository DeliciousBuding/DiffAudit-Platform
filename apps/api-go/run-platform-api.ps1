param(
    [string]$ListenHost = "127.0.0.1",
    [string]$ListenPort = "8000",
    [string]$ResearchAPIBaseURL = "http://127.0.0.1:8765"
)

$ErrorActionPreference = "Stop"

$serviceRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

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
        --research-api-base-url $ResearchAPIBaseURL
}
finally {
    Pop-Location
}
