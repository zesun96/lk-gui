import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/utils/utils'
import { useWindowStore } from '@/window-store'
import Editor, { useMonaco } from '@monaco-editor/react'
import { WML } from '@wailsio/runtime'
import { Bug, Play, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type {
  ImperativePanelHandle,
  PanelOnResize,
} from 'react-resizable-panels'
import ParamsInput from './params-input'
import SelectMethod from './select-method'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './ui/resizable'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'
import { Run } from '../../bindings/changeme/cmdservice'

export default function LivekitCli() {
  const activeRequestId = useWindowStore.use.activeRequestId()
  const requests = useWindowStore.use.requests()
  const theme = useWindowStore.use.theme()
  const lkCommandPath = useWindowStore.use.lkCommandPath()
  const setTheme = useWindowStore.use.setTheme()
  const updateActiveRequest = useWindowStore.use.updateActiveRequest()

  const [loading, setLoading] = useState(false)

  const { method, request, response } =
    requests[activeRequestId]
  const setRequest = (request: string) => updateActiveRequest({ request })
  const setResponse = (response: string) => updateActiveRequest({ response })

  const monaco = useMonaco()

  // Provide inlay hints for response status codes in the response.
  useEffect(() => {
  }, [monaco])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const sendRequest = async () => {
    if (method.trim().length === 0) {
      setResponse('Please select a LiveKit command first.')
      return
    }

    if (request.trim().length === 0) {
      setResponse('Please enter a command to execute.')
      return
    }

    setLoading(true)
    setResponse('Executing command...')

    try {
      // 构建完整的命令
      let fullCommand = request.trim()

      // 如果命令不是以绝对路径开始且不是以 'lk' 开始，则添加配置的 lk 命令路径
      if (fullCommand && !fullCommand.startsWith('/') && !fullCommand.startsWith('C:') && !fullCommand.startsWith('lk ')) {
        // 如果命令不是以 lk 开始，则添加 lk 命令路径
        if (!fullCommand.startsWith('lk')) {
          fullCommand = `${lkCommandPath} ${fullCommand}`
        }
      } else if (fullCommand.startsWith('lk ')) {
        // 如果命令以 'lk ' 开始，替换为配置的路径
        fullCommand = fullCommand.replace(/^lk /, `${lkCommandPath} `)
      }

      // 如果有环境变量，添加到命令前
      const enabledEnvVars = requests[activeRequestId].params?.filter(p => p.enabled && p.key && p.value) || []
      if (enabledEnvVars.length > 0) {
        const envString = enabledEnvVars.map(p => `${p.key}=${p.value}`).join(' ')
        fullCommand = `${envString} ${fullCommand}`
      }

      console.log('Executing command:', fullCommand)

      // 调用后端执行命令
      const result = await Run(fullCommand)
      setResponse(result || 'Command executed successfully (no output)')
    } catch (error) {
      console.error('Command execution error:', error)
      setResponse(`Error: ${getErrorMessage(error)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    WML.Reload()
  }, [])

  const reqPanelRef = useRef<ImperativePanelHandle>(null)

  const handleResize: PanelOnResize = (size, _prevSize) => {
    if (size < 20) {
      // Set minimum size of request panel to 20%.
      reqPanelRef.current?.resize(20)
    } else if (size > 80) {
      // Set maximum size of request panel to 80%.
      reqPanelRef.current?.resize(80)
    } else if (49 < size && size < 51 && size !== 50) {
      // Snap to 50% when within 1%.
      reqPanelRef.current?.resize(50)
    }
  }

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        className="h-screen"
        ref={reqPanelRef}
        onResize={handleResize}
      >
        <div className="flex flex-col p-4 h-full space-y-4">
          <h2 className="text-xl font-bold text-right flex-shrink-0">Request</h2>

          <div className="grid grid-cols-[minmax(0,_1fr)_min-content] space-x-2 overflow-hidden flex-shrink-0">
            <SelectMethod />
            <Button
              id="send-request"
              onClick={sendRequest}
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Square size={16} className="mr-2" />
                  Executing...
                </>
              ) : (
                <>
                  <Play size={16} className="mr-2" />
                  Execute
                </>
              )}
            </Button>
          </div>

          <Tabs defaultValue="command" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="command">Command</TabsTrigger>
              <TabsTrigger value="env">Environment</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="command" className="flex-1 min-h-0 mt-4">
              <div className="h-full flex flex-col space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  LiveKit CLI Command
                </label>
                <Editor
                  height="100%"
                  language="shell"
                  value={request}
                  onChange={(v) => setRequest(v ?? '')}
                  options={{
                    minimap: {
                      enabled: false,
                    },
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    theme: theme === 'light' ? 'vs' : 'vs-dark',
                    tabSize: 2,
                    fontSize: 13,
                    lineNumbers: 'off',
                    glyphMargin: false,
                    folding: false,
                    lineDecorationsWidth: 0,
                    lineNumbersMinChars: 0,
                  }}
                  className="input-request border rounded"
                />
              </div>
            </TabsContent>

            <TabsContent value="env" className="flex-1 min-h-0 mt-4">
              <div className="h-full flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Environment Variables</h3>
                  <p className="text-xs text-muted-foreground">These will be set before running the command</p>
                </div>
                <ParamsInput />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 min-h-0 mt-4">
              <div className="h-full flex flex-col space-y-4">
                <h3 className="text-sm font-medium">Command Preview</h3>
                <div className="flex-1 space-y-4">
                  {/* 环境变量预览 */}
                  <div className="border rounded p-4 bg-muted/20">
                    <h4 className="text-sm font-medium mb-2">Environment Variables</h4>
                    {(() => {
                      const enabledEnvVars = requests[activeRequestId].params?.filter(p => p.enabled && p.key && p.value) || []
                      return enabledEnvVars.length > 0 ? (
                        <div className="space-y-1">
                          {enabledEnvVars.map((param, index) => (
                            <div key={index} className="text-sm font-mono bg-background/50 p-2 rounded">
                              <span className="text-blue-600">{param.key}</span>=<span className="text-green-600">{param.value}</span>
                              {param.description && (
                                <span className="text-muted-foreground ml-2">// {param.description}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No environment variables set</p>
                      )
                    })()}
                  </div>

                  {/* 完整命令预览 */}
                  <div className="border rounded p-4 bg-muted/20">
                    <h4 className="text-sm font-medium mb-2">Full Command</h4>
                    {(() => {
                      const enabledEnvVars = requests[activeRequestId].params?.filter(p => p.enabled && p.key && p.value) || []
                      const envString = enabledEnvVars.length > 0 ? enabledEnvVars.map(p => `${p.key}=${p.value}`).join(' ') + ' ' : ''

                      let commandToShow = request.trim() || 'No command entered'
                      // 如果命令不是以绝对路径开始且不是以 'lk' 开始，则添加配置的 lk 命令路径
                      if (commandToShow !== 'No command entered' && !commandToShow.startsWith('/') && !commandToShow.startsWith('C:') && !commandToShow.startsWith('lk ')) {
                        if (!commandToShow.startsWith('lk')) {
                          commandToShow = `${lkCommandPath} ${commandToShow}`
                        }
                      } else if (commandToShow.startsWith('lk ')) {
                        commandToShow = commandToShow.replace(/^lk /, `${lkCommandPath} `)
                      }

                      const fullCommand = envString + commandToShow

                      return (
                        <div className="text-sm font-mono bg-background/50 p-3 rounded whitespace-pre-wrap break-all">
                          {fullCommand}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ResizablePanel>
      <ResizableHandle onDoubleClick={() => reqPanelRef.current?.resize(50)} />
      <ResizablePanel className="h-screen">
        <div className="grid grid-cols-1 grid-rows-[min-content_minmax(0,_1fr)] p-4 h-full">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold mb-4">Response</h2>
            <div className="flex space-x-2">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      id="report-bug"
                      variant="outline"
                      size="icon"
                      aria-label="Report a bug"
                      wml-openurl="https://github.com/zesun96/lk-gui/issues"
                    >
                      <Bug size={16} strokeWidth={2} aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    Report a bug
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Select value={theme} onValueChange={(v) => setTheme(v)}>
                <SelectTrigger id="input-theme" className="w-[90px]">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Theme</SelectLabel>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Editor
            className="output-response"
            height="100%"
            language="plaintext"
            value={response}
            options={{
              minimap: {
                enabled: false,
              },
              readOnly: true,
              wordWrap: 'on',
              scrollBeyondLastLine: false, // removes unnecesary scrollbar
              theme: theme === 'light' ? 'vs' : 'vs-dark',
              tabSize: 2,
              fontSize: 13,
            }}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
