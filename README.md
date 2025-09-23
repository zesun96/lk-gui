# lk-gui

lk-gui is a GUI application for [LiveKit CLI](https://github.com/livekit/livekit-cli), providing an intuitive graphical interface to simplify LiveKit command-line operations.

## Prerequisites

### LiveKit CLI Installation

Before using lk-gui, you need to install the LiveKit CLI tool:

#### Option 1: Download from GitHub Releases (Recommended)

1. Visit the [LiveKit CLI releases page](https://github.com/livekit/livekit-cli/releases)
2. Download the appropriate version for your operating system:
   - **Windows**: Download `livekit-cli_x.x.x_windows_amd64.zip`
   - **macOS**: Download `livekit-cli_x.x.x_darwin_amd64.tar.gz` (Intel) or `livekit-cli_x.x.x_darwin_arm64.tar.gz` (Apple Silicon)
   - **Linux**: Download `livekit-cli_x.x.x_linux_amd64.tar.gz`
3. Extract the downloaded file
4. Move the `lk` executable to a directory in your system PATH

#### Option 2: Install using Go

```bash
go install github.com/livekit/livekit-cli/cmd/lk@latest
```

#### Verify Installation

After installation, verify that LiveKit CLI is properly installed:

```bash
lk --version
```

### Configuration

Once installed, you can configure lk-gui to use your LiveKit CLI installation:

1. Launch lk-gui
2. Go to Settings
3. Set the path to your `lk` executable (or use the Browse button to locate it)
4. Test the connection to ensure everything is working correctly

## Features

- [ ] create room
- [ ] join room
- [ ] list rooms

## Install

### Download lk-gui

#### From GitHub Releases (Recommended)

1. Visit the [lk-gui releases page](https://github.com/your-username/lk-gui/releases)
2. Download the appropriate version for your operating system:
   - **Windows**: `lk-gui-windows-amd64.exe`
   - **macOS**: `lk-gui-darwin-amd64`
   - **Linux**: `lk-gui-linux-amd64`
3. Run the downloaded executable

#### Build from Source

See the [Development](#development) section below for instructions on building from source.

## Usage

### First Time Setup

1. **Download and install LiveKit CLI** (see [Prerequisites](#prerequisites))
2. **Launch lk-gui**
3. **Configure LiveKit CLI path**:
   - Open Settings from the navigation menu
   - Click "Browse" to locate your `lk` executable, or manually enter the path
   - Click "Test Command" to verify the configuration
   - Click "Save" to store your settings

### Basic Operations

- **Create Room**: Use the create room interface to set up new LiveKit rooms
- **Join Room**: Connect to existing rooms with the specified parameters
- **List Rooms**: View all available rooms in your LiveKit server
- **Preview Commands**: Check the generated CLI commands before execution in the Preview tab

### Tips

- All settings are automatically saved and will persist between sessions
- Use the Preview tab to review the exact CLI commands that will be executed
- Check the application logs if you encounter any issues with command execution

## Development

### Dev Prerequisites

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

### Build Modes

**Production Build (No Console Window on Windows):**
```bash
# For Windows release builds without console window
PRODUCTION=true wails3 task windows:build
```

**Development Build (With Console for Debugging):**
```bash
# For development builds with console output
PRODUCTION=false wails3 task windows:build
# or simply
wails3 task windows:build
```

**Manual Build with Go:**
```bash
# Production build (no console)
go build -tags production -ldflags="-H windowsgui" -o lk-gui.exe

# Development build (with console)
go build -tags console -o lk-gui.exe
```

Note: The production builds from GitHub Actions automatically include the `-H windowsgui` flag to hide the console window on Windows.

## CI/CD

This project uses GitHub Actions for automated building and testing:

- **Build & Release**: Automatically builds for Windows, macOS, and Linux on push/PR
- **Code Quality**: Runs Go and frontend linting/testing
- **Security**: Performs security scans and dependency checks

See [.github/use.md](.github/use.md) for detailed workflow documentation.

## License

Apache-2.0
