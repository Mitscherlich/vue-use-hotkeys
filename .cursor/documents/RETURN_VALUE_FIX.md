# 返回值逻辑修正说明

## 🐛 问题描述

之前在过滤条件不满足时错误地返回了 `false`，这会阻止浏览器的默认行为。实际上，当这些过滤条件不满足时，我们只是**不触发用户回调**，但应该**允许浏览器继续正常处理该按键**。

## ✅ 修正内容

### 修改的返回值

| 检查条件 | 之前（错误） | 现在（正确） | 说明 |
|---------|------------|------------|------|
| 不在目标元素内 | `return false` ❌ | `return true` ✅ | 允许浏览器正常处理 |
| 快捷键被禁用 | `return false` ❌ | `return true` ✅ | 允许浏览器正常处理 |
| 在不允许的可编辑元素 | `return false` ❌ | `return true` ✅ | 允许浏览器正常处理 |
| 在不允许的输入标签 | `return false` ❌ | `return true` ✅ | 允许浏览器正常处理 |
| 自定义过滤器 | 根据 filterPreventDefault | 修正：false→阻止，true→允许 | 可配置 |

### 核心逻辑

```typescript
// ✅ 正确的逻辑
const createHandler = (): KeyHandler => {
  return (keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => {
    // 1. 不在目标元素内
    if (elementRef.value && !elementRef.value.contains(target)) {
      return true; // 允许浏览器正常处理这个按键
    }

    // 2. 快捷键被禁用
    if (!enabled) {
      return true; // 允许浏览器正常处理这个按键
    }

    // 3. 在不允许的可编辑元素中
    if (target.isContentEditable && !actualOptions.enableOnContentEditable) {
      return true; // 允许浏览器正常处理这个按键
    }

    // 4. 在不允许的输入标签中
    if (isInputTag && !enableOnTags.includes(tagName)) {
      return true; // 允许浏览器正常处理这个按键
    }

    // 5. 自定义过滤器
    if (actualOptions.filter && !shouldTrigger) {
      // filterPreventDefault !== false 时返回 false（阻止默认行为）
      // filterPreventDefault === false 时返回 true（允许默认行为）
      return actualOptions.filterPreventDefault !== false ? false : true;
    }

    // 6. 执行用户回调，由用户决定是否阻止默认行为
    return callback(keyboardEvent, hotkeysEvent);
  };
};
```

## 💡 为什么要这样做？

### 场景示例

#### 场景 1：在输入框中禁用快捷键

```javascript
// 用户在输入框中按 'a'
useHotkeys('a', () => {
  console.log('A 被按下')
})
// 默认情况下，在 INPUT 中不触发

// ❌ 之前：返回 false
// 结果：字母 'a' 无法输入到输入框！（默认行为被阻止）

// ✅ 现在：返回 true
// 结果：字母 'a' 正常输入到输入框（允许默认行为）
```

#### 场景 2：快捷键被禁用

```javascript
const enabled = ref(false)
useHotkeys('ctrl+s', () => {
  save()
  return false
}, { enabled })

// 用户按 Ctrl+S

// ❌ 之前：返回 false
// 结果：浏览器保存对话框无法弹出！

// ✅ 现在：返回 true
// 结果：浏览器正常弹出保存对话框
```

#### 场景 3：不在目标元素内

```javascript
const divRef = useHotkeys('enter', () => {
  console.log('在 div 内按 Enter')
})

// 用户在 div 外的输入框中按 Enter

// ❌ 之前：返回 false
// 结果：输入框的提交行为被阻止！

// ✅ 现在：返回 true
// 结果：输入框正常提交
```

## 🎯 正确的使用方式

### 用户控制是否阻止默认行为

```javascript
// ✅ 用户决定阻止默认行为
useHotkeys('ctrl+s', () => {
  save()
  return false // 阻止浏览器保存对话框
})

// ✅ 用户决定允许默认行为
useHotkeys('a', () => {
  console.log('A 被按下')
  // 不返回 false，允许字母正常输入
})

// ✅ 条件性控制
useHotkeys('enter', (event) => {
  if (shouldSubmit) {
    submitForm()
    return false // 阻止换行
  }
  // 否则允许换行
})
```

## 📊 修正结果

### 构建结果

- ✅ TypeScript 类型检查通过
- ✅ Biome 代码检查通过
- ✅ 构建成功：**3.1 kB** (1.0 kB gzipped)
- ✅ 逻辑正确

### 生成的代码

```javascript
// dist/use-hotkeys.js (压缩后)
if (elementRef.value && !elementRef.value.contains(target)) return true;
if (!enabled) return true;
if (target.isContentEditable && !actualOptions.enableOnContentEditable) return true;
if (isInputTag && !enableOnTags.includes(tagName)) return true;
if (actualOptions.filter) {
  const shouldTrigger = actualOptions.filter.call(hotkeys_js, keyboardEvent);
  if (!shouldTrigger) return false === actualOptions.filterPreventDefault;
}
return callback(keyboardEvent, hotkeysEvent);
```

## 🎉 总结

| 方面 | 说明 |
|------|------|
| **问题** | 过滤条件不满足时错误地阻止了默认行为 |
| **原因** | 返回 `false` 会阻止浏览器默认行为 |
| **修正** | 返回 `true` 允许浏览器正常处理按键 |
| **影响** | 用户体验更好，不会干扰正常的浏览器行为 |
| **兼容性** | ✅ 不影响已有代码 |

---

**修正日期**: 2025-11-19  
**修正内容**: 4 个过滤分支的返回值  
**影响**: 修复了过滤条件不满足时错误阻止默认行为的问题

