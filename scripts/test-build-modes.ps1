# Test script to verify console window behavior
Write-Host "Testing lk-gui build modes..." -ForegroundColor Green

# Test production build (should have no console)
Write-Host "`nBuilding production version (no console)..." -ForegroundColor Yellow
$env:PRODUCTION = "true"
wails3 task windows:build

if (Test-Path "bin/lk-gui.exe") {
    $prodSize = (Get-Item "bin/lk-gui.exe").Length
    Write-Host "✅ Production build successful: $(($prodSize/1MB).ToString('F2')) MB" -ForegroundColor Green
    
    # Rename for comparison
    Move-Item "bin/lk-gui.exe" "bin/lk-gui-production.exe" -Force
} else {
    Write-Host "❌ Production build failed" -ForegroundColor Red
}

# Test development build (should have console)
Write-Host "`nBuilding development version (with console)..." -ForegroundColor Yellow
$env:PRODUCTION = "false"
wails3 task windows:build

if (Test-Path "bin/lk-gui.exe") {
    $devSize = (Get-Item "bin/lk-gui.exe").Length
    Write-Host "✅ Development build successful: $(($devSize/1MB).ToString('F2')) MB" -ForegroundColor Green
    
    # Rename for comparison
    Move-Item "bin/lk-gui.exe" "bin/lk-gui-development.exe" -Force
} else {
    Write-Host "❌ Development build failed" -ForegroundColor Red
}

# Show comparison
Write-Host "`nBuild comparison:" -ForegroundColor Cyan
Get-ChildItem "bin/lk-gui-*.exe" | Select-Object Name, @{Name="Size(MB)";Expression={($_.Length/1MB).ToString('F2')}}, LastWriteTime

Write-Host "`nBuild verification complete!" -ForegroundColor Green
Write-Host "Production build (lk-gui-production.exe) should run without console window" -ForegroundColor Yellow
Write-Host "Development build (lk-gui-development.exe) should show console window for debugging" -ForegroundColor Yellow