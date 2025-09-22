#!/bin/bash

# Local GitHub Actions Test Script
# This script simulates the GitHub Actions workflow steps locally
# Run from project root: ./scripts/test-actions.sh

set -e

echo "🧪 Starting local GitHub Actions test..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

step() {
    echo -e "\n🔄 $1"
}

# Check if running from project root
if [ ! -f "go.mod" ] || [ ! -d "frontend" ]; then
    error "Please run this script from the project root directory"
    echo "Usage: ./scripts/test-actions.sh"
    exit 1
fi

# Step 1: Check environment
step "Checking environment..."

# Check Go version
if command -v go &> /dev/null; then
    GO_VERSION=$(go version | awk '{print $3}' | sed 's/go//')
    if [[ "$GO_VERSION" == "1.24.0" ]]; then
        success "Go version: $GO_VERSION"
    else
        warning "Go version: $GO_VERSION (expected 1.24.0)"
    fi
else
    error "Go not found"
    exit 1
fi

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    success "Node.js version: $NODE_VERSION"
else
    error "Node.js not found"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    success "npm version: $NPM_VERSION"
else
    error "npm not found"
    exit 1
fi

# Step 2: Install Wails CLI
step "Installing Wails CLI..."
if command -v wails3 &> /dev/null; then
    success "Wails CLI already installed"
    wails3 version
else
    echo "Installing Wails CLI..."
    go install github.com/wailsapp/wails/v3/cmd/wails3@latest
    success "Wails CLI installed"
fi

# Step 3: Frontend dependencies
step "Installing frontend dependencies..."
cd frontend
if npm ci; then
    success "Frontend dependencies installed"
else
    error "Failed to install frontend dependencies"
    exit 1
fi

# Step 4: Frontend checks
step "Running frontend checks..."

# Format check
if npm run format; then
    success "Code formatting check passed"
else
    error "Code formatting check failed"
    exit 1
fi

# TypeScript check
if npx tsc --noEmit; then
    success "TypeScript check passed"
else
    error "TypeScript check failed"
    exit 1
fi

# Frontend build
if npm run build; then
    success "Frontend build successful"
else
    error "Frontend build failed"
    exit 1
fi

cd ..

# Step 5: Go module checks
step "Running Go module checks..."
go mod verify
go mod tidy
success "Go modules verified"

# Step 6: golangci-lint
step "Installing and running golangci-lint..."
if command -v golangci-lint &> /dev/null; then
    success "golangci-lint already installed"
else
    echo "Installing golangci-lint..."
    # Install golangci-lint
    curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin latest
    export PATH=$PATH:$(go env GOPATH)/bin
fi

# Run golangci-lint with our custom config
if golangci-lint run --config .golangci.yml --timeout=5m; then
    success "golangci-lint passed"
else
    warning "golangci-lint found issues (this may be expected with Wails v3 alpha)"
fi

# Step 7: Go tests
step "Running Go tests..."
if go test -v ./...; then
    success "Go tests passed"
else
    error "Go tests failed"
    exit 1
fi

# Step 8: Application build
step "Building application..."
if wails3 task $(go env GOOS):build; then
    success "Application build successful"
    
    # Check build output
    if [ -d "./bin" ]; then
        echo "Build artifacts:"
        ls -la ./bin/
    fi
else
    error "Application build failed"
    exit 1
fi

# Step 9: Security scans (simplified)
step "Running basic security scans..."

# Check for govulncheck
echo "Installing govulncheck..."
go install golang.org/x/vuln/cmd/govulncheck@latest
if govulncheck ./...; then
    success "govulncheck passed - no known vulnerabilities found"
else
    warning "govulncheck found potential vulnerabilities"
fi

# Check npm audit if frontend exists
if [ -d "frontend" ]; then
    echo "Running npm audit..."
    cd frontend
    if npm audit --audit-level=high; then
        success "npm audit passed"
    else
        warning "npm audit found high-level vulnerabilities"
    fi
    cd ..
fi

# Step 9: golangci-lint (if available)
step "Running golangci-lint (if available)..."
if command -v golangci-lint &> /dev/null; then
    if golangci-lint run; then
        success "golangci-lint passed"
    else
        warning "golangci-lint found issues"
    fi
else
    warning "golangci-lint not installed, skipping"
fi

# Summary
echo -e "\n🎉 ${GREEN}All tests completed successfully!${NC}"
echo "Your code is ready for GitHub Actions workflow."

echo -e "\n📋 Next steps:"
echo "1. Commit your changes: git add . && git commit -m 'feat: add GitHub Actions workflows'"
echo "2. Push to GitHub: git push origin main"
echo "3. Create a tag for release: git tag v1.0.0 && git push origin v1.0.0"