import { defineComponent } from 'vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { useHotkeys } from './index'

const HotKeysWithRef = defineComponent({
  name: 'HotKeysWithRef',
  props: ['onPress'],
  setup({ onPress }) {
    const ref = useHotkeys<HTMLElement>('a', onPress)
    return () => (
      <section ref={ref} tab-index={1} data-testid={'container'}>
        <input type="text" data-testid={'input'} />
      </section>
    )
  },
})

const HotkeysOnKeyup = defineComponent({
  name: 'HotkeysOnKeyup',
  props: ['keydown', 'keyup', 'onPress'],
  setup({ keydown, keyup, onPress }) {
    useHotkeys('a', onPress, { keyup, keydown })
    return () => (
      <input type="text" data-testid={'input'} />
    )
  },
})

const HotkeysOnInput = defineComponent({
  name: 'HotkeysOnInput',
  props: ['useTags', 'onPress'],
  setup({ useTags, onPress }) {
    useHotkeys('a', onPress, { enableOnTags: useTags ? ['INPUT'] : undefined })
    return () => (
      <input type="text" data-testid={'input'} />
    )
  },
})

const HotkeysFilteredOnInput = defineComponent({
  name: 'HotkeysFilteredOnInput',
  props: ['useTags', 'onPress'],
  setup({ useTags, onPress }) {
    useHotkeys('a', onPress, { enableOnTags: useTags ? ['TEXTAREA'] : undefined })
    return () => (
      <input type="text" data-testid={'input'} />
    )
  },
})

test('useHotkeys should listen to key presses', async () => {
  const callback = vitest.fn()
  await renderHook(() => useHotkeys('a', callback))
  await userEvent.keyboard('A')
  expect(callback).toHaveBeenCalledTimes(1)
})

test('useHotkeys should only fire when element is focused if a ref is set.', async () => {
  const onPress = vitest.fn()
  await render(<HotKeysWithRef onPress={onPress} />)
  await userEvent.keyboard('A')
  expect(onPress).not.toBeCalled()
  setActiveElement('container')
  await userEvent.keyboard('A')
  expect(onPress).toBeCalled()
})

test('useHotkeys correctly assign deps when used as third argument and options being omitted', async () => {
  let count = 0
  const callback = vitest.fn()
  await renderHook(() => useHotkeys('a', () => callback(++count), [count]))
  await userEvent.keyboard('A')
  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback.mock.calls[0][0]).toEqual(1)
  await userEvent.keyboard('A')
  expect(callback).toHaveBeenCalledTimes(2)
  expect(callback.mock.calls[1][0]).toEqual(2)
})

test('useHotkeys should use correct char to split combinations', async () => {
  const callback = vitest.fn()
  await renderHook(() => useHotkeys('Shift-A', callback, { splitKey: '-' }))
  await userEvent.keyboard('{Shift>}A{/Shift}')
  expect(callback).toHaveBeenCalledTimes(1)
  await userEvent.keyboard('{Shift>}A{/Shift}')
  expect(callback).toHaveBeenCalledTimes(2)
})

test('useHotkeys should use correctly assign options and deps argument when using all four arguments', async () => {
  const callback = vitest.fn()
  await renderHook(() => useHotkeys('shift-a', callback, { splitKey: '-' }, []))
  await userEvent.keyboard('{Shift>}A{/Shift}')
  expect(callback).toHaveBeenCalledTimes(1)
  await userEvent.keyboard('{Shift>}A{/Shift}')
  expect(callback).toHaveBeenCalledTimes(2)
  await userEvent.keyboard('{Shift>}A{/Shift}')
  expect(callback).toHaveBeenCalledTimes(3)
})

test('useHotkeys should only trigger once if neither keyup nor keydown are set', async () => {
  const onPress = vitest.fn()
  await render(<HotkeysOnKeyup onPress={onPress} />)
  await fireEvent.keyUp(document.body, { key: 'a', keyCode: 65 })
  expect(onPress).not.toHaveBeenCalled()
  await fireEvent.keyDown(document.body, { key: 'a', keyCode: 65 })
  expect(onPress).toHaveBeenCalled()
})

test('useHotkeys should only trigger once if keyup is set and keydown is not', async () => {
  const onPress = vitest.fn()
  await render(<HotkeysOnKeyup onPress={onPress} keyup={true} />)
  await fireEvent.keyDown(document.body, { key: 'a', keyCode: 65 })
  expect(onPress).not.toHaveBeenCalled()
  await fireEvent.keyUp(document.body, { key: 'a', keyCode: 65 })
  expect(onPress).toHaveBeenCalled()
})

test('useHotkeys should trigger twice if keyup and keydown is set to true', async () => {
  let called = false
  await render(<HotkeysOnKeyup onPress={() => (called = true)} keyup={true} keydown={true} />)
  await userEvent.keyboard('A')
  expect(called).toBe(true)
  await userEvent.keyboard('A')
  expect(called).toBe(true)
})

test('useHotkeys should be enabled on given form tags', async () => {
  const onPress = vitest.fn()
  await render(<HotkeysOnInput onPress={onPress} useTags={true} />)
  const input = document.querySelector('input')
  expect(input).not.toBe(null)
  await userEvent.keyboard('A')
  expect(onPress).toHaveBeenCalled()
})

test('useHotkeys should not be enabled on given form tags when filter specifies different input field', async () => {
  const onPress = vitest.fn()
  await render(<HotkeysFilteredOnInput onPress={onPress} useTags={true} />)
  await userEvent.type(screen.getByRole('textbox'), 'A')
  expect(onPress).toHaveBeenCalledTimes(0)
})

test('useHotkeys should not be enabled on given form tags when tags is not set', async () => {
  const onPress = vitest.fn()
  await render(<HotkeysFilteredOnInput onPress={onPress} useTags={false} />)
  await userEvent.type(screen.getByRole('textbox'), 'A')
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
