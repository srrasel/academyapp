# Build Android APK on Windows using Gradle (no EAS cloud quota needed).
# Requires: Java 17+, Android SDK (ANDROID_HOME), and enough free disk (~8GB+).
# Produces a standalone APK with JS embedded (works on real devices without Metro).

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $ProjectRoot

$sdkRoot = $env:ANDROID_HOME
if (-not $env:GRADLE_USER_HOME) {
  $env:GRADLE_USER_HOME = "D:\gradle-home"
  New-Item -ItemType Directory -Force -Path $env:GRADLE_USER_HOME | Out-Null
}
if (-not $sdkRoot) {
  if (Test-Path "D:\Android\Sdk") {
    $sdkRoot = "D:\Android\Sdk"
  } else {
    $sdkRoot = "$env:LOCALAPPDATA\Android\Sdk"
  }
  $env:ANDROID_HOME = $sdkRoot
}

$env:NODE_ENV = "production"
# Metro/Expo JS bundle can OOM on large course JSON without a higher heap.
if (-not $env:NODE_OPTIONS) {
  $env:NODE_OPTIONS = "--max-old-space-size=12288"
} elseif ($env:NODE_OPTIONS -notmatch "max-old-space-size") {
  $env:NODE_OPTIONS = "$($env:NODE_OPTIONS) --max-old-space-size=12288"
}

function Ensure-AndroidSdk {
  $sdkManager = Get-ChildItem -Path "$sdkRoot\cmdline-tools" -Recurse -Filter "sdkmanager.bat" -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $sdkManager) {
    Write-Host "Android SDK not found. Install Android Studio from https://developer.android.com/studio"
    Write-Host "Then set ANDROID_HOME to: $sdkRoot"
    exit 1
  }

  $prevErrorAction = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    & $sdkManager.FullName --licenses 2>&1 | Out-Null
    $yes = "y`ny`ny`ny`ny"
    $yes | & $sdkManager.FullName "platform-tools" "platforms;android-35" "build-tools;35.0.0" 2>&1 | Out-Null
  } finally {
    $ErrorActionPreference = $prevErrorAction
  }
}

function Ensure-EmbeddedBundle {
  # Force JS/assets to be packaged into every APK so real devices don't need Metro.
  $gradleFile = Join-Path $ProjectRoot "android\app\build.gradle"
  if (-not (Test-Path $gradleFile)) { return }

  $content = Get-Content $gradleFile -Raw
  # Remove any existing debuggableVariants lines (commented or not), then inject an active one.
  $content = [regex]::Replace(
    $content,
    '(?m)^\s*//?\s*debuggableVariants\s*=\s*\[[^\]]*\]\s*\r?\n',
    ''
  )
  if ($content -match 'bundleCommand\s*=') {
    $content = [regex]::Replace(
      $content,
      '(bundleCommand\s*=\s*"[^"]+"\s*\r?\n)',
      "`$1`r`n    // Skip Gradle Metro for release; JS is prebundled into assets`r`n    debuggableVariants = [`"release`"]`r`n"
    )
  }

  # Pass heap size into the Node process Gradle spawns for Metro.
  $content = [regex]::Replace(
    $content,
    '(?m)^\s*//?\s*nodeExecutableAndArgs\s*=\s*\[[^\]]*\]\s*\r?\n',
    ''
  )
  if ($content -match 'react\s*\{') {
    $content = [regex]::Replace(
      $content,
      '(react\s*\{)',
      "`$1`r`n    nodeExecutableAndArgs = [`"node`", `"--max-old-space-size=12288`"]"
    )
  }

  Set-Content -Path $gradleFile -Value $content -NoNewline
  Write-Host "==> Ensured debuggableVariants = [release] (skip Gradle Metro) + Node heap"
}

function Ensure-JsBundle {
  $assetsDir = Join-Path $ProjectRoot "android\app\src\main\assets"
  $bundlePath = Join-Path $assetsDir "index.android.bundle"
  New-Item -ItemType Directory -Force -Path $assetsDir | Out-Null

  Write-Host "==> Prebundling JS with Expo (avoids Gradle Metro OOM)..."
  npx expo export:embed `
    --platform android `
    --entry-file index.js `
    --bundle-output $bundlePath `
    --assets-dest (Join-Path $ProjectRoot "android\app\src\main\res") `
    --dev false `
    --minify true

  if (-not (Test-Path $bundlePath)) {
    Write-Error "JS bundle was not created at $bundlePath"
  }
  Write-Host ("==> Bundle ready: {0:N0} bytes" -f (Get-Item $bundlePath).Length)
}

Write-Host "==> Prebuild Android project..."
# --clean so new native modules (Google / Facebook SDKs) are linked
npx expo prebuild --platform android --clean --no-install

Ensure-EmbeddedBundle
Ensure-AndroidSdk
Ensure-JsBundle

# Limit ABIs + raise heap so Windows machines don't OOM during CMake/native builds.
$gradleProps = Join-Path $ProjectRoot "android\gradle.properties"
if (Test-Path $gradleProps) {
  $props = Get-Content $gradleProps -Raw
  $props = [regex]::Replace(
    $props,
    'reactNativeArchitectures=.*',
    'reactNativeArchitectures=arm64-v8a'
  )
  if ($props -notmatch 'org\.gradle\.jvmargs=') {
    $props = "org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m`r`n" + $props
  } else {
    $props = [regex]::Replace(
      $props,
      'org\.gradle\.jvmargs=.*',
      'org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError'
    )
  }
  Set-Content -Path $gradleProps -Value $props -NoNewline
  Write-Host "==> Using arm64-v8a only + 4GB Gradle heap"
}

$gradlew = Join-Path $ProjectRoot "android\gradlew.bat"
if (-not (Test-Path $gradlew)) {
  Write-Error "Gradle wrapper not found at android\gradlew.bat"
}

Write-Host "==> Building release APK (this may take several minutes)..."
Set-Location (Join-Path $ProjectRoot "android")
& .\gradlew.bat assembleRelease --no-daemon

$apk = Get-ChildItem -Path "app\build\outputs\apk\release" -Filter "*.apk" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $apk) {
  Write-Error "Release APK not found."
}

$outDir = Join-Path $ProjectRoot "dist"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$dest = Join-Path $outDir "bridge-academy.apk"
Copy-Item $apk.FullName $dest -Force

# Verify the JS bundle is inside the APK
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($dest)
$bundle = $zip.Entries | Where-Object { $_.FullName -eq 'assets/index.android.bundle' } | Select-Object -First 1
$zip.Dispose()

if (-not $bundle) {
  Write-Error "APK is missing assets/index.android.bundle - device would show Unable to load script."
}

Write-Host ""
Write-Host 'APK built successfully (standalone - no Metro needed):'
Write-Host $dest
Write-Host ("JS bundle size: {0:N0} bytes" -f $bundle.Length)
Write-Host ""
Write-Host 'Install tip: uninstall any previous Bridge Academy build first, then install this APK.'
