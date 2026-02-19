# Build script for NDJSON Payload Parser Chrome Extension
# Usage: .\build.ps1

Write-Host "Building NDJSON Payload Parser..." -ForegroundColor Cyan

# Get version from manifest.json
$manifestPath = "extension\manifest.json"
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$version = $manifest.version

Write-Host "Version: $version" -ForegroundColor Yellow

# Create dist directory if it doesn't exist
if (-not (Test-Path "dist")) {
    New-Item -ItemType Directory -Path "dist" | Out-Null
}

# Output ZIP filename
$zipFileName = "dist\ndjson-parser-v$version.zip"

# Remove old ZIP if it exists
if (Test-Path $zipFileName) {
    Remove-Item $zipFileName -Force
    Write-Host "Removed old ZIP file" -ForegroundColor Gray
}

# Create ZIP file
Compress-Archive -Path "extension\*" -DestinationPath $zipFileName -CompressionLevel Optimal

if (Test-Path $zipFileName) {
    $fileSize = (Get-Item $zipFileName).Length / 1KB
    Write-Host ""
    Write-Host "Success! Built: $zipFileName" -ForegroundColor Green
    Write-Host "Size: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Ready to upload to Chrome Web Store" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Build failed" -ForegroundColor Red
    exit 1
}