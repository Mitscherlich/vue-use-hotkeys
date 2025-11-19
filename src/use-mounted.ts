import { onMounted, onUnmounted, ref } from 'vue';

/**
 * 用于检测组件是否已挂载的 hook（内部使用）
 */
export function useMounted() {
  const isMounted = ref(false);

  onMounted(() => {
    isMounted.value = true;
  });

  onUnmounted(() => {
    isMounted.value = false;
  });

  return isMounted;
}

