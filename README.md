# Vue Use Hotkeys

🎹 基于 [hotkeys-js](https://github.com/jaywcjlove/hotkeys-js) 的 Vue 3 Composition API 快捷键库。

## ✨ 特性

- 🚀 完整的 TypeScript 支持
- 📦 轻量级，零依赖（除了 Vue 3 和 hotkeys-js）
- 🎯 响应式 API，支持动态快捷键
- 🎨 完全兼容 Vue 3 Composition API
- 🔧 灵活的配置选项
- 🌲 Tree-shakeable

## 📦 安装

```bash
npm install vue-use-hotkeys
# 或
pnpm install vue-use-hotkeys
# 或
yarn add vue-use-hotkeys
```

## 🚀 快速开始

```vue
<script setup>
import { useHotkeys } from 'vue-use-hotkeys'

// 全局快捷键
useHotkeys('ctrl+k', () => {
  console.log('Ctrl+K 被按下！')
  return false // 返回 false 阻止默认行为
})

// 绑定到特定元素
const elementRef = useHotkeys('enter', () => {
  console.log('在元素内按下 Enter')
})
</script>

<template>
  <div ref="elementRef">
    在这里按 Enter 键会触发回调
  </div>
</template>
```

## 📖 详细文档

查看 [docs/USAGE.md](./docs/USAGE.md) 了解更多使用示例和 API 文档。

## 🔑 支持的按键

- **修饰键**: `ctrl`, `shift`, `alt`, `option`, `cmd`, `command`
- **字母**: `a-z`
- **数字**: `0-9`
- **功能键**: `f1-f19`
- **特殊键**: `enter`, `space`, `tab`, `esc`, `backspace`, `delete`, 等

完整列表请参考 [hotkeys-js 文档](https://github.com/jaywcjlove/hotkeys-js)。

## 🛠️ 开发

安装依赖：

```bash
npm install
```

构建库：

```bash
npm run build
```

监听模式（开发）：

```bash
npm run dev
```

运行测试：

```bash
npm run test
```

代码检查：

```bash
npm run check
```

代码格式化：

```bash
npm run format
```

## 📝 API

### `useHotkeys<T extends Element>(keys, callback, options?): Ref<T | null>`

**参数：**

- `keys: MaybeRef<string>` - 快捷键字符串（支持响应式）
- `callback: KeyHandler` - 快捷键触发时的回调函数
- `options?: Options` - 配置选项（可选）

**返回值：**

- `Ref<T | null>` - 可以绑定到 DOM 元素的 ref

### Options

```typescript
interface Options {
  enabled?: MaybeRef<boolean>              // 是否启用（默认: true）
  filter?: (event: KeyboardEvent) => boolean  // 自定义过滤函数
  filterPreventDefault?: boolean           // 过滤时阻止默认行为（默认: true）
  enableOnTags?: MaybeRef<('INPUT' | 'TEXTAREA' | 'SELECT')[]>  // 在哪些标签启用
  enableOnContentEditable?: boolean        // 在 contentEditable 元素启用
  splitKey?: string                        // 快捷键分隔符（默认: '+'）
  scope?: string                           // 作用域（暂未实现）
  keyup?: boolean                          // keyup 时触发
  keydown?: boolean                        // keydown 时触发（默认: true）
}
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT

## 🙏 致谢

- [hotkeys-js](https://github.com/jaywcjlove/hotkeys-js) - 底层快捷键库
- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
