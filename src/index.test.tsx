import { defineComponent } from 'vue'
import { expect, fn, test } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import type { KeyHandler } from 'hotkeys-js'
import { useHotkeys } from './index'

const HotKeysWithRef = defineComponent<{ onPress: KeyHandler }>(({ onPress }) => {
  const ref = useHotkeys<HTMLElement>('a', onPress)

  return () => (
    <section ref={ref} tab-index={1} data-testid={'container'}>
      <input type="text" data-testid={'input'} />
    </section>
  )
})

HotKeysWithRef.props = { onPress: Function }

const HotkeysOnKeyup = defineComponent<{
  onPress: KeyHandler
  keydown?: boolean
  keyup?: boolean
}>(({ onPress, keydown, keyup }) => {
  useHotkeys('a', onPress, { keyup, keydown })

  return () => <input type="text" data-testid={'input'} />
})

HotkeysOnKeyup.props = {
  onPress: Function,
  keydown: Boolean,
  keyup: Boolean,
}

const HotkeysOnInput = defineComponent<{
  onPress: KeyHandler
  useTags?: boolean
}>(({ onPress, useTags }) => {
  useHotkeys('a', onPress, { enableOnTags: useTags ? ['INPUT'] : undefined })

  return () => <input type="text" data-testid={'input'} />
})

HotkeysOnInput.props = {
  onPress: Function,
  useTags: Boolean,
}

const HotkeysFilteredOnInput = defineComponent<{
  onPress: KeyHandler
  useTags?: boolean
}>(({ onPress, useTags }) => {
  useHotkeys('a', onPress, { enableOnTags: useTags ? ['TEXTAREA'] : undefined })

  return () => <input type="text" data-testid={'input'} />
})

HotkeysFilteredOnInput.props = {
  onPress: Function,
  useTags: Boolean,
}

test('useHotkeys should listen to key presses', () => {
  const callback = fn()

  renderHook(() => useHotkeys('a', callback))

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
})

test('useHotkeys should only fire when element is focused if a ref is set.', () => {
  const onPress = fn()

  render(<HotKeysWithRef onPress={onPress} />)

  userEvent.keyboard('A')

  expect(onPress).not.toBeCalled()

  setActiveElement('container')

  userEvent.keyboard('A')

  expect(onPress).toBeCalled()
})

test('useHotkeys correctly assign deps when used as third argument and options being omitted', async() => {
  let count = 0
  const callback = fn()

  renderHook(() => useHotkeys('a', () => callback(++count), [count]))

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback.mock.calls[0][0]).toEqual(1)

  userEvent.keyboard('A')

  expect(callback).toHaveBeenCalledTimes(2)
  expect(callback.mock.calls[1][0]).toEqual(2)
})

test('useHotkeys should use correct char to split combinations', () => {
  const callback = fn()

  renderHook(() => useHotkeys('Shift-A', callback, { splitKey: '-' }))

  userEvent.keyboard('{Shift>}A{/Shift}')

  expect(callback).toHaveBeenCalledTimes(1)

  userEvent.keyboard('{Shift>}A{/Shift}')

  expect(callback).toHaveBeenCalledTimes(2)
})

test('useHotkeys should use correctly assign options and deps argument when using all four arguments', () => {
  const callback = fn()

  renderHook(() => useHotkeys('shift-a', callback, { splitKey: '-' }, []))

  userEvent.keyboard('{Shift>}A{/Shift}')

  expect(callback).toHaveBeenCalledTimes(1)

  userEvent.keyboard('{Shift>}A{/Shift}')

  expect(callback).toHaveBeenCalledTimes(2)

  userEvent.keyboard('{Shift>}A{/Shift}')

  expect(callback).toHaveBeenCalledTimes(3)
})

test('useHotkeys should only trigger once if neither keyup nor keydown are set', () => {
  const onPress = fn()

  render(<HotkeysOnKeyup onPress={onPress} />)

  fireEvent.keyUp(document.body, { key: 'a', keyCode: 65 })

  expect(onPress).not.toHaveBeenCalled()

  fireEvent.keyDown(document.body, { key: 'a', keyCode: 65 })

  expect(onPress).toHaveBeenCalled()
})

test('useHotkeys should only trigger once if keyup is set and keydown is not', () => {
  const onPress = fn()

  render(<HotkeysOnKeyup onPress={onPress} keyup={true} />)

  fireEvent.keyDown(document.body, { key: 'a', keyCode: 65 })

  expect(onPress).not.toHaveBeenCalled()

  fireEvent.keyUp(document.body, { key: 'a', keyCode: 65 })

  expect(onPress).toHaveBeenCalled()
})

test('useHotkeys should trigger twice if keyup and keydown is set to true', () => {
  let called = false

  render(<HotkeysOnKeyup onPress={() => (called = true)} keyup={true} keydown={true} />)

  userEvent.keyboard('A')

  expect(called).toBe(true)

  userEvent.keyboard('A')

  expect(called).toBe(true)
})

test('useHotkeys should be enabled on given form tags', async() => {
  const onPress = fn()
  render(<HotkeysOnInput onPress={onPress} useTags={true} />)

  const input = document.querySelector('input')

  expect(input).not.toBe(null)

  userEvent.keyboard('A')

  expect(onPress).toHaveBeenCalled()
})

test('useHotkeys should not be enabled on given form tags when filter specifies different input field', async() => {
  const onPress = fn()
  render(<HotkeysFilteredOnInput onPress={onPress} useTags={true} />)

  userEvent.type(screen.getByRole('textbox'), 'A')

  expect(onPress).toHaveBeenCalledTimes(0)
})

test('useHotkeys should not be enabled on given form tags when tags is not set', async() => {
  const onPress = fn()

  render(<HotkeysFilteredOnInput onPress={onPress} useTags={false} />)

  userEvent.type(screen.getByRole('textbox'), 'A')

  expect(onPress).toHaveBeenCalledTimes(0)
})

function renderHook(pure: Function) {
  const TestComponent = defineComponent((props) => {
    pure(props)
    return () => null
  })

  return render(TestComponent)
}

function setActiveElement(el: string | HTMLElement) {
  if (typeof el === 'string')
    [el] = screen.getAllByTestId(el)

  if (!isFocusable(el)) {
    el.contentEditable = 'true'
    el.tabIndex = 1
  }
  el.focus()
}

function isFocusable(el: HTMLElement) {
  return (
    el.tagName.toUpperCase() === 'INPUT'
    || el.tagName.toUpperCase() === 'TEXTAREA'
    || el.tagName.toUpperCase() === 'SELECT'
    || el.contentEditable === 'true'
    || (el.getAttribute('tabindex') != null && parseInt(el.getAttribute('tabindex')!) >= 0)
  )
}
