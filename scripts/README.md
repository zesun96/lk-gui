# Scripts Directory

This directory contains utility scripts for development and testing.

## Files

### test-actions.sh / test-actions.bat

Local testing scripts that simulate the GitHub Actions workflow steps.

**Usage:**

- Linux/macOS: `./scripts/test-actions.sh`
- Windows: `.\scripts\test-actions.bat`

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

**Solution:** Ensure the frontend is built before running any Go linting or tests. The scripts in this directory follow the correct order to prevent this issue.

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
- golangci-lint (optional, for local linting)
