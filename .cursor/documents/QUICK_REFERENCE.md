# Vue Use Hotkeys - 快速参考

## 🚀 基本用法

```vue
<script setup>
import { useHotkeys } from 'vue-use-hotkeys'

// 全局快捷键
useHotkeys('ctrl+k', () => {
  console.log('触发!')
  return false // 返回 false 阻止默认行为
})

// 元素作用域
const ref = useHotkeys('enter', () => {
  console.log('在元素内触发')
})
</script>

<template>
  <div ref="ref">按 Enter</div>
</template>
```

## 📋 常用选项

```typescript
useHotkeys(keys, callback, {
  enabled: true,                    // 是否启用
  enableOnTags: ['INPUT'],          // 在输入框中启用
  enableOnContentEditable: false,   // 在可编辑元素中启用
  filter: (e) => true,              // 自定义过滤
  filterPreventDefault: true,       // 过滤时阻止默认行为
  splitKey: '+',                    // 分隔符
  keyup: false,                     // keyup 触发
  keydown: true,                    // keydown 触发
})
```

## 🎯 常见场景

### 1. 搜索框快捷键

```javascript
const searchOpen = ref(false)
useHotkeys('ctrl+k, cmd+k', () => {
  searchOpen.value = true
  return false // 阻止默认行为
})
```

### 2. 保存快捷键

```javascript
useHotkeys('ctrl+s, cmd+s', () => {
  save()
  return false // 阻止默认行为
})
```

### 3. 模态框 ESC 关闭

```javascript
const modalOpen = ref(false)
useHotkeys('esc', () => {
  modalOpen.value = false
}, { enabled: modalOpen })
```

### 4. 表单提交

```javascript
const formRef = useHotkeys('ctrl+enter', () => {
  submitForm()
  return false // 阻止默认行为
}, { enableOnTags: ['INPUT', 'TEXTAREA'] })
```

### 5. 响应式快捷键

```javascript
const key = ref('ctrl+k')
useHotkeys(key, () => {
  console.log('当前快捷键:', key.value)
})
```

### 6. 带依赖的快捷键

```javascript
const count = ref(0)
useHotkeys('space', () => {
  console.log('当前:', count.value)
}, [count])
```

## ⌨️ 常用按键

| 类型 | 按键 |
|------|------|
| **修饰键** | `ctrl`, `shift`, `alt`, `cmd`, `option` |
| **功能键** | `f1`-`f19` |
| **导航键** | `up`, `down`, `left`, `right`, `home`, `end` |
| **编辑键** | `enter`, `tab`, `space`, `backspace`, `delete` |
| **特殊键** | `esc`, `insert`, `pageup`, `pagedown` |
| **字母** | `a`-`z` |
| **数字** | `0`-`9` |

## 🎨 组合键语法

```javascript
// 单个键
'a'

// 组合键
'ctrl+k'
'cmd+shift+p'

// 多个快捷键
'ctrl+s, cmd+s'

// 自定义分隔符
'ctrl-k'  // 配合 splitKey: '-'
```

## 💡 提示

1. **跨平台**: 同时支持 `ctrl` 和 `cmd`
   ```javascript
   useHotkeys('ctrl+k, cmd+k', callback)
   ```

2. **阻止默认行为**: 返回 `false` 即可
   ```javascript
   useHotkeys('ctrl+s', () => {
     save()
     return false  // 阻止浏览器保存，不需要调用 preventDefault()
   })
   ```

3. **动态控制**: 使用响应式变量
   ```javascript
   const enabled = ref(true)
   useHotkeys('k', callback, { enabled })
   ```

4. **输入框**: 默认在输入框中不触发
   ```javascript
   // 需要显式启用
   useHotkeys('enter', callback, {
     enableOnTags: ['INPUT']
   })
   ```

5. **元素作用域**: 只在特定元素内触发
   ```javascript
   const divRef = useHotkeys('k', callback)
   // <div ref="divRef">...</div>
   ```

## 🔧 TypeScript

```typescript
import { useHotkeys, type Options } from 'vue-use-hotkeys'
import type { KeyHandler } from 'hotkeys-js'

// 明确元素类型
const inputRef = useHotkeys<HTMLInputElement>('enter', callback)

// 自定义选项
const options: Options = {
  enabled: ref(true),
  enableOnTags: ['INPUT']
}
```

## 📦 签名

```typescript
// 基本用法
useHotkeys<T extends Element>(
  keys: MaybeRef<string>,
  callback: KeyHandler,
  options?: Options
): Ref<T | null>

// 带依赖
useHotkeys<T extends Element>(
  keys: MaybeRef<string>,
  callback: KeyHandler,
  deps?: unknown[]
): Ref<T | null>

// 完整用法
useHotkeys<T extends Element>(
  keys: MaybeRef<string>,
  callback: KeyHandler,
  options?: Options,
  deps?: unknown[]
): Ref<T | null>
```

## 🔗 更多信息

- [完整文档](./USAGE.md)
- [实现细节](./IMPLEMENTATION.md)
- [示例代码](./examples/)
- [hotkeys-js 文档](https://github.com/jaywcjlove/hotkeys-js)

