import type { HotkeysEvent, KeyHandler } from 'hotkeys-js'
import hotkeys from 'hotkeys-js'
import type { MaybeRef, Ref } from 'vue-demi'
import { ref, unref, watchPostEffect } from 'vue-demi'
import useMounted from './useMounted'

type AvailableTags = 'INPUT' | 'TEXTAREA' | 'SELECT'

// We implement our own custom filter system.
hotkeys.filter = () => true

function tagFilter({ target }: KeyboardEvent, enableOnTags?: AvailableTags[]) {
  const targetTagName = target && (target as HTMLElement).tagName
  return Boolean((targetTagName && enableOnTags && enableOnTags.includes(targetTagName as AvailableTags)))
}

function isKeyboardEventTriggeredByInput(ev: KeyboardEvent) {
  return tagFilter(ev, ['INPUT', 'TEXTAREA', 'SELECT'])
}

export interface Options {
  enabled?: MaybeRef<boolean> // Main setting that determines if the hotkey is enabled or not. (Default: true)
  filter?: typeof hotkeys.filter // A filter function returning whether the callback should get triggered or not. (Default: undefined)
  filterPreventDefault?: boolean // Prevent default browser behavior if the filter function returns false. (Default: true)
  enableOnTags?: MaybeRef<AvailableTags[]> // Enable hotkeys on a list of tags. (Default: [])
  enableOnContentEditable?: boolean // Enable hotkeys on tags with contentEditable props. (Default: false)
  splitKey?: string // Character to split keys in hotkeys combinations. (Default +)
  scope?: string // Scope. Currently not doing anything.
  keyup?: boolean // Trigger on keyup event? (Default: undefined)
  keydown?: boolean // Trigger on keydown event? (Default: true)
}

export function useHotkeys<T extends Element>(keys: MaybeRef<string>, callback: KeyHandler, options?: Options): Ref<T | null>
export function useHotkeys<T extends Element>(keys: MaybeRef<string>, callback: KeyHandler, deps?: any[]): Ref<T | null>
export function useHotkeys<T extends Element>(keys: MaybeRef<string>, callback: KeyHandler, options?: Options, deps?: any[]): Ref<T | null>
export function useHotkeys<T extends Element>(keys: MaybeRef<string>, callback: KeyHandler, options?: any[] | Options, deps?: any[]): Ref<T | null> {
  if (Array.isArray(options)) {
    deps = options
    options = undefined
  }

  const {
    enableOnTags,
    filter,
    keyup,
    keydown,
    filterPreventDefault = true,
    enabled = true,
    enableOnContentEditable = false,
  } = options as Options || {}
  const _ref = ref<T | null>(null)

  const onKeyboard = (keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => {
    if (filter && !filter(keyboardEvent))
      return !filterPreventDefault

    // Check whether the hotkeys was triggered inside an input and that input is enabled or if it was triggered by a content editable tag and it is enabled.
    if (
      (isKeyboardEventTriggeredByInput(keyboardEvent) && !tagFilter(keyboardEvent, unref(enableOnTags)))
      || ((keyboardEvent.target as HTMLElement)?.isContentEditable && !enableOnContentEditable)
    )
      return true

    if (_ref.value === null || document.activeElement === _ref.value || _ref.value?.contains(document.activeElement)) {
      callback(keyboardEvent, hotkeysEvent)
      return true
    }

    return false
  }

  const isMounted = useMounted()

  watchPostEffect((cleanup) => {
    if (!unref(isMounted))
      return

    if (!unref(enabled)) {
      hotkeys.unbind(unref(keys), onKeyboard)
      return
    }

    // In this case keydown is likely undefined, so we set it to false, since hotkeys needs the `keydown` key to have a value.
    if (keyup && keydown !== true)
      (options as Options).keydown = false

    hotkeys(unref(keys), (options as Options) || {}, onKeyboard)

    cleanup(() => {
      hotkeys.unbind(unref(keys), onKeyboard)
    })
  })

  return _ref as Ref<T | null>
}
