import { cleanup, fireEvent, render } from '@testing-library/vue';
import hotkeys from 'hotkeys-js';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';
import { useHotkeys } from '../src/use-hotkeys';

describe('useHotkeys', () => {
  beforeEach(() => {
    // 清理所有已注册的快捷键
    hotkeys.unbind();
  });

  afterEach(() => {
    hotkeys.unbind();
    cleanup();
  });

  test('基本快捷键绑定和触发', async () => {
    const callback = vi.fn();

    const TestComponent = defineComponent({
      setup() {
        useHotkeys('a', callback);
        return () => null;
      },
    });

    render(TestComponent);
    await nextTick();

    // 模拟按下 'a' 键
    fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA' });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.any(KeyboardEvent),
      expect.any(Object),
    );
  });

  test('响应式 keys 更新', async () => {
    let triggeredKey = '';
    const keys = ref('a');

    const TestComponent = defineComponent({
      setup() {
        useHotkeys(keys, (event) => {
          triggeredKey = event.key;
        });
        return () => null;
      },
    });

    render(TestComponent);
    await nextTick();

    // 触发 'a' 键
    fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA' });
    expect(triggeredKey).toBe('a');

    // 更新 keys 为 'b'
    keys.value = 'b';
    triggeredKey = '';
    await nextTick();
    await nextTick(); // 等待 watchPostEffect 完成

    // 'b' 应该触发
    fireEvent.keyDown(document.body, { key: 'b', code: 'KeyB' });
    expect(triggeredKey).toBe('b');
  });

  test('enabled 选项控制启用/禁用', async () => {
    const callback = vi.fn();

    const TestComponent = defineComponent({
      setup() {
        const enabled = ref(true);
        useHotkeys('a', callback, { enabled });
        return { enabled };
      },
      template: '<button @click="enabled = !enabled">Toggle</button>',
    });

    const { getByRole } = render(TestComponent);
    await nextTick();

    // 启用时应触发
    fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA' });
    expect(callback).toHaveBeenCalledTimes(1);

    // 禁用
    await fireEvent.click(getByRole('button'));
    await nextTick();

    // 禁用时不应触发
    fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA' });
    expect(callback).toHaveBeenCalledTimes(1);

    // 重新启用
    await fireEvent.click(getByRole('button'));
    await nextTick();

    // 重新启用后应触发
    fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA' });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('在输入标签中默认不触发', async () => {
    const callback = vi.fn();

    const TestComponent = defineComponent({
      setup() {
        useHotkeys('a', callback);
      },
      template: '<input type="text" data-testid="input" />',
    });

    const { container } = render(TestComponent);
    await nextTick();

    const input = container.querySelector('input') as HTMLInputElement;
    input.focus();

    // 在 input 中按键不应触发
    fireEvent.keyDown(input, { key: 'a', code: 'KeyA' });
    expect(callback).not.toHaveBeenCalled();
  });

  test('enableOnTags 允许在指定标签中触发', async () => {
    const callback = vi.fn();

    const TestComponent = defineComponent({
      setup() {
        useHotkeys('a', callback, { enableOnTags: ['INPUT'] });
      },
      template: '<input type="text" data-testid="input" />',
    });

    const { container } = render(TestComponent);
    await nextTick();

    const input = container.querySelector('input') as HTMLInputElement;
    input.focus();

    // 在 input 中按键应该触发
    fireEvent.keyDown(input, { key: 'a', code: 'KeyA' });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('enableOnContentEditable 控制可编辑元素', async () => {
    const callback = vi.fn();

    const TestComponent = defineComponent({
      setup() {
        useHotkeys('a', callback, { enableOnContentEditable: false });
      },
      template: '<div contenteditable="true" data-testid="editable"></div>',
    });

    const { getByTestId } = render(TestComponent);
    await nextTick();

    const editableDiv = getByTestId('editable') as HTMLDivElement;
    // 手动设置 isContentEditable 属性（jsdom 需要）
    Object.defineProperty(editableDiv, 'isContentEditable', {
      value: true,
      writable: false,
    });
    editableDiv.focus();

    // 默认在 contentEditable 中不触发
    fireEvent.keyDown(editableDiv, { key: 'a', code: 'KeyA' });
    expect(callback).not.toHaveBeenCalled();
  });

  test('enableOnContentEditable 为 true 时在可编辑元素中触发', async () => {
    const callback = vi.fn();

    const TestComponent = defineComponent({
      setup() {
        useHotkeys('a', callback, { enableOnContentEditable: true });
      },
      template: '<div contenteditable="true" data-testid="editable"></div>',
    });

    const { container } = render(TestComponent);
    await nextTick();

    const editableDiv = container.querySelector(
      '[contenteditable]',
    ) as HTMLDivElement;
    editableDiv.focus();

    // enableOnContentEditable 为 true 时应触发
    fireEvent.keyDown(editableDiv, { key: 'a', code: 'KeyA' });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('filter 选项自定义过滤', async () => {
    const callback = vi.fn();
    const filter = vi.fn(() => false);

    const TestComponent = defineComponent({
      setup() {
        useHotkeys('a', callback, { filter });
        return () => null;
      },
    });

    render(TestComponent);
    await nextTick();

    fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA' });

    expect(filter).toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalled();
  });

  test('filter 返回 true 时执行回调', async () => {
    const callback = vi.fn();
    const filter = vi.fn(() => true);

    const TestComponent = defineComponent({
      setup() {
        useHotkeys('a', callback, { filter });
        return () => null;
      },
    });

    render(TestComponent);
    await nextTick();

    fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA' });

    expect(filter).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('filterPreventDefault 控制默认行为', async () => {
    const callback = vi.fn(() => true);
    const filter = vi.fn(() => false);

    const TestComponent = defineComponent({
      setup() {
        useHotkeys('a', callback, { filter, filterPreventDefault: false });
        return () => null;
      },
    });

    render(TestComponent);
    await nextTick();

    // 使用 fireEvent 触发，这会通过 hotkeys.js
    fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA' });

    expect(filter).toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
  });

  test('元素引用作用域控制', async () => {
    const callback = vi.fn();

    const TestComponent = defineComponent({
      setup() {
        const elementRef = useHotkeys('a', callback);
        return { elementRef };
      },
      template:
        '<div ref="elementRef" data-testid="scope"><button data-testid="scopeButton">Focus Me</button></div>',
    });

    const { getByTestId } = render(TestComponent);
    await nextTick();

    const button = getByTestId('scopeButton');

    // 焦点在作用域内，应触发
    button.focus();
    fireEvent.keyDown(button, { key: 'a', code: 'KeyA' });
    expect(callback).toHaveBeenCalledTimes(1);

    // 创建并聚焦一个作用域外的元素
    const outsideElement = document.createElement('button');
    document.body.appendChild(outsideElement);
    outsideElement.focus();

    fireEvent.keyDown(outsideElement, { key: 'a', code: 'KeyA' });
    // 焦点在作用域外时不应触发
    expect(callback).toHaveBeenCalledTimes(1);

    // 清理
    document.body.removeChild(outsideElement);
  });

  test('组件卸载时清理事件监听器', async () => {
    const callback = vi.fn();

    const TestComponent = defineComponent({
      setup() {
        useHotkeys('a', callback);
        return () => null;
      },
    });

    const { unmount } = render(TestComponent);
    await nextTick();

    // 挂载时应触发
    fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA' });
    expect(callback).toHaveBeenCalledTimes(1);

    // 卸载组件
    unmount();
    await nextTick();

    // 卸载后不应触发
    fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA' });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('自定义依赖更新触发重新绑定', async () => {
    const dep = ref(0);

    const TestComponent = defineComponent({
      setup() {
        useHotkeys(
          'a',
          () => {
            dep.value++;
          },
          [dep],
        );
        return () => null;
      },
    });

    render(TestComponent);
    await nextTick();

    // 初始值
    expect(dep.value).toBe(0);
    fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA' });
    expect(dep.value).toBe(1);

    // 再次触发
    fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA' });
    expect(dep.value).toBe(2);
  });

  test('组合键支持', async () => {
    const callback = vi.fn();

    const TestComponent = defineComponent({
      setup() {
        useHotkeys('ctrl+s', callback);
        return () => null;
      },
    });

    render(TestComponent);
    await nextTick();

    // 模拟 Ctrl+S
    fireEvent.keyDown(document.body, {
      key: 's',
      code: 'KeyS',
      ctrlKey: true,
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('多个组件可以独立绑定快捷键', async () => {
    const results: string[] = [];

    const ComponentA = defineComponent({
      setup() {
        useHotkeys('shift+a', () => {
          results.push('shift+a');
        });
        return () => null;
      },
    });

    const ComponentB = defineComponent({
      setup() {
        useHotkeys('shift+b', () => {
          results.push('shift+b');
        });
        return () => null;
      },
    });

    // 渲染第一个组件
    render(ComponentA);
    await nextTick();

    // 触发 shift+a
    fireEvent.keyDown(document.body, {
      key: 'a',
      code: 'KeyA',
      shiftKey: true,
    });
    expect(results).toContain('shift+a');

    // 卸载并渲染第二个组件
    cleanup();
    results.length = 0; // 清空结果

    render(ComponentB);
    await nextTick();

    // 触发 shift+b
    fireEvent.keyDown(document.body, {
      key: 'b',
      code: 'KeyB',
      shiftKey: true,
    });
    expect(results).toContain('shift+b');
  });

  test('回调返回 false 阻止默认行为', async () => {
    const callback = vi.fn(() => false);

    const TestComponent = defineComponent({
      setup() {
        useHotkeys('a', callback);
        return () => null;
      },
    });

    render(TestComponent);
    await nextTick();

    const event = new KeyboardEvent('keydown', {
      key: 'a',
      code: 'KeyA',
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    document.body.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
    // 回调返回 false 应该阻止默认行为
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  test('响应式 enableOnTags 更新', async () => {
    const callback = vi.fn();
    const enableOnTags = ref<('INPUT' | 'TEXTAREA' | 'SELECT')[]>([]);

    const TestComponent = defineComponent({
      setup() {
        useHotkeys('a', callback, { enableOnTags });
      },
      template: '<input type="text" data-testid="input" />',
    });

    const { getByTestId } = render(TestComponent);
    await nextTick();

    const input = getByTestId('input') as HTMLInputElement;
    input.focus();

    // 初始状态，不应在 input 中触发
    fireEvent.keyDown(input, { key: 'a', code: 'KeyA' });
    expect(callback).not.toHaveBeenCalled();

    // 更新 enableOnTags
    enableOnTags.value = ['INPUT'];
    await nextTick();

    // 现在应该在 input 中触发
    fireEvent.keyDown(input, { key: 'a', code: 'KeyA' });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('keyup 选项支持', async () => {
    const callback = vi.fn();

    const TestComponent = defineComponent({
      setup() {
        useHotkeys('a', callback, { keyup: true, keydown: false });
        return () => null;
      },
    });

    render(TestComponent);
    await nextTick();

    // keydown 不应触发
    fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA' });
    expect(callback).not.toHaveBeenCalled();

    // keyup 应触发
    fireEvent.keyUp(document.body, { key: 'a', code: 'KeyA' });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('空 keys 不绑定', async () => {
    const callback = vi.fn();

    const TestComponent = defineComponent({
      setup() {
        useHotkeys('', callback);
        return () => null;
      },
    });

    render(TestComponent);
    await nextTick();

    fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA' });
    expect(callback).not.toHaveBeenCalled();
  });

  test('元素引用为 null 时全局触发', async () => {
    const callback = vi.fn();

    const TestComponent = defineComponent({
      setup() {
        const elementRef = useHotkeys('a', callback);
        return { elementRef };
      },
      template: '<div></div>',
    });

    render(TestComponent);
    await nextTick();

    // elementRef 为 null 时应该全局触发
    fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA' });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

