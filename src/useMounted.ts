import { onMounted, onUnmounted, ref } from 'vue-demi'

export default function useMounted() {
  const isMounted = ref(false)
  onMounted(() => {
    isMounted.value = true
  })
  onUnmounted(() => {
    isMounted.value = false
  })
  return isMounted
}
