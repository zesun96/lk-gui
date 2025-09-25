import { arrayMove } from '@dnd-kit/sortable'
import { Events } from '@wailsio/runtime'
import { type StoreApi, type UseBoundStore, create } from 'zustand'
import {
  type PersistStorage,
  type StorageValue,
  combine,
  persist,
} from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/react/shallow'

// START: Code modified from: https://zustand.docs.pmnd.rs/guides/auto-generating-selectors
type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & {
    use: { [K in keyof T]: () => T[K] }
    useShallow: { [K in keyof T]: () => T[K] }
  }
  : never

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  const store = _store as WithSelectors<typeof _store>
  store.use = {}
  store.useShallow = {}
  for (const k of Object.keys(store.getState())) {
    // biome-ignore lint/suspicious/noExplicitAny: Code from source
    ; (store.use as any)[k] = () => store((s) => s[k as keyof typeof s])
      // biome-ignore lint/suspicious/noExplicitAny: Code from source above
      ; (store.useShallow as any)[k] = () =>
        store(useShallow((s) => s[k as keyof typeof s]))
  }

  return store
}
// END

// Flag to prevent unnecessary store rehydration when modifications are from the client.
let isWritingConfigFromClient = false

// Custom storage object.
const storage: PersistStorage<Partial<WindowState>> = {
  getItem: async (name) => {
    try {
      const value = localStorage.getItem(name)
      if (value) {
        return JSON.parse(value) as StorageValue<Partial<WindowState>>
      }
      return null
    } catch (error) {
      console.error('Failed to get item from localStorage:', error)
      return null
    }
  },
  setItem: async (name, value) => {
    try {
      isWritingConfigFromClient = true
      localStorage.setItem(name, JSON.stringify(value))
      setTimeout(() => {
        isWritingConfigFromClient = false
      }, 100)
    } catch (error) {
      console.error('Failed to set item in localStorage:', error)
    }
  },
  removeItem: async (name) => {
    try {
      isWritingConfigFromClient = true
      localStorage.removeItem(name)
      setTimeout(() => {
        isWritingConfigFromClient = false
      }, 100)
    } catch (error) {
      console.error('Failed to remove item from localStorage:', error)
    }
  },
}

export type WindowState = {
  editingNameOfRequestId: string
  activeRequestId: string
  sortOrder: string[]
  theme: string
  deleteRequestAfterMs: number
  hasSeenOnboarding: boolean
  hasSeenTour: boolean
  lkCommandPath: string
  customCommands: Array<{
    id: string
    label: string
    value: string
    description: string
    template: string
    category: string
  }>
  requests: {
    [key: string]: {
      id: string
      title: string
      address: string
      method: string
      methodSource: string
      request: string
      response: string
      params: Array<{ key: string; value: string; description: string; enabled: boolean }>
      updatedAt: string
      isExecuting?: boolean
    }
  }
}

const getInitialState = (): WindowState => {
  const id = crypto.randomUUID()

  return {
    editingNameOfRequestId: '',
    activeRequestId: id,
    sortOrder: [id],
    theme: 'light',
    deleteRequestAfterMs: 604800000, // 7 days in milliseconds
    hasSeenOnboarding: false,
    hasSeenTour: true, // The end of the onboarding sets this to false to start to tour.
    lkCommandPath: 'lk', // 默认使用系统 PATH 中的 lk 命令
    customCommands: [],
    requests: {
      [id]: {
        id: id,
        title: 'New Request',
        address: '',
        method: '',
        methodSource: '',
        request: '',
        response: '',
        params: [],
        updatedAt: new Date().toISOString(),
        isExecuting: false,
      },
    },
  }
}

