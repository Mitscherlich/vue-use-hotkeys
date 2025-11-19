import type { HotkeysEvent, KeyHandler } from 'hotkeys-js';
import hotkeys from 'hotkeys-js';
import {
  type MaybeRef,
  type Ref,
  ref,
  unref,
  watchPostEffect,
} from 'vue';
import { useMounted } from './use-mounted';

type AvailableTags = 'INPUT' | 'TEXTAREA' | 'SELECT';

// 实现自定义过滤系统
hotkeys.filter = () => true;

function tagFilter({ target }: KeyboardEvent, enableOnTags?: AvailableTags[]) {
  const targetTagName = target && (target as HTMLElement).tagName;
  return Boolean(
    targetTagName &&
      enableOnTags &&
      enableOnTags.includes(targetTagName as AvailableTags),
  );
}

function isKeyboardEventTriggeredByInput(ev: KeyboardEvent) {
  return tagFilter(ev, ['INPUT', 'TEXTAREA', 'SELECT']);
}

export interface Options {
  /**
   * Main setting that determines if the hotkey is enabled or not. (Default: true)
   */
  enabled?: MaybeRef<boolean>;
  /**
   * A filter function returning whether the callback should get triggered or not. (Default: undefined)
   */
  filter?: typeof hotkeys.filter;
  /**
   * Prevent default browser behavior if the filter function returns false. (Default: true)
   */
  filterPreventDefault?: boolean;
  /**
   * Enable hotkeys on a list of tags. (Default: [])
   */
  enableOnTags?: MaybeRef<AvailableTags[]>;
  /**
   * Enable hotkeys on tags with contentEditable props. (Default: false)
   */
  enableOnContentEditable?: boolean;
  /**
   * Character to split keys in hotkeys combinations. (Default +)
   */
  splitKey?: string;
  /**
   * Scope. Currently not doing anything.
   */
  scope?: string;
  /**
   * Trigger on keyup event? (Default: undefined)
   */
  keyup?: boolean;
  /**
   * Trigger on keydown event? (Default: true)
   */
  keydown?: boolean;
}

export function useHotkeys<T extends Element>(
  keys: MaybeRef<string>,
  callback: KeyHandler,
  options?: Options,
): Ref<T | null>;
export function useHotkeys<T extends Element>(
  keys: MaybeRef<string>,
  callback: KeyHandler,
  deps?: unknown[],
): Ref<T | null>;
export function useHotkeys<T extends Element>(
  keys: MaybeRef<string>,
  callback: KeyHandler,
  options?: Options,
  deps?: unknown[],
): Ref<T | null>;
export function useHotkeys<T extends Element>(
  keys: MaybeRef<string>,
  callback: KeyHandler,
  options?: unknown[] | Options,
  deps?: unknown[],
): Ref<T | null> {
  // 解析参数
  if (Array.isArray(options)) {
    deps = options;
    options = undefined;
  }

  const {
    enableOnTags,
    filter,
    keyup,
    keydown,
    filterPreventDefault = true,
    enabled = true,
    enableOnContentEditable = false,
  } = (options as Options) || {};

  const elementRef = ref<T | null>(null);

  const onKeyboard = (
    keyboardEvent: KeyboardEvent,
    hotkeysEvent: HotkeysEvent,
  ): boolean => {
    // 检查自定义过滤器
    if (filter && !filter(keyboardEvent)) {
      return !filterPreventDefault;
    }

    // 检查是否在输入标签或 contentEditable 元素中
    if (
      (isKeyboardEventTriggeredByInput(keyboardEvent) &&
        !tagFilter(keyboardEvent, unref(enableOnTags))) ||
      ((keyboardEvent.target as HTMLElement)?.isContentEditable &&
        !enableOnContentEditable)
    ) {
      return true;
    }

    // 检查是否在目标元素内
    if (
      elementRef.value === null ||
      document.activeElement === elementRef.value ||
      elementRef.value?.contains(document.activeElement)
    ) {
      return callback(keyboardEvent, hotkeysEvent) !== false;
    }

    return false;
  };

  const isMounted = useMounted();

  // 使用 watchPostEffect 自动追踪依赖并处理绑定/解绑
  watchPostEffect((cleanup) => {
    if (!unref(isMounted)) return;

    // 如果禁用，解绑后返回
    if (!unref(enabled)) {
      hotkeys.unbind(unref(keys), onKeyboard);
      return;
    }

    // 访问自定义依赖以触发追踪
    if (deps) {
      for (const dep of deps) {
        void unref(dep);
      }
    }

    // 处理 keyup/keydown 选项
    const hotkeyOptions: Options = { ...options } as Options;
    if (keyup && keydown !== true) {
      hotkeyOptions.keydown = false;
    }

    // 绑定新的快捷键
    hotkeys(unref(keys), hotkeyOptions || {}, onKeyboard);

    // 清理函数：在依赖变化或组件卸载时解绑
    cleanup(() => {
      hotkeys.unbind(unref(keys), onKeyboard);
    });
  });

  return elementRef as Ref<T | null>;
}
