# Test environment variable settings across platforms
Write-Host "Testing environment variable configurations..." -ForegroundColor Green

# Test production build setting
Write-Host "`nTesting production build environment:" -ForegroundColor Yellow
$env:PRODUCTION = "true"
Write-Host "PRODUCTION = $env:PRODUCTION"

# Verify the variable is available for child processes
$result = cmd /c "echo %PRODUCTION%"
Write-Host "CMD sees PRODUCTION as: $result"

# Test development build setting
Write-Host "`nTesting development build environment:" -ForegroundColor Yellow
$env:PRODUCTION = "false"
Write-Host "PRODUCTION = $env:PRODUCTION"

# Verify the variable is available for child processes
$result = cmd /c "echo %PRODUCTION%"
Write-Host "CMD sees PRODUCTION as: $result"

# Test with PowerShell's $env: syntax
Write-Host "`nTesting PowerShell `$env: syntax:" -ForegroundColor Cyan
$env:TEST_VAR = "PowerShellTest"
Write-Host "TEST_VAR = $env:TEST_VAR"

# Test with wails3 task command (dry run)
Write-Host "`nTesting wails3 task command with environment:" -ForegroundColor Cyan
Write-Host "Command that would be executed: wails3 task windows:build"
Write-Host "With PRODUCTION environment variable set to: $env:PRODUCTION"

Write-Host "`n✅ Environment variable tests completed!" -ForegroundColor Green
Write-Host "GitHub Actions will use the 'env:' section to set PRODUCTION variable" -ForegroundColor Yellow