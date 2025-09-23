# Scripts Directory

This directory contains utility scripts for development and testing.

## Files

### test-actions.sh / test-actions.bat

Local testing scripts that simulate the GitHub Actions workflow steps.

### fix-golangci-lint.sh / fix-golangci-lint.ps1

Specialized scripts to fix golangci-lint compatibility issues with Wails v3 alpha version.

### test-env-vars.ps1

Windows-specific script to test environment variable handling and verify cross-platform compatibility.

### CHANGELOG.md

Documents important changes and fixes to the build and test scripts.

**Usage:**

- Linux/macOS: `./scripts/test-actions.sh`
- Windows: `.\scripts\test-actions.bat`

**Fix golangci-lint issues:**

- Linux/macOS: `./scripts/fix-golangci-lint.sh`
- Windows: `.\scripts\fix-golangci-lint.ps1`

**Test build modes (Windows only):**

- Windows: `.\scripts\test-build-modes.ps1`

**Test environment variables (Windows only):**

- Windows: `.\scripts\test-env-vars.ps1`

**Important:** These scripts must be run from the project root directory.

**Order of Operations:**

1. Environment checks (Go, Node.js, npm)
2. Wails CLI installation
3. Frontend dependency installation
4. Frontend linting and formatting checks
5. TypeScript compilation check
6. Frontend build (creates `frontend/dist` directory)
7. Go module verification
8. Go linting with golangci-lint
9. Go tests
10. Application build
11. Security scans

**Note:** The frontend build step is crucial as it creates the `frontend/dist` directory that Go's `//go:embed` directive requires. Running Go linting before frontend build will cause errors.

## Common Issues

### golangci-lint Error: "pattern all:frontend/dist: no matching files found"

**Problem:** This error occurs when golangci-lint runs before the frontend is built, causing the `//go:embed all:frontend/dist` directive in main.go to fail.

**Root Cause:** 
- main.go uses `//go:embed all:frontend/dist` to embed frontend assets
- golangci-lint's typecheck runs during Go analysis
- If `frontend/dist` doesn't exist, the embed directive fails

**Solution:** Ensure the frontend is built before running any Go linting or tests. Both GitHub Actions workflow and local test scripts have been fixed to follow the correct order:

1. **Install frontend dependencies**
2. **Build frontend** → Creates `frontend/dist`
3. **Run Go linting** → Now `//go:embed` can find the files

### Configuration Files Added

**`.golangci.yml`** - Custom golangci-lint configuration that:
- Excludes auto-generated `frontend/bindings` directory
- Uses modern linters (replaced deprecated `gomnd` with `mnd`)
- Configures appropriate timeout and line length limits
- Handles Wails v3 alpha compatibility issues

### Running from Wrong Directory

The scripts include checks to ensure they're run from the project root directory. If you see an error about missing `go.mod` or `frontend` directory, make sure you're in the correct location:

```bash
# Correct usage
cd /path/to/lk-gui
./scripts/test-actions.sh

# Incorrect usage  
cd /path/to/lk-gui/scripts
./test-actions.sh  # This will fail
```

## Requirements

- Go 1.24.0+
- Node.js 20+
- npm
- Wails CLI v3
- golangci-lint (auto-installed by scripts if missing)

## Testing GitHub Actions Locally

Before pushing to GitHub, run the local test scripts to simulate the CI/CD pipeline:

```bash
# On Linux/macOS
./scripts/test-actions.sh

# On Windows
.\scripts\test-actions.bat
```

These scripts will:
- Verify your environment setup
- Install missing tools (Wails CLI, golangci-lint)
- Run the exact same steps as GitHub Actions
- Report any issues before you push code
