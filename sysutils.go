package main

import (
	"time"

	"github.com/shirou/gopsutil/v4/cpu"
	"github.com/shirou/gopsutil/v4/mem"
)

type SystemStats struct {
	MemoryPercent float64
	CpuPercent    float64
}

func GetSystemStats() (*SystemStats, error) {
	cpuPercent, err := cpu.Percent(time.Second, false)
	if err != nil {
		return nil, err
	}
	memory, err := mem.VirtualMemory()
	if err != nil {
		return nil, err
	}
	return &SystemStats{
		MemoryPercent: memory.UsedPercent,
		CpuPercent:    cpuPercent[0],
	}, nil
}
