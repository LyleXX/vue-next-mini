import { hasChanged } from "@vue/shared"
import { Dep, createDep } from "./dep"
import { activeEffect, trackEffects, triggerEffects } from "./effect"
import { toReactive } from './reactive';

export interface Ref<T = any> {
  value: T
}

export function ref(value?: unknown) {
  return createRef(value, false)
}

function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue
  }
  return new RefImpl(rawValue, shallow)
}

class RefImpl<T>{
  private _value: T
  private _rawValue: T

  public dep?: Dep = undefined

  // 是否为ref类型数据的标记
  public readonly __v_isRef = true

  constructor(value: T, public readonly __v_isShallow: boolean) {
    // 如果 __v_isShallow 为 true，则 value 不会被转化为 reactive 数据，即如果当前 value 为复杂数据类型，则会失去响应性。对应官方文档 shallowRef ：https://cn.vuejs.org/api/reactivity-advanced.html#shallowref
    this._value = __v_isShallow ? value : toReactive(value)
    // 保存原始值
    this._rawValue = value
  }
  /**
   * get语法将对象属性绑定到查询该属性时将被调用的函数。
   * 即：xxx.value 时触发该函数
   */
  get value() {
    trackRefValue(this)
    return this._value
  }
  set value(newVal) {
    /**
     * newVal 为新数据
     * this._rawValue 为旧数据（原始数据）
     * 对比两个数据是否发生了变化
     */
    if (hasChanged(newVal, this._rawValue)) {
      // 如果发生了变化，则更新数据
      this._rawValue = newVal
      // 更新 .value的值
      this._value = toReactive(newVal)
      // 触发依赖
      triggerRefValue(this)
    }
  }

}

/**
 * 触发ref依赖
 */
export function triggerRefValue(ref) {

  if (ref.dep) {
    triggerEffects(ref.dep)
  }
}

/**
 * 为 ref 的value属性添加依赖
 */
export function trackRefValue(ref) {
  if (activeEffect) {
    trackEffects(ref.dep || (ref.dep = createDep()))
  }
}

/**
 * 是否为ref
 * @param r 
 * @returns 
 */
export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef === true)
}