export const useWindowStore = createSelectors(
  create(
    persist(
      immer(
        combine(getInitialState(), (set, _) => {
          return {
            addRequest: () =>
              set((state) => {
                const id = crypto.randomUUID()
                state.requests[id] = {
                  id: id,
                  title: 'New Request',
                  address: '',
                  method: '',
                  methodSource: '',
                  request: '',
                  response: '',
                  params: [],
                  updatedAt: new Date().toISOString(),
                  isExecuting: false,
                }
                state.sortOrder.unshift(id)

                state.activeRequestId = id
                state.editingNameOfRequestId = id
              }),
            duplicateRequest: (id: string) =>
              set((state) => {
                const index = state.sortOrder.indexOf(id)
                const newId = crypto.randomUUID()
                state.requests[newId] = {
                  ...state.requests[id],
                  id: newId,
                  title: `Copy of ${state.requests[id].title}`,
                  updatedAt: new Date().toISOString(),
                  isExecuting: false,
                }
                state.sortOrder.splice(index + 1, 0, newId)
              }),
            deleteRequest: (id: string) =>
              set((state) => {
                if (state.sortOrder.length > 1) {
                  // Don't delete the last request. TODO: Create a view with no requests.
                  delete state.requests[id]
                  const index = state.sortOrder.indexOf(id)
                  state.sortOrder.splice(index, 1)
                  if (state.activeRequestId === id) {
                    if (index === state.sortOrder.length) {
                      state.activeRequestId = state.sortOrder[index - 1]
                    } else {
                      state.activeRequestId = state.sortOrder[index]
                    }
                  }
                }
              }),
            dndMoveRequests: (fromId: string, toId: string) =>
              set((state) => {
                const oldIndex = state.sortOrder.indexOf(fromId)
                const newIndex = state.sortOrder.indexOf(toId)
                state.sortOrder = arrayMove(state.sortOrder, oldIndex, newIndex)
              }),
            setActiveRequestId: (id: string) =>
              set((state) => {
                state.activeRequestId = id
              }),
            updateActiveRequest: (
              req: Partial<
                WindowState['requests'][keyof WindowState['requests']]
              >,
            ) =>
              set((state) => {
                state.requests[state.activeRequestId] = {
                  ...state.requests[state.activeRequestId],
                  ...req,
                  updatedAt: new Date().toISOString(),
                }
              }),
            updateRequest: (
              reqId: string,
              req: Partial<
                WindowState['requests'][keyof WindowState['requests']]
              >,
            ) =>
              set((state) => {
                state.requests[reqId] = {
                  ...state.requests[reqId],
                  ...req,
                  updatedAt: new Date().toISOString(),
                }
              }),
            setEditingNameOfRequestId: (id: string) =>
              set((state) => {
                state.editingNameOfRequestId = id
              }),
            setTheme: (theme: string) =>
              set((state) => {
                state.theme = theme
              }),
            setDeleteRequestAfterMs: (ms: number) =>
              set((state) => {
                state.deleteRequestAfterMs = ms
              }),
            setHasSeenOnboarding: (seen: boolean) =>
              set((state) => {
                state.hasSeenOnboarding = seen
              }),
            setHasSeenTour: (seen: boolean) =>
              set((state) => {
                state.hasSeenTour = seen
              }),
            addCustomCommand: (command: Omit<WindowState['customCommands'][0], 'id'>) =>
              set((state) => {
                const id = crypto.randomUUID()
                state.customCommands.push({
                  ...command,
                  id,
                })
              }),
            updateCustomCommand: (id: string, command: Partial<Omit<WindowState['customCommands'][0], 'id'>>) =>
              set((state) => {
                const index = state.customCommands.findIndex(cmd => cmd.id === id)
                if (index !== -1) {
                  state.customCommands[index] = {
                    ...state.customCommands[index],
                    ...command,
                  }
                }
              }),
            deleteCustomCommand: (id: string) =>
              set((state) => {
                state.customCommands = state.customCommands.filter(cmd => cmd.id !== id)
              }),
            setLkCommandPath: (path: string) =>
              set((state) => {
                state.lkCommandPath = path
              }),
            setRequestExecuting: (requestId: string, isExecuting: boolean) =>
              set((state) => {
                if (state.requests[requestId]) {
                  state.requests[requestId].isExecuting = isExecuting
                  state.requests[requestId].updatedAt = new Date().toISOString()
                }
              }),
          }
        }),
      ),
      {
        name: 'window-store',
        storage: storage,
        partialize: (state) => ({
          activeRequestId: state.activeRequestId,
          requests: state.requests,
          sortOrder: state.sortOrder,
          theme: state.theme,
          deleteRequestAfterMs: state.deleteRequestAfterMs,
          hasSeenOnboarding: state.hasSeenOnboarding,
          hasSeenTour: state.hasSeenTour,
          lkCommandPath: state.lkCommandPath,
          customCommands: state.customCommands,
        }),
      },
    ),
  ),
)

Events.On('configChanged:window-store', () => {
  if (!isWritingConfigFromClient) {
    // console.debug('configChanged:window-store')
    useWindowStore.persist.rehydrate()
  }
})

if (import.meta.hot) {
  // Prevent multiple listeners during hot module replacement in development.
  import.meta.hot.on('vite:beforeUpdate', () => {
    Events.Off('configChanged:window-store')
  })
}
