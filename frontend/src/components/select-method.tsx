import { ChevronDown, Terminal, Settings } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import CustomCommandManager from './custom-command-manager'
import { useWindowStore } from '@/window-store'

const livekitCommands = [
  // Cloud & Authentication
  {
    label: 'Cloud Auth',
    value: 'lk cloud auth',
    description: 'Authenticate with LiveKit Cloud',
    template: 'lk cloud auth'
  },

  // Project Management
  {
    label: 'Project Add',
    value: 'lk project add',
    description: 'Add a new project with API credentials',
    template: 'lk project add --api-key <key> --api-secret <secret> <project_name>'
  },
  {
    label: 'Project List',
    value: 'lk project list',
    description: 'List all projects',
    template: 'lk project list'
  },
  {
    label: 'Project Set Default',
    value: 'lk project set-default',
    description: 'Set default project',
    template: 'lk project set-default <project_name>'
  },

  // App Management
  {
    label: 'App Create',
    value: 'lk app create',
    description: 'Create a new app from template',
    template: 'lk app create --template <template_name> my-app'
  },
  {
    label: 'App List Templates',
    value: 'lk app list-templates',
    description: 'List available app templates',
    template: 'lk app list-templates'
  },

  // Room Operations
  {
    label: 'Room Join (Basic)',
    value: 'lk room join',
    description: 'Join a LiveKit room as publisher',
    template: 'lk room join --identity publisher <room_name>'
  },
  {
    label: 'Room Join (Attributes)',
    value: 'lk room join --attribute',
    description: 'Join room with custom attributes',
    template: 'lk room join --identity publisher --attribute key1=value1 --attribute key2=value2 <room_name>'
  },
  {
    label: 'Room Join (Attribute File)',
    value: 'lk room join --attribute-file',
    description: 'Join room with attributes from JSON file',
    template: 'lk room join --identity publisher --attribute-file attributes.json <room_name>'
  },
  {
    label: 'Room Join (Demo)',
    value: 'lk room join --publish-demo',
    description: 'Join room and publish demo content',
    template: 'lk room join --identity publisher --publish-demo <room_name>'
  },
  {
    label: 'Room Join (Custom Media)',
    value: 'lk room join --publish',
    description: 'Join room and publish custom media files',
    template: 'lk room join --identity publisher --publish <path/to/video.ivf> --publish <path/to/audio.ogg> --fps 23.98 <room_name>'
  },
  {
    label: 'Room List',
    value: 'lk room list',
    description: 'List all rooms',
    template: 'lk room list'
  },
  {
    label: 'Room Create',
    value: 'lk room create',
    description: 'Create a new room',
    template: 'lk room create <room_name>'
  },

  // Egress Testing
  {
    label: 'Egress Test Template',
    value: 'lk egress test-template',
    description: 'Test egress with template configuration',
    template: 'lk egress test-template --base-url http://localhost:3000 --room test-room --layout speaker --video-publishers 3'
  },

  // Token Management
  {
    label: 'Token Create',
    value: 'lk token create',
    description: 'Create access token and open meeting',
    template: 'lk token create --join --room test-room --identity test-user --open meet'
  },

  // Load Testing
  {
    label: 'Load Test (Basic)',
    value: 'lk load-test',
    description: 'Run basic load testing',
    template: 'lk load-test --room test-room --video-publishers 8'
  },
  {
    label: 'Load Test (Advanced)',
    value: 'lk load-test --duration',
    description: 'Run advanced load testing with duration',
    template: 'lk load-test --duration 1m --video-publishers 5 --subscribers 500'
  }
]

