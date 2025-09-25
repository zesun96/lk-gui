package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

type CmdService struct {
}

func (c *CmdService) Run(cmd string) (string, error) {
	log.Printf("[CmdService] Received command: %q", cmd)
	
	if strings.TrimSpace(cmd) == "" {
		return "", fmt.Errorf("command cannot be empty")
	}

	args := strings.Fields(cmd)
	if len(args) == 0 {
		return "", fmt.Errorf("invalid command")
	}

	log.Printf("[CmdService] Parsed args: %v", args)

	var envVars []string
	var cmdArgs []string
	for i, arg := range args {
		if strings.Contains(arg, "=") && !strings.HasPrefix(arg, "-") {
			envVars = append(envVars, arg)
		} else {
			cmdArgs = args[i:]
			break
		}
	}

	if len(cmdArgs) == 0 {
		return "", fmt.Errorf("no command found")
	}

	log.Printf("[CmdService] Environment variables: %v", envVars)
	log.Printf("[CmdService] Command arguments: %v", cmdArgs)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	execCmd := exec.CommandContext(ctx, cmdArgs[0], cmdArgs[1:]...)

	execCmd.Env = append(os.Environ(), envVars...)

	log.Printf("[CmdService] Executing command: %s %v", cmdArgs[0], cmdArgs[1:])
	output, err := execCmd.CombinedOutput()
	log.Printf("[CmdService] Command output length: %d", len(output))
	log.Printf("[CmdService] Command output: %q", string(output))
	log.Printf("[CmdService] Command error: %v", err)

	if err != nil {
		return string(output), fmt.Errorf("command execution failed: %v", err)
	}

	return string(output), nil
}

// SelectFile opens a file selection dialog
func (c *CmdService) SelectFile() (string, error) {
	switch runtime.GOOS {
	case "windows":
		return c.selectFileWindows()
	case "darwin":
		return c.selectFileMacOS()
	case "linux":
		return c.selectFileLinux()
	default:
		return "", fmt.Errorf("unsupported operating system: %s", runtime.GOOS)
	}
}

// SelectFolder opens a folder selection dialog and looks for lk command
func (c *CmdService) SelectFolder() (string, error) {
	switch runtime.GOOS {
	case "windows":
		return c.selectFolderWindows()
	case "darwin":
		return c.selectFolderMacOS()
	case "linux":
		return c.selectFolderLinux()
	default:
		return "", fmt.Errorf("unsupported operating system: %s", runtime.GOOS)
	}
}

// selectFileWindows opens a file selection dialog on Windows
func (c *CmdService) selectFileWindows() (string, error) {
	// Use PowerShell's file selection dialog
	cmd := `Add-Type -AssemblyName System.Windows.Forms; $dialog = New-Object System.Windows.Forms.OpenFileDialog; $dialog.Filter = "Executable Files|*.exe|All Files|*.*"; $dialog.Title = "Select LiveKit CLI Executable"; if ($dialog.ShowDialog() -eq "OK") { Write-Output $dialog.FileName }`

	execCmd := exec.Command("powershell", "-Command", cmd)
	output, err := execCmd.Output()
	if err != nil {
		return "", fmt.Errorf("failed to open file dialog: %v", err)
	}

	filePath := strings.TrimSpace(string(output))
	if filePath == "" {
		return "", fmt.Errorf("no file selected")
	}

	return filePath, nil
}

// selectFileMacOS opens a file selection dialog on macOS
func (c *CmdService) selectFileMacOS() (string, error) {
	// Use osascript to open file selection dialog
	cmd := `osascript -e 'POSIX path of (choose file with prompt "Select LiveKit CLI Executable")'`

	execCmd := exec.Command("sh", "-c", cmd)
	output, err := execCmd.Output()
	if err != nil {
		return "", fmt.Errorf("failed to open file dialog: %v", err)
	}

	filePath := strings.TrimSpace(string(output))
	if filePath == "" {
		return "", fmt.Errorf("no file selected")
	}

	return filePath, nil
}

