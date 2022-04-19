import hotkeys from 'hotkeys-js'
import { useIsHotkeyPressed } from './useIsHotkeyPressed'
import { Options, useHotkeys } from './useHotkeys'

const isHotkeyPressed = hotkeys.isPressed

export { useHotkeys, useIsHotkeyPressed, isHotkeyPressed, Options }
