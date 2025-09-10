import { System } from '@wailsio/runtime'

export function IsMac() {
    try {
        return System.IsMac()
    } catch (error) {
        return false
    }
}