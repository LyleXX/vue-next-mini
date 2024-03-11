import { ComputedRefImpl } from "./computed"
import { Dep, createDep } from "./dep"
import { isArray } from "@vue/shared"

type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()

export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn)

  _effect.run()
}

export type EffectScheduler = (...args: any[]) => any

export let activeEffect: ReactiveEffect | undefined
export class ReactiveEffect<T = any>{
  constructor(public fn: () => T, public scheduler: EffectScheduler | null = null) { }

  /**
   * 存在该属性，则表示当前的effect是一个计算属性
   */
  computed?: ComputedRefImpl<T>
  run() {
    activeEffect = this

    return this.fn()
  }
}

/**
 * 收集依赖
 * @param target 
 * @param key 
 */
export function track(target: object, key: unknown) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, depsMap = new Map())
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = createDep()))
  }
  trackEffects(dep)

}

/**
 * 利用 dep 依次跟踪指定的 key 的所有 effect
 */
export function trackEffects(dep: Dep) {
  dep.add(activeEffect!)
}

/**
 * 触发依赖
 * @param target 
 * @param key 
 * @param newValue 
 */
export function trigger(target: object, key: unknown, newValue: unknown) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const dep: Dep | undefined = depsMap.get(key)
  if (!dep) return
  triggerEffects(dep)
}

/**
 * 触发指定的 dep 中的所有 effect
 */
export function triggerEffects(dep: Dep) {
  const effects = isArray(dep) ? dep : [...dep]

  // 依次触发所有 effect
  // for (const effect of effects) {
  // 	triggerEffect(effect)
  // }

  for (const effect of effects) {
    if (effect.computed) {
      triggerEffect(effect)
    }
  }
  for (const effect of effects) {
    if (!effect.computed) {
      triggerEffect(effect)
    }
  }
}

/**
 * 触发指定的 effect
 * @param effect 
 */
export function triggerEffect(effect: ReactiveEffect) {
  if (effect.scheduler) {
    effect.scheduler()
  } else {
    effect.run()
  }
}