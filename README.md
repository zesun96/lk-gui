# lk-gui

lk-gui is a gui for livekit-cli

## Features

- [ ] create room
- [ ] join room
- [ ] list rooms

## Install

## Development

### Prerequisites

- Go 1.24.0
- Node.js (>=18)
- npm
- Wails v3 CLI: `go install github.com/wailsapp/wails/v3/cmd/wails3@latest`

### Live Development

To run in live development mode, run `wails3 dev` in the project directory. This will run a Vite development
server that will provide very fast hot reload of your frontend changes. If you want to develop in a browser
and have access to your Go methods, there is also a dev server that runs on <http://localhost:34115>. Connect
to this in your browser, and you can call your Go code from devtools.

### Testing

Before pushing code, you can test the GitHub Actions workflow locally:

**Linux/macOS:**

```bash
./scripts/test-actions.sh
```

**Windows:**

```cmd
.\scripts\test-actions.bat
```

This will simulate the CI/CD pipeline steps locally to catch issues early.

## Building

To build a redistributable, production mode package, use `wails3 build`.

## CI/CD

This project uses GitHub Actions for automated building and testing:

- **Build & Release**: Automatically builds for Windows, macOS, and Linux on push/PR
- **Code Quality**: Runs Go and frontend linting/testing
- **Security**: Performs security scans and dependency checks

See [.github/README.md](.github/README.md) for detailed workflow documentation.

## License

Apache-2.0
