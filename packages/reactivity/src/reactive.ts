import { isObject } from '@vue/shared'
import { mutableHandlers } from './baseHandlers'

export const reactiveMap = new WeakMap<object, any>()

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

export function reactive(target: object) {
  return createReactiveObject(target, mutableHandlers, reactiveMap)
}

function createReactiveObject(
  target: object,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<object, any>
) {

  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  const proxy = new Proxy(target, baseHandlers)
  proxy[ReactiveFlags.IS_REACTIVE] = true
  proxyMap.set(target, proxy)

  return proxy
}

/**
 * 将指定数据变为reactive数据
 */
export const toReactive = <T extends unknown>(value: T): T => isObject(value) ? reactive(value as object) : value

/**
 * 判断是否为一个reactive对象
 */
export const isReactive = (value): boolean => {
  return !!(value && value[ReactiveFlags.IS_REACTIVE])
}