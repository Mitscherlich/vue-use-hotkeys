# 变更日志

## [1.0.0] - 2025-11-19

### 🔧 改进

- **返回值处理优化**: 回调函数返回 `false` 即可阻止默认行为，无需显式调用 `event.preventDefault()`
- **内部过滤逻辑**: 所有过滤条件不满足时返回 `false`，更符合 hotkeys-js 标准
- **文档完善**: 更新所有示例使用推荐的返回 `false` 方式

### ✨ 新增功能

- **核心实现**: 完成 `useHotkeys` composable 的核心实现
- **响应式支持**: keys、enabled、enableOnTags 参数支持响应式
- **元素绑定**: 返回 ref 支持绑定到特定 DOM 元素
- **生命周期管理**: 自动处理组件挂载/卸载时的快捷键绑定
- **多种调用方式**: 支持函数重载，提供灵活的 API

### 🎯 配置选项

- `enabled` - 动态启用/禁用快捷键
- `filter` - 自定义过滤函数
- `filterPreventDefault` - 控制默认行为阻止
- `enableOnTags` - 在 INPUT/TEXTAREA/SELECT 中启用
- `enableOnContentEditable` - 在可编辑元素中启用
- `splitKey` - 自定义快捷键分隔符
- `keyup` / `keydown` - 控制触发时机
- `scope` - 作用域（已定义，待实现）

### 📝 文档

- README.md - 项目概览和快速开始
- USAGE.md - 详细使用指南和示例
- IMPLEMENTATION.md - 实现细节和技术文档
- examples/BasicExample.vue - 完整的交互式示例

### 🛠️ 开发工具

- TypeScript 支持完整
- 通过 Biome 代码检查
- 构建配置使用 Rslib
- 打包大小: 3.2 kB (1.0 kB gzipped)

### 📦 依赖

- Vue 3.2.0+ (peer dependency)
- hotkeys-js 4.0.0-beta.6

### 🔄 待完成

- [ ] 单元测试（等待审查后实现）
- [ ] Storybook 示例（等待审查后实现）
- [ ] scope 功能完整实现

---

### 技术栈

- **构建工具**: Rslib 0.18.0
- **类型检查**: TypeScript 5.9.3
- **代码质量**: Biome 2.3.2
- **测试框架**: Vitest 4.0.9 (已配置)
- **文档工具**: Storybook 9.1.16 (已配置)

### 模块格式

- ESM (ECMAScript Modules)
- 完整的 TypeScript 类型定义
- Tree-shakeable

### 浏览器兼容性

依赖 Vue 3 和现代浏览器特性：
- Chrome 64+
- Firefox 67+
- Safari 12+
- Edge 79+

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式（监听）
npm run dev

# 构建
npm run build

# 运行测试
npm run test

# 代码检查
npm run check

# 代码格式化
npm run format
```

---

**初始版本发布** 🎉

