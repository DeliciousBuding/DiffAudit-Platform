param(
  [string]$Tag,
  [string]$WebImage = "diffaudit-platform-web",
  [string]$ApiImage = "diffaudit-platform-api",
  [switch]$AllowDirty
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Invoke-Git {
  param([string[]]$Arguments)
  & git -C $RepoRoot @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "git $($Arguments -join ' ') failed"
  }
}

$Revision = "$(Invoke-Git @("rev-parse", "HEAD"))".Trim()
$ShortRevision = "$(Invoke-Git @("rev-parse", "--short=12", "HEAD"))".Trim()
$Status = "$(Invoke-Git @("status", "--porcelain"))".Trim()

if ($Status -and -not $AllowDirty) {
  throw "working tree is dirty; commit or pass -AllowDirty for a local-only image"
}

if (-not $Tag) {
  $Tag = $ShortRevision
}

$BuildDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

docker build `
  --build-arg "VCS_REF=$Revision" `
  --build-arg "BUILD_DATE=$BuildDate" `
  -f (Join-Path $RepoRoot "apps/web/Dockerfile") `
  -t "${WebImage}:$Tag" `
  $RepoRoot
if ($LASTEXITCODE -ne 0) {
  throw "web image build failed"
}

docker build `
  --build-arg "VCS_REF=$Revision" `
  --build-arg "BUILD_DATE=$BuildDate" `
  -f (Join-Path $RepoRoot "apps/api-go/Dockerfile") `
  -t "${ApiImage}:$Tag" `
  $RepoRoot
if ($LASTEXITCODE -ne 0) {
  throw "api image build failed"
}

docker tag "${WebImage}:$Tag" "${WebImage}:current"
docker tag "${ApiImage}:$Tag" "${ApiImage}:current"

Write-Host "Built ${WebImage}:$Tag and ${ApiImage}:$Tag"
Write-Host "Revision: $Revision"
