import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getErrorMessage } from '@/utils/utils'
import { useWindowStore } from '@/window-store'
import Editor, { useMonaco } from '@monaco-editor/react'
import { WML } from '@wailsio/runtime'
import { Bug, Lightbulb, NotepadTextDashed } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type {
  ImperativePanelHandle,
  PanelOnResize,
} from 'react-resizable-panels'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

export default function HttpClient() {
  const activeRequestId = useWindowStore.use.activeRequestId()
  const requests = useWindowStore.use.requests()
  const theme = useWindowStore.use.theme()
  const setTheme = useWindowStore.use.setTheme()
  const updateActiveRequest = useWindowStore.use.updateActiveRequest()

  const [loading, setLoading] = useState(false)

  const { address, method, request, response } =
    requests[activeRequestId]
  const setAddress = (address: string) => updateActiveRequest({ address })
  const setRequest = (request: string) => updateActiveRequest({ request })
  const setResponse = (response: string) => updateActiveRequest({ response })

  const monaco = useMonaco()

  // Provide inlay hints for response status codes in the response.
  useEffect(() => {
  }, [monaco])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const generateTemplate = async () => {
    return
  }

  const sendRequest = async () => {
    if (method.trim().length === 0) {
      setResponse('Please select a method first.')
      return
    }
    setLoading(true)
    try {
      // call method
      let result = ''
      setResponse(result)
    } catch (error) {
      setResponse(getErrorMessage(error))
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
        <div className="grid grid-cols-1 grid-rows-[min-content_min-content_min-content_minmax(0,_1fr)_min-content] p-4 space-y-4 h-full">
          <h2 className="text-xl font-bold text-right">Request</h2>
          <div className="flex-1">
            <Input
              id="input-address"
              type="text"
              placeholder="Enter Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              spellCheck="false"
            />
          </div>

          <div className="grid grid-cols-[minmax(0,_1fr)_min-content] space-x-2 overflow-hidden">
            <SelectMethod />
            <Button id="send-request" onClick={sendRequest} disabled={loading}>
              Send Request
            </Button>
          </div>

          <Editor
            height="100%"
            language="json"
            value={request}
            onChange={(v) => setRequest(v ?? '')}
            options={{
              minimap: {
                enabled: false,
              },
              wordWrap: 'on',
              scrollBeyondLastLine: false, // removes unnecesary scrollbar
              theme: theme === 'light' ? 'vs' : 'vs-dark',
              tabSize: 2,
            }}
            className="input-request mb-4"
          />
          <div>
            <Button
              id="generate-request-template"
              variant="outline"
              onClick={generateTemplate}
            >
              <NotepadTextDashed
                className="-ms-1 me-2"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Generate Request Template
            </Button>
          </div>
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
                      id="suggest-feature"
                      variant="outline"
                      size="icon"
                      aria-label="Suggest a feature"
                      wml-openurl="https://grpcmd.featurebase.app"
                    >
                      <Lightbulb size={16} strokeWidth={2} aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    Suggest a feature
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      id="report-bug"
                      variant="outline"
                      size="icon"
                      aria-label="Report a bug"
                      wml-openurl="https://github.com/grpcmd/grpcmd-gui/issues"
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
            language="json"
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
            }}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