export default function SelectMethod() {
  const activeRequestId = useWindowStore.use.activeRequestId()
  const requests = useWindowStore.use.requests()
  const customCommands = useWindowStore.use.customCommands()
  const updateActiveRequest = useWindowStore.use.updateActiveRequest()

  const { method } = requests[activeRequestId]
  const [open, setOpen] = useState<boolean>(false)
  const [showCustomManager, setShowCustomManager] = useState<boolean>(false)

  const handleSelect = (command: typeof livekitCommands[0] | typeof customCommands[0]) => {
    updateActiveRequest({
      method: command.value,
      methodSource: command.label,
      request: command.template
    })
    setOpen(false)
  }

  const toggleCustomManager = () => {
    setShowCustomManager(!showCustomManager)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="input-method"
          variant="outline"
          // biome-ignore lint/a11y/useSemanticElements: button opens a popup
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background px-3 font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20"
        >
          <div className="flex items-center space-x-2">
            <Terminal size={16} className="text-muted-foreground" />
            <span className="truncate">
              {method || 'Select LiveKit Command'}
            </span>
          </div>
          <ChevronDown
            size={16}
            strokeWidth={2}
            className="shrink-0 text-muted-foreground/80"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
        align="start"
      >
        {showCustomManager ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Manage Custom Commands</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={toggleCustomManager}
              >
                Back to Commands
              </Button>
            </div>
            <CustomCommandManager />
          </div>
        ) : (
          <Command>
            <div className="flex items-center border-b border-border">
              <CommandInput placeholder="Search commands..." className="flex-1" />
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleCustomManager}
                className="m-2 h-8 px-2"
                title="Manage Custom Commands"
              >
                <Settings size={14} />
              </Button>
            </div>
            <CommandList>
              <CommandEmpty>No commands found.</CommandEmpty>
              <CommandSeparator />

              <CommandGroup heading="Cloud & Authentication">
                {livekitCommands.filter(cmd => cmd.value.startsWith('lk cloud')).map((command) => (
                  <CommandItem
                    key={command.value}
                    value={command.value}
                    onSelect={() => handleSelect(command)}
                    className="flex flex-col items-start space-y-1 py-3"
                  >
                    <div className="flex items-center space-x-2">
                      <Terminal size={14} />
                      <span className="font-medium">{command.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-6">
                      {command.description}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandGroup heading="Project Management">
                {livekitCommands.filter(cmd => cmd.value.startsWith('lk project')).map((command) => (
                  <CommandItem
                    key={command.value}
                    value={command.value}
                    onSelect={() => handleSelect(command)}
                    className="flex flex-col items-start space-y-1 py-3"
                  >
                    <div className="flex items-center space-x-2">
                      <Terminal size={14} />
                      <span className="font-medium">{command.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-6">
                      {command.description}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandGroup heading="App Management">
                {livekitCommands.filter(cmd => cmd.value.startsWith('lk app')).map((command) => (
                  <CommandItem
                    key={command.value}
                    value={command.value}
                    onSelect={() => handleSelect(command)}
                    className="flex flex-col items-start space-y-1 py-3"
                  >
                    <div className="flex items-center space-x-2">
                      <Terminal size={14} />
                      <span className="font-medium">{command.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-6">
                      {command.description}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandGroup heading="Room Operations">
                {livekitCommands.filter(cmd => cmd.value.startsWith('lk room')).map((command) => (
                  <CommandItem
                    key={command.value}
                    value={command.value}
                    onSelect={() => handleSelect(command)}
                    className="flex flex-col items-start space-y-1 py-3"
                  >
                    <div className="flex items-center space-x-2">
                      <Terminal size={14} />
                      <span className="font-medium">{command.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-6">
                      {command.description}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandGroup heading="Testing & Tokens">
                {livekitCommands.filter(cmd =>
                  cmd.value.startsWith('lk egress') ||
                  cmd.value.startsWith('lk token') ||
                  cmd.value.startsWith('lk load-test')
                ).map((command) => (
                  <CommandItem
                    key={command.value}
                    value={command.value}
                    onSelect={() => handleSelect(command)}
                    className="flex flex-col items-start space-y-1 py-3"
                  >
                    <div className="flex items-center space-x-2">
                      <Terminal size={14} />
                      <span className="font-medium">{command.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-6">
                      {command.description}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>

              {customCommands.length > 0 && (
                <>
                  {['Cloud & Authentication', 'Project Management', 'App Management', 'Room Operations', 'Testing & Tokens', 'Custom'].map(category => {
                    const commandsInCategory = customCommands.filter(cmd => cmd.category === category)
                    if (commandsInCategory.length === 0) return null

                    return (
                      <CommandGroup key={`custom-${category}`} heading={`${category} (Custom)`}>
                        {commandsInCategory.map((command) => (
                          <CommandItem
                            key={`custom-${command.id}`}
                            value={command.value}
                            onSelect={() => handleSelect(command)}
                            className="flex flex-col items-start space-y-1 py-3"
                          >
                            <div className="flex items-center space-x-2">
                              <Terminal size={14} />
                              <span className="font-medium">{command.label}</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                Custom
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground ml-6">
                              {command.description}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )
                  })}
                </>
              )}
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  )
}
