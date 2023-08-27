import hotkeys from 'hotkeys-js'
import { useHotkeys } from './useHotkeys'
import type { Options } from './useHotkeys'

const isHotkeyPressed = hotkeys.isPressed

export { useHotkeys, isHotkeyPressed, Options }
