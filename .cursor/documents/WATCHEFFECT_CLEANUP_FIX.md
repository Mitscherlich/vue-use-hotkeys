# watchEffect onCleanup 修复说明

## 🐛 问题：内存泄漏和重复绑定

### 错误的实现（❌）

```typescript
watchEffect(() => {
  if (!isMounted.value) return;

  // 访问响应式变量
  void unref(keys);
  void unref(actualOptions.enabled ?? true);
  void unref(actualOptions.enableOnTags ?? []);

  // 每次都会绑定新的事件处理函数
  bind(); // ❌ 问题：没有清理旧的绑定！
});
```

**问题分析**：

1. **第一次执行**：`keys = 'ctrl+k'` → 绑定 `ctrl+k`
2. **keys 变化**：`keys = 'ctrl+s'` → watchEffect 重新执行
   - 绑定 `ctrl+s` ✅
   - 但 `ctrl+k` 的绑定仍然存在！❌
3. **再次变化**：`keys = 'ctrl+a'` → 绑定 `ctrl+a`
   - 现在有 3 个绑定：`ctrl+k`、`ctrl+s`、`ctrl+a` ❌

**后果**：
- ❌ 内存泄漏（旧的事件处理函数没有被清理）
- ❌ 重复绑定（旧的快捷键仍然有效）
- ❌ 性能下降（每次变化都增加事件监听器）

## ✅ 正确的实现

### 使用 onCleanup 清理副作用

```typescript
watchEffect((onCleanup) => {
  if (!isMounted.value) return;

  // 访问响应式变量
  void unref(keys);
  void unref(actualOptions.enabled ?? true);
  void unref(actualOptions.enableOnTags ?? []);

  // 绑定新的快捷键
  bind();

  // 注册清理函数
  // 在下次 watchEffect 执行前或组件卸载时自动调用
  onCleanup(() => {
    unbind(); // ✅ 清理当前绑定
  });
});
```

**执行流程**：

1. **第一次执行**：`keys = 'ctrl+k'`
   - 绑定 `ctrl+k` ✅
   - 注册 cleanup：解绑 `ctrl+k`

2. **keys 变化**：`keys = 'ctrl+s'`
   - **先执行 cleanup**：解绑 `ctrl+k` ✅
   - 再执行 watchEffect：绑定 `ctrl+s` ✅
   - 注册新的 cleanup：解绑 `ctrl+s`

3. **再次变化**：`keys = 'ctrl+a'`
   - cleanup：解绑 `ctrl+s` ✅
   - watchEffect：绑定 `ctrl+a` ✅
   - 注册 cleanup：解绑 `ctrl+a`

4. **组件卸载**：
   - cleanup：解绑 `ctrl+a` ✅
   - onUnmounted：额外保险，再次解绑

**结果**：
- ✅ 始终只有一个活跃的绑定
- ✅ 旧的绑定被正确清理
- ✅ 无内存泄漏

## 🔍 onCleanup 的工作原理

### watchEffect 生命周期

```typescript
watchEffect((onCleanup) => {
  // 1. 执行副作用（如绑定事件）
  const id = setInterval(() => {}, 1000);

  // 2. 注册清理函数
  onCleanup(() => {
    // 3. 在下次执行前或组件卸载时调用
    clearInterval(id);
  });
});
```

### 执行时机

onCleanup 注册的函数会在以下时机执行：

1. **下次 watchEffect 执行前** - 清理上次的副作用
2. **watchEffect 停止时** - 清理最后的副作用
3. **组件卸载时** - 自动清理（因为 watchEffect 会停止）

### 为什么需要 onCleanup？

```typescript
// ❌ 错误：bind() 会创建新的绑定，但不清理旧的
watchEffect(() => {
  bind(); // 每次都增加绑定
});

// ✅ 正确：先清理旧的，再创建新的
watchEffect((onCleanup) => {
  bind(); // 创建新绑定
  onCleanup(() => {
    unbind(); // 清理这次的绑定
  });
});
```

## 📊 对比

### 没有 onCleanup（❌）

| 时间 | 操作 | 活跃的绑定 | 内存占用 |
|------|------|-----------|---------|
| T1 | keys = 'a' | `a` | 1x |
| T2 | keys = 'b' | `a`, `b` ❌ | 2x |
| T3 | keys = 'c' | `a`, `b`, `c` ❌ | 3x |
| T4 | 卸载 | `a`, `b`, `c` ❌ | 泄漏！|

### 使用 onCleanup（✅）

| 时间 | 操作 | 活跃的绑定 | 内存占用 |
|------|------|-----------|---------|
| T1 | keys = 'a' | `a` | 1x |
| T2 | keys = 'b' | `b` ✅ | 1x |
| T3 | keys = 'c' | `c` ✅ | 1x |
| T4 | 卸载 | (空) ✅ | 0x |

