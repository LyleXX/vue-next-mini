import { isFunction } from "@vue/shared"
import { Dep } from "./dep"
import { ReactiveEffect } from "./effect"
import { trackRefValue, triggerRefValue } from "./ref"

/**
 * 计算属性类
 */
export class ComputedRefImpl<T>{
  public dep?: Dep = undefined
  private _value!: T

  public readonly effect: ReactiveEffect<T>

  public readonly __v_isRef = true

  /**
   * 脏：为 false 时，表示需要触发依赖。为 true 时表示需要重新执行 run 方法，获取数据。即：数据脏了
   */
  public _dirty = true

  constructor(getter) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        // 数据脏了，需要触发依赖
        this._dirty = true
        // 触发依赖
        triggerRefValue(this)
      }
    })
    this.effect.computed = this
  }

  get value() {
    // 触发依赖
    trackRefValue(this)
    if (this._dirty) {
      // 数据脏了，重新执行 run 方法，获取数据
      this._dirty = false
      this._value = this.effect.run()
    }
    // 返回值
    return this._value
  }
}

/**
 * 计算属性
 */
export function computed(getterOrOptions) {
  let getter

  // 判断传入的参数是否为一个函数
  const onlyGetter = isFunction(getterOrOptions)
  if (onlyGetter) {
    getter = getterOrOptions
  }

  const cRef = new ComputedRefImpl(getter)

  return cRef as any
}