import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWindowStore } from '@/window-store'
import { Trash2, Plus } from 'lucide-react'

export default function ParamsInput() {
    const activeRequestId = useWindowStore.use.activeRequestId()
    const requests = useWindowStore.use.requests()
    const updateActiveRequest = useWindowStore.use.updateActiveRequest()

    const { params } = requests[activeRequestId]

    const updateParams = (newParams: Array<{ key: string; value: string; description: string; enabled: boolean }>) => {
        updateActiveRequest({ params: newParams })
    }

    const addParam = () => {
        const newParams = [...params, { key: '', value: '', description: '', enabled: true }]
        updateParams(newParams)
    }

    const removeParam = (index: number) => {
        const newParams = params.filter((_, i) => i !== index)
        updateParams(newParams)
    }

    const updateParam = (index: number, field: 'key' | 'value' | 'description' | 'enabled', value: string | boolean) => {
        const newParams = params.map((param, i) =>
            i === index ? { ...param, [field]: value } : param
        )
        updateParams(newParams)
    }

    const toggleParam = (index: number) => {
        updateParam(index, 'enabled', !params[index].enabled)
    }

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex justify-between items-center flex-shrink-0">
                <h3 className="text-sm font-medium">Environment Variables</h3>
                <Button
                    onClick={addParam}
                    size="sm"
                    variant="outline"
                    className="h-8 px-2"
                >
                    <Plus size={14} />
                    Add Variable
                </Button>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
                {params.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No environment variables added yet</p>
                        <p className="text-xs mt-1">Click "Add Variable" to get started</p>
                    </div>
                ) : (
                    <div className="border rounded-md h-full flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="sticky top-0 bg-background z-10 border-b">
                                    <tr>
                                        <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground w-8"></th>
                                        <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground w-1/4">Variable</th>
                                        <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground w-2/5">Value</th>
                                        <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground w-1/4">Description</th>
                                        <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground w-8"></th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {params.map((param, index) => (
                                        <tr key={index} className="border-b border-border transition-colors hover:bg-muted/50">
                                            <td className="p-3 align-middle">
                                                <input
                                                    type="checkbox"
                                                    checked={param.enabled}
                                                    onChange={() => toggleParam(index)}
                                                    className="w-4 h-4 accent-blue-600"
                                                />
                                            </td>
                                            <td className="p-3 align-middle">
                                                <Input
                                                    placeholder="Variable name (e.g., LIVEKIT_URL)"
                                                    value={param.key}
                                                    onChange={(e) => updateParam(index, 'key', e.target.value)}
                                                    className="h-8 text-sm"
                                                    disabled={!param.enabled}
                                                />
                                            </td>
                                            <td className="p-3 align-middle">
                                                <Input
                                                    placeholder="Variable value"
                                                    value={param.value}
                                                    onChange={(e) => updateParam(index, 'value', e.target.value)}
                                                    className="h-8 text-sm"
                                                    disabled={!param.enabled}
                                                />
                                            </td>
                                            <td className="p-3 align-middle">
                                                <Input
                                                    placeholder="Description (optional)"
                                                    value={param.description}
                                                    onChange={(e) => updateParam(index, 'description', e.target.value)}
                                                    className="h-8 text-sm"
                                                    disabled={!param.enabled}
                                                />
                                            </td>
                                            <td className="p-3 align-middle">
                                                <Button
                                                    onClick={() => removeParam(index)}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <div className="text-xs text-muted-foreground flex-shrink-0">
                <p>Environment variables will be set before executing the command</p>
            </div>
        </div>
    )
}