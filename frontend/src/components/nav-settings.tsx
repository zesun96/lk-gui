import { Cog, Settings, FolderOpen, Terminal } from 'lucide-react'
import { Dialogs } from '@wailsio/runtime'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { IsMac } from '@/utils/platform'
import { DialogTrigger } from '@radix-ui/react-dialog'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useWindowStore } from '@/window-store'
import { Run } from '../../bindings/changeme/cmdservice'

export function NavSettings() {
  const lkCommandPath = useWindowStore.use.lkCommandPath()
  const setLkCommandPath = useWindowStore.use.setLkCommandPath()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [tempLkPath, setTempLkPath] = useState('')
  const [testResult, setTestResult] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    if (dialogOpen) {
      setTempLkPath(lkCommandPath)
      setTestResult(null) // 重置测试结果
    }
  }, [dialogOpen, lkCommandPath])

  // 保存设置
  const saveSettings = () => {
    setLkCommandPath(tempLkPath.trim() || 'lk')
    setDialogOpen(false)
  }

  // 重置为默认值
  const resetToDefault = () => {
    setTempLkPath('lk')
    setTestResult(null) // 清除测试结果
  }

  // 浏览文件选择 lk 命令
  const browseForFile = async () => {
    try {
      // 使用 Wails 原生文件对话框 API
      const dialog = await Dialogs.OpenFile({
        Title: 'Select LiveKit CLI Executable',
        Filters: [
          {
            DisplayName: 'Executable Files',
            Pattern: '*.exe;lk*'
          },
          {
            DisplayName: 'All Files',
            Pattern: '*.*'
          }
        ]
      })

      console.log('Dialog.OpenFile result:', dialog, 'Type:', typeof dialog)

      if (dialog && Array.isArray(dialog) && dialog.length > 0) {
        const selectedPath = dialog[0]
        console.log('Selected file path (array):', selectedPath)
        setTempLkPath(selectedPath)
        setTestResult(null)
        return
      } else if (dialog && typeof dialog === 'string' && dialog.trim()) {
        // 处理返回单个字符串的情况
        console.log('Selected file path (string):', dialog)
        setTempLkPath(dialog.trim())
        setTestResult(null)
        return
      }

      console.log('No file selected, dialog result:', dialog)

    } catch (error) {
      console.error('Failed to open native file dialog:', error)

      // 后备方案：手动输入
      const path = prompt(
        'Please enter the full path to your LiveKit CLI executable:\n\n' +
        'Examples:\n' +
        '• Windows: C:\\Program Files\\LiveKit\\lk.exe\n' +
        '• macOS/Linux: /usr/local/bin/lk\n' +
        '• Current directory: ./lk\n' +
        '• System PATH: lk'
      )

      if (path && path.trim()) {
        setTempLkPath(path.trim())
        setTestResult(null)
      }
    }
  }

  // 测试命令路径
  const testCommand = async () => {
    const commandToTest = tempLkPath.trim() || 'lk'
    setIsTesting(true)
    setTestResult(null)

    try {
      // 测试命令是否可用，使用 --version 或 --help 参数
      const testCmd = `${commandToTest} --version`
      console.log('Testing command:', testCmd)

      const result = await Run(testCmd)

      if (result && result.trim()) {
        setTestResult(`✅ Command test successful!\n${result.trim()}`)
      } else {
        setTestResult('✅ Command appears to be available (no version info returned)')
      }
    } catch (error) {
      console.error('Command test failed:', error)
      const errorMsg = error instanceof Error ? error.message : String(error)
      setTestResult(`❌ Command test failed:\n${errorMsg}`)
    } finally {
      setIsTesting(false)
    }
  }

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === ',' && (event.metaKey || event.ctrlKey)) {
      setDialogOpen(true)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])
  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <SidebarMenu>
        <SidebarMenuItem>
          <DialogTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              tooltip={{
                children: (
                  <div>
                    Settings
                    <Badge
                      variant={'outline'}
                      className="ml-4 text-primary-foreground"
                    >
                      {IsMac() ? '⌘ ,' : 'Ctrl + ,'}
                    </Badge>
                  </div>
                ),
              }}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  <Settings />
                </AvatarFallback>
              </Avatar>
              <div className="flex text-left text-sm leading-tight w-full justify-between">
                <span className="truncate font-semibold">Settings</span>
                <Badge variant={'outline'} className="ml-4">
                  {IsMac() ? '⌘ ,' : 'Ctrl + ,'}
                </Badge>
              </div>
            </SidebarMenuButton>
          </DialogTrigger>
        </SidebarMenuItem>
      </SidebarMenu>

      <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-2xl [&>button:last-child]:top-5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-6 py-4 text-base">
            Settings
          </DialogTitle>
          <div className="h-[60vh] px-2 py-2">
            <DialogDescription asChild>
              <Tabs
                defaultValue="tab-general"
                orientation="vertical"
                className="grid grid-cols-[min-content_minmax(0,_1fr)] grid-rows-1 w-full h-full gap-2"
              >
                <TabsList className="flex-col gap-1 rounded-none bg-transparent px-1 py-0 text-foreground h-full justify-start">
                  <TabsTrigger
                    value="tab-general"
                    className="relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
                  >
                    <Cog
                      className="-ms-0.5 me-1.5 opacity-60"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    General
                  </TabsTrigger>
                </TabsList>
                <div className="grow rounded-lg border border-border text-start overflow-scroll">
                  <TabsContent value="tab-general" className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold">General Settings</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Configure general application settings.
                        </p>
                      </div>

                      {/* LiveKit CLI Path Settings */}
                      <div className="space-y-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="lk-path" className="text-sm font-medium">
                              LiveKit CLI Path
                            </Label>
                            <div className="flex space-x-2">
                              <Input
                                id="lk-path"
                                placeholder="e.g., lk or /usr/local/bin/lk or C:\\livekit\\lk.exe"
                                value={tempLkPath}
                                onChange={(e) => setTempLkPath(e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={browseForFile}
                                title="Browse for lk executable file"
                              >
                                <FolderOpen size={14} className="mr-1" />
                                Browse
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Specify the full path to the LiveKit CLI executable, or use 'lk' if it's in your system PATH.
                            </p>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={testCommand}
                              disabled={isTesting}
                            >
                              {isTesting ? 'Testing...' : 'Test Command'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={resetToDefault}
                            >
                              Reset to Default
                            </Button>
                          </div>

                          <div className="bg-muted/30 rounded p-3">
                            <p className="text-xs font-medium mb-1">Current Command:</p>
                            <code className="text-xs font-mono bg-background/50 px-2 py-1 rounded">
                              {tempLkPath || 'lk'}
                            </code>
                          </div>

                          {/* 测试结果显示 */}
                          {testResult && (
                            <div className={`rounded p-3 ${testResult.startsWith('✅')
                              ? 'bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800'
                              : 'bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800'
                              }`}>
                              <p className="text-xs font-medium mb-1">
                                Test Result:
                              </p>
                              <pre className={`text-xs whitespace-pre-wrap ${testResult.startsWith('✅')
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-red-700 dark:text-red-300'
                                }`}>
                                {testResult}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Save/Cancel buttons */}
                      <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={saveSettings}
                        >
                          Save Settings
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </DialogDescription>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