// selectFileLinux opens a file selection dialog on Linux
func (c *CmdService) selectFileLinux() (string, error) {
	// Try using zenity (GNOME)
	if c.commandExists("zenity") {
		cmd := exec.Command("zenity", "--file-selection", "--title=Select LiveKit CLI Executable")
		output, err := cmd.Output()
		if err != nil {
			return "", fmt.Errorf("failed to open file dialog with zenity: %v", err)
		}

		filePath := strings.TrimSpace(string(output))
		if filePath == "" {
			return "", fmt.Errorf("no file selected")
		}

		return filePath, nil
	}

	// Try using kdialog (KDE)
	if c.commandExists("kdialog") {
		cmd := exec.Command("kdialog", "--getopenfilename", ".", "Executable Files (lk *.exe)|All Files (*)")
		output, err := cmd.Output()
		if err != nil {
			return "", fmt.Errorf("failed to open file dialog with kdialog: %v", err)
		}

		filePath := strings.TrimSpace(string(output))
		if filePath == "" {
			return "", fmt.Errorf("no file selected")
		}

		return filePath, nil
	}

	return "", fmt.Errorf("no supported file dialog tool found (zenity or kdialog required)")
}

// commandExists checks if a command exists
func (c *CmdService) commandExists(cmd string) bool {
	_, err := exec.LookPath(cmd)
	return err == nil
}

// selectFolderWindows opens a folder selection dialog on Windows and looks for lk command
func (c *CmdService) selectFolderWindows() (string, error) {
	// Use PowerShell's folder selection dialog
	cmd := `Add-Type -AssemblyName System.Windows.Forms; $dialog = New-Object System.Windows.Forms.FolderBrowserDialog; $dialog.Description = "Select folder containing LiveKit CLI (lk.exe)"; if ($dialog.ShowDialog() -eq "OK") { Write-Output $dialog.SelectedPath }`

	execCmd := exec.Command("powershell", "-Command", cmd)
	output, err := execCmd.Output()
	if err != nil {
		return "", fmt.Errorf("failed to open folder dialog: %v", err)
	}

	folderPath := strings.TrimSpace(string(output))
	if folderPath == "" {
		return "", fmt.Errorf("no folder selected")
	}

	// Look for lk.exe in the selected folder
	lkPath := folderPath + "\\lk.exe"
	if _, err := os.Stat(lkPath); err == nil {
		return lkPath, nil
	}

	return "", fmt.Errorf("lk.exe not found in selected folder: %s", folderPath)
}

// selectFolderMacOS opens a folder selection dialog on macOS and looks for lk command
func (c *CmdService) selectFolderMacOS() (string, error) {
	// Use osascript to open folder selection dialog
	cmd := `osascript -e 'POSIX path of (choose folder with prompt "Select folder containing LiveKit CLI (lk)")'`

	execCmd := exec.Command("sh", "-c", cmd)
	output, err := execCmd.Output()
	if err != nil {
		return "", fmt.Errorf("failed to open folder dialog: %v", err)
	}

	folderPath := strings.TrimSpace(string(output))
	if folderPath == "" {
		return "", fmt.Errorf("no folder selected")
	}

	// Look for lk in the selected folder
	lkPath := folderPath + "/lk"
	if _, err := os.Stat(lkPath); err == nil {
		return lkPath, nil
	}

	return "", fmt.Errorf("lk not found in selected folder: %s", folderPath)
}

// selectFolderLinux opens a folder selection dialog on Linux and looks for lk command
func (c *CmdService) selectFolderLinux() (string, error) {
	// Try using zenity (GNOME)
	if c.commandExists("zenity") {
		cmd := exec.Command("zenity", "--file-selection", "--directory", "--title=Select folder containing LiveKit CLI (lk)")
		output, err := cmd.Output()
		if err != nil {
			return "", fmt.Errorf("failed to open folder dialog with zenity: %v", err)
		}

		folderPath := strings.TrimSpace(string(output))
		if folderPath == "" {
			return "", fmt.Errorf("no folder selected")
		}

		// Look for lk in the selected folder
		lkPath := folderPath + "/lk"
		if _, err := os.Stat(lkPath); err == nil {
			return lkPath, nil
		}

		return "", fmt.Errorf("lk not found in selected folder: %s", folderPath)
	}

	// Try using kdialog (KDE)
	if c.commandExists("kdialog") {
		cmd := exec.Command("kdialog", "--getexistingdirectory", ".", "--title", "Select folder containing LiveKit CLI (lk)")
		output, err := cmd.Output()
		if err != nil {
			return "", fmt.Errorf("failed to open folder dialog with kdialog: %v", err)
		}

		folderPath := strings.TrimSpace(string(output))
		if folderPath == "" {
			return "", fmt.Errorf("no folder selected")
		}

		// Look for lk in the selected folder
		lkPath := folderPath + "/lk"
		if _, err := os.Stat(lkPath); err == nil {
			return lkPath, nil
		}

		return "", fmt.Errorf("lk not found in selected folder: %s", folderPath)
	}

	return "", fmt.Errorf("no supported folder dialog tool found (zenity or kdialog required)")
}
