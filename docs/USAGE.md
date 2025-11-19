# Vue Use Hotkeys 使用指南

基于 [hotkeys-js](https://github.com/jaywcjlove/hotkeys-js) 的 Vue 3 Composition API 封装。

## 基本使用

### 1. 简单的快捷键绑定

```vue
<script setup>
import { useHotkeys } from 'vue-use-hotkeys'

useHotkeys('ctrl+k', (event, handler) => {
  console.log('Ctrl+K 被按下')
  return false // 返回 false 阻止默认行为
})
</script>
```

### 2. 绑定到特定元素

```vue
<script setup>
import { useHotkeys } from 'vue-use-hotkeys'

const elementRef = useHotkeys('enter', (event) => {
  console.log('在元素内按下 Enter')
})
</script>

<template>
  <div ref="elementRef">
    在这个 div 内按 Enter 键会触发回调
  </div>
</template>
```

### 3. 动态启用/禁用

```vue
<script setup>
import { ref } from 'vue'
import { useHotkeys } from 'vue-use-hotkeys'

const enabled = ref(true)

useHotkeys('ctrl+s', () => {
  console.log('保存')
}, { enabled })

// 稍后可以动态切换
const toggleHotkeys = () => {
  enabled.value = !enabled.value
}
</script>

<template>
  <button @click="toggleHotkeys">
    {{ enabled ? '禁用' : '启用' }} 快捷键
  </button>
</template>
```

### 4. 在输入框中启用快捷键

默认情况下，快捷键在 INPUT、TEXTAREA、SELECT 元素中不会触发。可以通过 `enableOnTags` 选项启用：

```vue
<script setup>
import { useHotkeys } from 'vue-use-hotkeys'

const inputRef = useHotkeys('ctrl+enter', (event) => {
  console.log('在输入框中按下 Ctrl+Enter')
  // 提交表单等操作
}, {
  enableOnTags: ['INPUT', 'TEXTAREA']
})
</script>

<template>
  <input 
    ref="inputRef" 
    type="text" 
    placeholder="按 Ctrl+Enter 提交"
  />
</template>
```

### 5. 使用多个快捷键组合

```vue
<script setup>
import { useHotkeys } from 'vue-use-hotkeys'

// 多个快捷键触发同一个回调
useHotkeys('ctrl+s, cmd+s', (event, handler) => {
  console.log('保存操作（支持 Windows 和 Mac）')
  console.log('触发的快捷键:', handler.key)
  return false // 返回 false 阻止默认行为
})
</script>
```

### 6. keyup 事件

```vue
<script setup>
import { useHotkeys } from 'vue-use-hotkeys'

useHotkeys('ctrl+a', (event, handler) => {
  if (event.type === 'keydown') {
    console.log('按下')
  }
  if (event.type === 'keyup') {
    console.log('释放')
  }
}, {
  keyup: true,
  keydown: true
})
</script>
```

### 7. 自定义过滤器

```vue
<script setup>
import { useHotkeys } from 'vue-use-hotkeys'

useHotkeys('enter', (event) => {
  console.log('Enter 被按下')
}, {
  filter: (event) => {
    const target = event.target
    // 只在包含特定 class 的元素中触发
    return target.classList.contains('hotkey-enabled')
  }
})
</script>
```

### 8. 使用自定义分隔符

```vue
<script setup>
import { useHotkeys } from 'vue-use-hotkeys'

// 使用 '-' 作为分隔符而不是 '+'
useHotkeys('ctrl-shift-k', () => {
  console.log('Ctrl+Shift+K')
}, {
  splitKey: '-'
})
</script>
```

### 9. 响应式快捷键

```vue
<script setup>
import { ref } from 'vue'
import { useHotkeys } from 'vue-use-hotkeys'

const currentKey = ref('ctrl+k')

useHotkeys(currentKey, () => {
  console.log('快捷键触发:', currentKey.value)
})

// 动态修改快捷键
const changeKey = () => {
  currentKey.value = 'ctrl+shift+k'
}
</script>

<template>
  <div>
    <p>当前快捷键: {{ currentKey }}</p>
    <button @click="changeKey">更改快捷键</button>
  </div>
</template>
```

### 10. 使用依赖项

```vue
<script setup>
import { ref } from 'vue'
import { useHotkeys } from 'vue-use-hotkeys'

const counter = ref(0)

// 当 counter 变化时，回调中会使用最新的值
useHotkeys('space', () => {
  console.log('当前计数:', counter.value)
  counter.value++
}, [counter])
</script>
```

## API 选项

### Options

```typescript
interface Options {
  // 是否启用快捷键（默认: true）
  enabled?: MaybeRef<boolean>
  
  // 自定义过滤函数
  filter?: (event: KeyboardEvent) => boolean
  
  // 当过滤器返回 false 时是否阻止默认行为（默认: true）
  filterPreventDefault?: boolean
  
  // 在哪些标签上启用快捷键（默认: []）
  enableOnTags?: MaybeRef<('INPUT' | 'TEXTAREA' | 'SELECT')[]>
  
  // 是否在 contentEditable 元素上启用（默认: false）
  enableOnContentEditable?: boolean
  
  // 快捷键分隔符（默认: '+'）
  splitKey?: string
  
  // 作用域（暂未实现）
  scope?: string
  
  // 是否在 keyup 时触发（默认: undefined）
  keyup?: boolean
  
  // 是否在 keydown 时触发（默认: true）
  keydown?: boolean
}
```

## 支持的按键

支持所有 hotkeys-js 的按键，包括：

- 修饰键: `ctrl`, `shift`, `alt`, `option`, `cmd`, `command`
- 字母: `a-z`
- 数字: `0-9`
- 功能键: `f1-f19`
- 特殊键: `enter`, `space`, `tab`, `esc`, `backspace`, `delete`, 等等

完整列表请参考 [hotkeys-js 文档](https://github.com/jaywcjlove/hotkeys-js)。

## 注意事项

1. **默认行为**: 在 INPUT、TEXTAREA、SELECT 元素中，快捷键默认不会触发。需要通过 `enableOnTags` 选项显式启用。

2. **作用域绑定**: 返回的 ref 可以绑定到任何元素，快捷键只在该元素及其子元素内触发。

3. **生命周期**: 快捷键会在组件挂载时自动绑定，卸载时自动解绑，无需手动管理。

4. **响应式**: `keys`、`enabled`、`enableOnTags` 选项支持响应式值（ref），会自动响应变化。

5. **阻止默认行为**: 在回调函数中 **返回 `false`** 可以阻止浏览器默认行为（如 Ctrl+S 保存页面）。这是 hotkeys-js 的标准方式，不需要调用 `event.preventDefault()`。

## 高级示例

### 全局搜索快捷键

```vue
<script setup>
import { ref } from 'vue'
import { useHotkeys } from 'vue-use-hotkeys'

const searchVisible = ref(false)
const searchInput = ref(null)

useHotkeys('ctrl+k, cmd+k', () => {
  searchVisible.value = !searchVisible.value
  if (searchVisible.value) {
    // 下一帧聚焦输入框
    setTimeout(() => searchInput.value?.focus(), 0)
  }
  return false // 阻止默认行为
})

// 在搜索框打开时，ESC 关闭
useHotkeys('esc', () => {
  searchVisible.value = false
}, {
  enabled: searchVisible
})
</script>

<template>
  <div v-if="searchVisible" class="search-modal">
    <input 
      ref="searchInput"
      type="text" 
      placeholder="搜索..."
    />
  </div>
</template>
```

### 快捷键提示

```vue
<script setup>
import { useHotkeys } from 'vue-use-hotkeys'

const shortcuts = [
  { key: 'ctrl+s', desc: '保存' },
  { key: 'ctrl+k', desc: '搜索' },
  { key: 'ctrl+/', desc: '显示帮助' }
]

shortcuts.forEach(({ key, desc }) => {
  useHotkeys(key, () => {
    console.log(desc)
    return false // 阻止默认行为
  })
})
</script>

<template>
  <div class="shortcuts-help">
    <h3>快捷键列表</h3>
    <ul>
      <li v-for="{ key, desc } in shortcuts" :key="key">
        <kbd>{{ key }}</kbd> - {{ desc }}
      </li>
    </ul>
  </div>
</template>
```

