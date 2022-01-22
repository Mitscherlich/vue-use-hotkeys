import hotkeys from 'hotkeys-js';

/**
 * @deprecated Use isHotkeyPressed instead. Will be removed next major version.
 */
export function useIsHotkeyPressed() {
  return hotkeys.isPressed;
}
