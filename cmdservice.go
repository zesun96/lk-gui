package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

type CmdService struct {
}

func (c *CmdService) Run(cmd string) (string, error) {
	if strings.TrimSpace(cmd) == "" {
		return "", fmt.Errorf("command cannot be empty")
	}

	// 解析命令行参数
	args := strings.Fields(cmd)
	if len(args) == 0 {
		return "", fmt.Errorf("invalid command")
	}

	// 分离环境变量和实际命令
	var envVars []string
	var cmdArgs []string
	for i, arg := range args {
		if strings.Contains(arg, "=") && !strings.HasPrefix(arg, "-") {
			// 这是一个环境变量
			envVars = append(envVars, arg)
		} else {
			// 从这里开始是实际命令
			cmdArgs = args[i:]
			break
		}
	}

	if len(cmdArgs) == 0 {
		return "", fmt.Errorf("no command found")
	}

	// 创建上下文，设置超时时间（例如5分钟）
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	// 执行命令
	execCmd := exec.CommandContext(ctx, cmdArgs[0], cmdArgs[1:]...)

	// 设置环境变量
	execCmd.Env = append(os.Environ(), envVars...)

	output, err := execCmd.CombinedOutput()

	if err != nil {
		return string(output), fmt.Errorf("command execution failed: %v", err)
	}

	return string(output), nil
}

// SelectFile 打开文件选择对话框
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

// SelectFolder 打开文件夹选择对话框并查找 lk 命令
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

// selectFileWindows 在 Windows 上打开文件选择对话框
func (c *CmdService) selectFileWindows() (string, error) {
	// 使用 PowerShell 的文件选择对话框
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

// selectFileMacOS 在 macOS 上打开文件选择对话框
func (c *CmdService) selectFileMacOS() (string, error) {
	// 使用 osascript 打开文件选择对话框
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

// selectFileLinux 在 Linux 上打开文件选择对话框
func (c *CmdService) selectFileLinux() (string, error) {
	// 尝试使用 zenity（GNOME）
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

	// 尝试使用 kdialog（KDE）
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

// commandExists 检查命令是否存在
func (c *CmdService) commandExists(cmd string) bool {
	_, err := exec.LookPath(cmd)
	return err == nil
}

// selectFolderWindows 在 Windows 上打开文件夹选择对话框并查找 lk 命令
func (c *CmdService) selectFolderWindows() (string, error) {
	// 使用 PowerShell 的文件夹选择对话框
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

	// 在选定的文件夹中查找 lk.exe
	lkPath := folderPath + "\\lk.exe"
	if _, err := os.Stat(lkPath); err == nil {
		return lkPath, nil
	}

	return "", fmt.Errorf("lk.exe not found in selected folder: %s", folderPath)
}

// selectFolderMacOS 在 macOS 上打开文件夹选择对话框并查找 lk 命令
func (c *CmdService) selectFolderMacOS() (string, error) {
	// 使用 osascript 打开文件夹选择对话框
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

	// 在选定的文件夹中查找 lk
	lkPath := folderPath + "/lk"
	if _, err := os.Stat(lkPath); err == nil {
		return lkPath, nil
	}

	return "", fmt.Errorf("lk not found in selected folder: %s", folderPath)
}

// selectFolderLinux 在 Linux 上打开文件夹选择对话框并查找 lk 命令
func (c *CmdService) selectFolderLinux() (string, error) {
	// 尝试使用 zenity（GNOME）
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

		// 在选定的文件夹中查找 lk
		lkPath := folderPath + "/lk"
		if _, err := os.Stat(lkPath); err == nil {
			return lkPath, nil
		}

		return "", fmt.Errorf("lk not found in selected folder: %s", folderPath)
	}

	// 尝试使用 kdialog（KDE）
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

		// 在选定的文件夹中查找 lk
		lkPath := folderPath + "/lk"
		if _, err := os.Stat(lkPath); err == nil {
			return lkPath, nil
		}

		return "", fmt.Errorf("lk not found in selected folder: %s", folderPath)
	}

	return "", fmt.Errorf("no supported folder dialog tool found (zenity or kdialog required)")
}