## 🎯 最佳实践

### 1. 始终使用 onCleanup

```typescript
// ✅ 任何有副作用的 watchEffect 都应该使用 onCleanup
watchEffect((onCleanup) => {
  // 创建副作用
  const subscription = api.subscribe();
  
  // 清理副作用
  onCleanup(() => {
    subscription.unsubscribe();
  });
});
```

### 2. onCleanup 的常见用途

```typescript
// 事件监听
watchEffect((onCleanup) => {
  const handler = () => {};
  window.addEventListener('resize', handler);
  onCleanup(() => window.removeEventListener('resize', handler));
});

// 定时器
watchEffect((onCleanup) => {
  const timer = setInterval(() => {}, 1000);
  onCleanup(() => clearInterval(timer));
});

// 订阅
watchEffect((onCleanup) => {
  const unsubscribe = store.subscribe(() => {});
  onCleanup(() => unsubscribe());
});

// DOM 操作
watchEffect((onCleanup) => {
  const el = document.createElement('div');
  document.body.appendChild(el);
  onCleanup(() => el.remove());
});
```

### 3. 与 onUnmounted 的关系

```typescript
// watchEffect 的 onCleanup 会在组件卸载时自动执行
// 所以 onUnmounted 通常是多余的，但可以作为额外保险
watchEffect((onCleanup) => {
  bind();
  onCleanup(() => unbind());
});

// 可选：额外的保险（虽然 onCleanup 已经够了）
onUnmounted(() => {
  unbind(); // 即使 onCleanup 已执行，unbind() 会检查并跳过
});
```

## 🧪 测试场景

### 场景 1：快速切换 keys

```typescript
const keys = ref('ctrl+a');

// 快速切换
keys.value = 'ctrl+b'; // 应该解绑 ctrl+a
keys.value = 'ctrl+c'; // 应该解绑 ctrl+b
keys.value = 'ctrl+d'; // 应该解绑 ctrl+c

// 验证：只有 ctrl+d 有效
```

### 场景 2：enabled 切换

```typescript
const enabled = ref(true);

enabled.value = false; // 应该解绑
enabled.value = true;  // 应该重新绑定
enabled.value = false; // 应该再次解绑

// 验证：没有内存泄漏
```

### 场景 3：组件卸载

```typescript
// 组件挂载
const component = mount(Component);

// 卸载组件
component.unmount();

// 验证：所有事件监听器已移除
```

## 📝 代码对比

### 修复前（❌）

```typescript
watchEffect(() => {
  if (!isMounted.value) return;
  void unref(keys);
  void unref(actualOptions.enabled ?? true);
  void unref(actualOptions.enableOnTags ?? []);
  if (actualDeps) {
    for (const dep of actualDeps) void unref(dep);
  }
  bind(); // ❌ 每次都绑定，没有清理
});
```

**问题**：
- 每次依赖变化都会调用 `bind()`
- 旧的绑定没有被清理
- 导致内存泄漏和重复绑定

### 修复后（✅）

```typescript
watchEffect((onCleanup) => {
  if (!isMounted.value) return;
  void unref(keys);
  void unref(actualOptions.enabled ?? true);
  void unref(actualOptions.enableOnTags ?? []);
  if (actualDeps) {
    for (const dep of actualDeps) void unref(dep);
  }
  bind(); // ✅ 绑定新的
  
  onCleanup(() => {
    unbind(); // ✅ 清理当前的绑定
  });
});
```

**改进**：
- ✅ 使用 onCleanup 清理副作用
- ✅ 保证始终只有一个活跃的绑定
- ✅ 无内存泄漏
- ✅ 组件卸载时自动清理

## 🎉 总结

### 关键要点

1. **watchEffect 创建副作用时必须使用 onCleanup**
2. **onCleanup 在下次执行前和组件卸载时自动调用**
3. **不使用 onCleanup 会导致内存泄漏和重复副作用**
4. **这是 Vue 3 Composition API 的核心最佳实践**

### 记忆规则

```
watchEffect + 副作用 = 必须 onCleanup
```

副作用包括：
- 事件监听器（addEventListener）
- 定时器（setInterval/setTimeout）
- 订阅（subscribe）
- DOM 操作
- 外部库的绑定（如 hotkeys-js）

---

**修复日期**: 2025-11-19  
**问题**: watchEffect 没有使用 onCleanup 导致内存泄漏  
**解决**: 使用 onCleanup 在依赖变化前清理副作用  
**影响**: ✅ 修复内存泄漏，保证正确的事件绑定行为

