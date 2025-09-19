import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useWindowStore } from '@/window-store'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface CustomCommandFormData {
    label: string
    value: string
    description: string
    template: string
    category: string
}

const categories = [
    'Cloud & Authentication',
    'Project Management',
    'App Management',
    'Room Operations',
    'Testing & Tokens',
    'Custom'
]

export default function CustomCommandManager() {
    const customCommands = useWindowStore.use.customCommands()
    const addCustomCommand = useWindowStore.use.addCustomCommand()
    const updateCustomCommand = useWindowStore.use.updateCustomCommand()
    const deleteCustomCommand = useWindowStore.use.deleteCustomCommand()

    const [isOpen, setIsOpen] = useState(false)
    const [editingCommand, setEditingCommand] = useState<string | null>(null)
    const [formData, setFormData] = useState<CustomCommandFormData>({
        label: '',
        value: '',
        description: '',
        template: '',
        category: 'Custom'
    })

    const resetForm = () => {
        setFormData({
            label: '',
            value: '',
            description: '',
            template: '',
            category: 'Custom'
        })
        setEditingCommand(null)
    }

    const handleSave = () => {
        if (!formData.label || !formData.value || !formData.template) {
            return
        }

        if (editingCommand) {
            updateCustomCommand(editingCommand, formData)
        } else {
            addCustomCommand(formData)
        }

        resetForm()
        setIsOpen(false)
    }

    const handleEdit = (command: typeof customCommands[0]) => {
        setFormData({
            label: command.label,
            value: command.value,
            description: command.description,
            template: command.template,
            category: command.category
        })
        setEditingCommand(command.id)
        setIsOpen(true)
    }

    const handleDelete = (id: string) => {
        deleteCustomCommand(id)
    }

    const handleClose = () => {
        setIsOpen(false)
        resetForm()
    }

    return (
        <div className="space-y-3 max-h-80 overflow-y-auto">
            <div className="flex justify-between items-center">
                <h4 className="text-xs font-medium text-muted-foreground">Custom Commands</h4>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            <Plus size={12} />
                            Add
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingCommand ? 'Edit Custom Command' : 'Add Custom Command'}
                            </DialogTitle>
                            <DialogDescription>
                                Create a custom LiveKit command that you can reuse later.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="label" className="text-right">
                                    Label
                                </Label>
                                <Input
                                    id="label"
                                    placeholder="e.g., My Custom Command"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="value" className="text-right">
                                    Value
                                </Label>
                                <Input
                                    id="value"
                                    placeholder="e.g., lk my-command"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right">
                                    Category
                                </Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Description
                                </Label>
                                <Input
                                    id="description"
                                    placeholder="Brief description of the command"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="template" className="text-right pt-2">
                                    Template
                                </Label>
                                <Textarea
                                    id="template"
                                    placeholder="e.g., lk my-command --option value <placeholder>"
                                    value={formData.template}
                                    onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                                    className="col-span-3 min-h-[80px]"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={handleSave}>
                                {editingCommand ? 'Update' : 'Add'} Command
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {customCommands.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No custom commands added yet</p>
                    <p className="text-xs mt-1">Click "Add Command" to create your first custom command</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {customCommands.map((command) => (
                        <div
                            key={command.id}
                            className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium text-sm">{command.label}</span>
                                    <span className="text-xs bg-muted px-2 py-1 rounded">
                                        {command.category}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                    {command.description}
                                </p>
                                <code className="text-xs text-muted-foreground mt-1 block truncate">
                                    {command.template}
                                </code>
                            </div>
                            <div className="flex items-center space-x-1 ml-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleEdit(command)}
                                >
                                    <Edit size={14} />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    onClick={() => handleDelete(command.id)}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}