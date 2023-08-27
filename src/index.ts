import hotkeys from 'hotkeys-js'
import { useIsHotkeyPressed } from './useIsHotkeyPressed'
import { useHotkeys } from './useHotkeys'
import type { Options } from './useHotkeys'

const isHotkeyPressed = hotkeys.isPressed

export { useHotkeys, useIsHotkeyPressed, isHotkeyPressed, Options }
