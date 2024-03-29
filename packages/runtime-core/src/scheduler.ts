// 对应的promise的pending状态
let isFlushPending = false
/**
 * promise的resolve函数
 */
const resolvedPromise = Promise.resolve() as Promise<any>
/**
 * 当前的执行任务
 */
let currentFlushPromise: Promise<void> | null = null
/**
 * 待执行的任务队列
 */
const pendingPreFlushCbs: Function[] = []
/**
 * 队列预处理函数
 */
export function queuePreFlushCb(cb: Function) {


  queueCb(cb, pendingPreFlushCbs)
}
/**
 * 队列处理函数
 */
function queueCb(cb: Function, pendingQueue: Function[]) {
  // 将所有的回调函数，放入队列中
  pendingQueue.push(cb)
  queueFlush()
}

/**
 * 依次处理队列中执行函数
 */
function queueFlush() {
  if (!isFlushPending) {
    isFlushPending = true
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}
/**
 * 处理队列
 */
function flushJobs() {
  isFlushPending = false
  flushPreFlushCbs()
}

/**
 * 依次处理队列中的任务
 */
export function flushPreFlushCbs() {
  if (pendingPreFlushCbs.length) {


    let activePreFlushCbs = [...new Set(pendingPreFlushCbs)]
    pendingPreFlushCbs.length = 0
    for (let i = 0; i < activePreFlushCbs.length; i++) {
      activePreFlushCbs[i]()
    }
  }
}