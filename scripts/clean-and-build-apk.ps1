# Free disk space needed for APK builds, then build.
# Run from project root: powershell -ExecutionPolicy Bypass -File scripts/clean-and-build-apk.ps1

$ErrorActionPreference = "Continue"
$ProjectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $ProjectRoot

function Free-GB {
  [math]::Round((Get-PSDrive D).Free / 1GB, 2)
}

Write-Host ("Free space before: {0} GB" -f (Free-GB))

$targets = @(
  ".expo-export-test",
  ".tmp",
  ".expo",
  "android\app\build",
  "android\build",
  "android\.gradle",
  "node_modules\.cache"
)

foreach ($rel in $targets) {
  $path = Join-Path $ProjectRoot $rel
  if (Test-Path $path) {
    Write-Host "Removing $rel ..."
    Remove-Item -LiteralPath $path -Recurse -Force -ErrorAction SilentlyContinue
  }
}

# Optional: trim Gradle caches if still tight (safe regenerable)
$gradleCaches = "D:\gradle-home\caches"
if ((Free-GB) -lt 8 -and (Test-Path $gradleCaches)) {
  Write-Host "Still low on space — clearing D:\gradle-home\caches ..."
  Remove-Item -LiteralPath $gradleCaches -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ("Free space after cleanup: {0} GB" -f (Free-GB))

if ((Free-GB) -lt 4) {
  Write-Host "ERROR: Need at least ~4–8 GB free on D: to build the APK."
  Write-Host "Delete more files (Downloads, old Android Studio AVDs, etc.) then re-run."
  exit 1
}

$env:NODE_OPTIONS = "--max-old-space-size=12288"
& "$PSScriptRoot\build-apk-windows.ps1"
