import { watch, onMounted, onBeforeUnmount, isRef, ref, onUpdated } from 'vue-demi'

export type Destoryer = () => void
export type EffectCallback = () => void | Destoryer
export type DependenciesList = any[]

const noop = () => {}

export const useEffect = (fn: EffectCallback, deps: DependenciesList = []) => {
  let cb: typeof noop

  const effect = () => {
    if (typeof cb === 'function') {
      cb()
    }
    const response = fn()
    if (typeof response === 'function') {
      cb = response
    }
  }

  const source = deps.map(dep => isRef(dep) ? dep : ref(dep))

  const stopWatch = watch(source, effect)

  const stop = () => {
    stopWatch()
    cb?.()
  }

  onMounted(effect)

  onBeforeUnmount(stop)
}
