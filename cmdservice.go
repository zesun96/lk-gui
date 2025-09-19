package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
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
